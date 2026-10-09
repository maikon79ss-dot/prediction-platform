import {
  FieldValue,
} from "firebase-admin/firestore";

import {
  adminDb,
} from "@/lib/firebase-admin";
import {
  trimUserPredictionHistory,
} from "@/lib/prediction-history-cleanup";
type Result =
  | "won"
  | "lost"
  | "refund";

type SettlementResponse = {
  status: number;
  body: any;
};

const competitionSlugs:
  Record<string, string> = {
    "English Premier League":
      "english-premier-league",

    "Bulgarian First League":
      "bulgarian-first-league",

    "Bulgarian Cup":
      "bulgarian-cup",

    "Spanish La Liga":
      "spanish-la-liga",

    "Bundesliga":
      "bundesliga",

    "French Ligue 1":
      "french-ligue-1",
  };

export async function settleSportScoreEvent(
  eventId: string
): Promise<SettlementResponse> {
  if (!eventId) {
    return {
      status: 400,
      body: {
        error:
          "Missing eventId",
      },
    };
  }

  const predictionsSnap =
    await adminDb
      .collection(
        "predictions"
      )
      .where(
        "eventId",
        "==",
        eventId
      )
      .get();

  const activePredictions =
    predictionsSnap.docs.filter(
      (docSnap) => {
        const data =
          docSnap.data();

        return (
          data.status ===
            "active" &&
          data.provider ===
            "sportscore"
        );
      }
    );

  if (
    activePredictions.length ===
    0
  ) {
    return {
      status: 200,
      body: {
        success: true,
        settled: 0,
        message:
          "No active predictions found.",
      },
    };
  }

  const firstPrediction =
    activePredictions[0].data();

  const matchDate =
    typeof firstPrediction
      .matchDateSofia ===
    "string"
      ? firstPrediction
          .matchDateSofia
      : "";

  const competition =
    typeof firstPrediction
      .competition ===
    "string"
      ? firstPrediction
          .competition
      : "";
if (
  competition ===
  "Bulgarian Cup"
) {
  return {
    status: 409,
    body: {
      error:
        "CUP_MANUAL_REVIEW",

      message:
        "Bulgarian Cup 1X2 predictions require the result after 90 minutes and must be reviewed manually.",
    },
  };
}
  if (
    !matchDate ||
    !competition
  ) {
    return {
      status: 400,
      body: {
        error:
          "Prediction is missing match information",
      },
    };
  }

  const competitionSlug =
    competitionSlugs[
      competition
    ];

  if (!competitionSlug) {
    return {
      status: 400,
      body: {
        error:
          "Unsupported competition",
        competition,
      },
    };
  }

  const response =
    await fetch(
      `https://sportscore.com/api/v1/fixtures/?sport=football&date=${matchDate}&competition=${competitionSlug}&limit=200`,
      {
        cache:
          "no-store",
      }
    );

  if (!response.ok) {
    return {
      status: 502,
      body: {
        error:
          "SportScore request failed",

        httpStatus:
          response.status,
      },
    };
  }

  const data =
    await response.json();

  const matches =
    Array.isArray(
      data.matches
    )
      ? data.matches
      : [];

  const match =
    matches.find(
      (item: any) =>
        item.url ===
        eventId
    );

  if (!match) {
    return {
      status: 404,
      body: {
        error:
          "Match not found",
      },
    };
  }

  const status =
    String(
      match.status ??
        ""
    ).toLowerCase();

  const statusText =
    String(
      match.status_text ??
        ""
    ).toLowerCase();

  const postponed =
    status.includes(
      "postpon"
    ) ||
    statusText.includes(
      "postpon"
    );

  if (postponed) {
    return {
      status: 409,
      body: {
        error:
          "MATCH_POSTPONED",

        message:
          "Prediction remains active.",
      },
    };
  }

  const cancelled =
    status.includes(
      "cancel"
    ) ||
    statusText.includes(
      "cancel"
    ) ||
    status.includes(
      "abandon"
    ) ||
    statusText.includes(
      "abandon"
    );

  let winningChoice:
    | "home"
    | "draw"
    | "away"
    | null = null;

  let homeGoals:
    | number
    | null = null;

  let awayGoals:
    | number
    | null = null;

  if (!cancelled) {
    if (
      status !==
      "finished"
    ) {
      return {
        status: 409,
        body: {
          error:
            "MATCH_NOT_FINISHED",

          status:
            match.status,

          statusText:
            match.status_text,
        },
      };
    }

    homeGoals =
      Number(
        match.home_score
      );

    awayGoals =
      Number(
        match.away_score
      );

    if (
      Number.isNaN(
        homeGoals
      ) ||
      Number.isNaN(
        awayGoals
      )
    ) {
      return {
        status: 500,
        body: {
          error:
            "INVALID_SCORE",
        },
      };
    }

    if (
      homeGoals >
      awayGoals
    ) {
      winningChoice =
        "home";
    } else if (
      awayGoals >
      homeGoals
    ) {
      winningChoice =
        "away";
    } else {
      winningChoice =
        "draw";
    }
  }

  const settlements:
    any[] = [];
const settledUserIds =
  new Set<string>();
  for (
    const predictionDoc
    of activePredictions
  ) {
    const predictionRef =
      adminDb
        .collection(
          "predictions"
        )
        .doc(
          predictionDoc.id
        );

    const settlement =
      await adminDb.runTransaction(
        async (
          transaction
        ) => {
          const predictionSnap =
            await transaction.get(
              predictionRef
            );

          if (
            !predictionSnap.exists
          ) {
            return null;
          }

          const prediction =
            predictionSnap.data();

          if (
            !prediction ||
            prediction.status !==
              "active"
          ) {
            return null;
          }

          const userId =
            typeof prediction
              .userId ===
            "string"
              ? prediction
                  .userId
              : "";

          if (!userId) {
            throw new Error(
              "USER_NOT_FOUND"
            );
          }

          const points =
            Number(
              prediction.points
            ) || 0;

          if (
            points <= 0
          ) {
            throw new Error(
              "INVALID_POINTS"
            );
          }

          const choice =
            String(
              prediction.choice
            );

          let finalResult:
            Result;

          let balanceCredit =
            0;

          if (cancelled) {
            finalResult =
              "refund";

            balanceCredit =
              points;
          } else {
            finalResult =
              choice ===
              winningChoice
                ? "won"
                : "lost";

            balanceCredit =
              finalResult ===
              "won"
                ? points * 2
                : 0;
          }

          const userRef =
            adminDb
              .collection(
                "users"
              )
              .doc(
                userId
              );

          const userSnap =
            await transaction.get(
              userRef
            );

          if (
            !userSnap.exists
          ) {
            throw new Error(
              "USER_NOT_FOUND"
            );
          }

          const userData =
            userSnap.data();

          const currentBalance =
            Number(
              userData
                ?.balance
            ) || 0;

          const currentLocked =
            Number(
              userData
                ?.lockedPoints
            ) || 0;

          const newBalance =
            currentBalance +
            balanceCredit;

          const newLocked =
            Math.max(
              0,
              currentLocked -
                points
            );

           const statsUpdate: Record<
  string,
  any
> = {
  "stats.totalPredictions":
    FieldValue.increment(1),
};

if (finalResult === "won") {
  statsUpdate[
    "stats.wonPredictions"
  ] = FieldValue.increment(1);
}

if (finalResult === "lost") {
  statsUpdate[
    "stats.lostPredictions"
  ] = FieldValue.increment(1);
}

if (finalResult === "refund") {
  statsUpdate[
    "stats.refundPredictions"
  ] = FieldValue.increment(1);
}

transaction.update(
  userRef,
  {
    balance:
      newBalance,

    lockedPoints:
      newLocked,

    ...statsUpdate,
  }
);
          transaction.update(
            predictionRef,
            {
              status:
                finalResult,

              result:
                finalResult,

              winningChoice,

              homeGoals,

              awayGoals,

              settlementBalanceChange:
                balanceCredit,

              settlementProvider:
                "sportscore",

              settledAt:
                FieldValue
                  .serverTimestamp(),
            }
          );

          const movementRef =
            adminDb
              .collection(
                "transactions"
              )
              .doc();

          transaction.set(
            movementRef,
            {
              userId,

              type:
                finalResult ===
                "won"
                  ? "win"
                  : finalResult ===
                    "refund"
                  ? "refund"
                  : "loss",

              description:
                finalResult ===
                "won"
                  ? `Correct prediction: ${prediction.event}`
                  : finalResult ===
                    "refund"
                  ? `Refund: ${prediction.event}`
                  : `Lost prediction: ${prediction.event}`,

              amount:
                balanceCredit,

              balanceAfter:
                newBalance,

              status:
                "completed",

              predictionId:
                predictionDoc.id,

              eventId,

              provider:
                "sportscore",

              createdAt:
                FieldValue
                  .serverTimestamp(),
            }
          );

          return {
            predictionId:
              predictionDoc.id,

            result:
              finalResult,

            choice,

            points,

            balanceCredit,
          };
        }
      );

   if (settlement) {
  settlements.push(
    settlement
  );

  const settledUserId =
    String(
      predictionDoc
        .data()
        .userId ?? ""
    );

  if (settledUserId) {
    settledUserIds.add(
      settledUserId
    );
  }
}
  }
  for (
  const userId
  of settledUserIds
) {
  try {
    await trimUserPredictionHistory(
      userId
    );
  } catch (error) {
    console.error(
      "PREDICTION HISTORY CLEANUP ERROR:",
      error
    );
  }
}
  return {
    status: 200,

    body: {
      success: true,

      eventId,

      match:
        `${match.home} vs ${match.away}`,

      status:
        match.status,

      score:
        cancelled
          ? null
          : {
              home:
                homeGoals,

              away:
                awayGoals,
            },

      winningChoice,

      settled:
        settlements.length,

      settlements,
    },
  };
}

