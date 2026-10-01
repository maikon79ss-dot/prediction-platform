import {
  NextRequest,
  NextResponse,
} from "next/server";

import {
  FieldValue,
} from "firebase-admin/firestore";

import {
  adminDb,
} from "@/lib/firebase-admin";

type Result =
  | "won"
  | "lost"
  | "refund";

const competitionSlugs:
  Record<string, string> = {
    "English Premier League":
      "english-premier-league",

    "Bulgarian First League":
      "bulgarian-first-league",

    "Bulgarian Cup":
      "bulgarian-cup",
  };

export async function POST(
  request: NextRequest
) {
  try {
    const secret =
      request.headers.get(
        "x-settlement-secret"
      );

    const expectedSecret =
      process.env.SETTLEMENT_SECRET;

    if (
      !expectedSecret ||
      !secret ||
      secret !== expectedSecret
    ) {
      return NextResponse.json(
        {
          error:
            "Unauthorized",
        },
        {
          status: 401,
        }
      );
    }

    const body =
      await request.json();

    const eventId =
      typeof body.eventId ===
      "string"
        ? body.eventId
        : "";

    if (!eventId) {
      return NextResponse.json(
        {
          error:
            "Missing eventId",
        },
        {
          status: 400,
        }
      );
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
      return NextResponse.json({
        success: true,
        settled: 0,
        message:
          "No active predictions found.",
      });
    }

    const firstPrediction =
      activePredictions[0].data();

    const matchDate =
      typeof firstPrediction.matchDateSofia ===
      "string"
        ? firstPrediction.matchDateSofia
        : "";

    const competition =
      typeof firstPrediction.competition ===
      "string"
        ? firstPrediction.competition
        : "";

    if (
      !matchDate ||
      !competition
    ) {
      return NextResponse.json(
        {
          error:
            "Prediction is missing match information",
        },
        {
          status: 400,
        }
      );
    }

    const competitionSlug =
      competitionSlugs[
        competition
      ];

    if (
      !competitionSlug
    ) {
      return NextResponse.json(
        {
          error:
            "Unsupported competition",
          competition,
        },
        {
          status: 400,
        }
      );
    }

    const response =
      await fetch(
        `https://sportscore.com/api/v1/fixtures/?sport=football&date=${matchDate}&competition=${competitionSlug}&limit=200`,
        {
          cache:
            "no-store",
        }
      );

    if (
      !response.ok
    ) {
      return NextResponse.json(
        {
          error:
            "SportScore request failed",
          httpStatus:
            response.status,
        },
        {
          status: 502,
        }
      );
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
      return NextResponse.json(
        {
          error:
            "Match not found",
        },
        {
          status: 404,
        }
      );
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

    if (
      statusText.includes(
        "postpon"
      )
    ) {
      return NextResponse.json(
        {
          error:
            "MATCH_POSTPONED",
          message:
            "Prediction remains active.",
        },
        {
          status: 409,
        }
      );
    }

    const cancelled =
      statusText.includes(
        "cancel"
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
        return NextResponse.json(
          {
            error:
              "MATCH_NOT_FINISHED",
            status:
              match.status,
            statusText:
              match.status_text,
          },
          {
            status: 409,
          }
        );
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
        return NextResponse.json(
          {
            error:
              "INVALID_SCORE",
          },
          {
            status: 500,
          }
        );
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
      {
        predictionId:
          string;

        result:
          Result;

        choice:
          string;

        points:
          number;

        balanceCredit:
          number;
      }[] = [];

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

      let finalResult:
        Result =
        "lost";

      let balanceCredit =
        0;

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
            return;
          }

          const prediction =
            predictionSnap.data();

          if (
            !prediction ||
            prediction.status !==
              "active"
          ) {
            return;
          }

          const userId =
            typeof prediction.userId ===
            "string"
              ? prediction.userId
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

          transaction.update(
            userRef,
            {
              balance:
                newBalance,

              lockedPoints:
                newLocked,
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
                FieldValue.serverTimestamp(),
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
                FieldValue.serverTimestamp(),
            }
          );
        }
      );

      settlements.push({
        predictionId:
          predictionDoc.id,

        result:
          finalResult,

        choice:
          String(
            predictionDoc.data()
              .choice
          ),

        points:
          Number(
            predictionDoc.data()
              .points
          ) || 0,

        balanceCredit,
      });
    }

    return NextResponse.json({
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
    });
  } catch (error) {
    console.error(
      "SPORTSCORE SETTLEMENT ERROR:",
      error
    );

    return NextResponse.json(
      {
        error:
          "SportScore settlement failed",

        details:
          error instanceof
          Error
            ? error.message
            : "UNKNOWN_ERROR",
      },
      {
        status: 500,
      }
    );
  }
}