export async function settlePendingSportScoreFootball() {
  const snapshot =
    await adminDb
      .collection(
        "predictions"
      )
      .where(
        "status",
        "==",
        "active"
      )
      .get();

  const activePredictions =
    snapshot.docs.filter(
      (docSnap) => {
        const data =
          docSnap.data();

        return (
          data.category ===
            "football" &&
          data.provider ===
            "sportscore" &&
          typeof data.eventId ===
            "string" &&
          data.eventId.length >
            0
        );
      }
    );

  const eventIds = [
    ...new Set(
      activePredictions.map(
        (docSnap) =>
          String(
            docSnap.data()
              .eventId
          )
      )
    ),
  ];

  if (
    eventIds.length === 0
  ) {
    return {
      success: true,

      activePredictions:
        0,

      checked:
        0,

      settledMatches:
        0,

      message:
        "No active SportScore football predictions.",
    };
  }

  const results:
    any[] = [];

  for (
    const eventId
    of eventIds
  ) {
    try {
      const result =
        await settleSportScoreEvent(
          eventId
        );

      results.push({
        eventId,

        httpStatus:
          result.status,

        ...result.body,
      });
    } catch (error) {
      results.push({
        eventId,

        httpStatus: 500,

        error:
          error instanceof
          Error
            ? error.message
            : "UNKNOWN_ERROR",
      });
    }
  }

  const settledMatches =
    results.filter(
      (result) =>
        result.success ===
          true &&
        Number(
          result.settled
        ) > 0
    ).length;

  return {
    success: true,

    activePredictions:
      activePredictions.length,

    checked:
      eventIds.length,

    settledMatches,

    results,
  };
}