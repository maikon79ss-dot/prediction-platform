import {
  NextRequest,
  NextResponse,
} from "next/server";

import { FieldValue } from "firebase-admin/firestore";
import { adminDb } from "@/lib/firebase-admin";

type PredictionResult =
  | "won"
  | "lost";

type Choice =
  | "home"
  | "draw"
  | "away";

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
          error: "Unauthorized",
        },
        {
          status: 401,
        }
      );
    }

    const apiKey =
      process.env.API_FOOTBALL_KEY;

    if (!apiKey) {
      return NextResponse.json(
        {
          error:
            "Missing API_FOOTBALL_KEY",
        },
        {
          status: 500,
        }
      );
    }

    const body =
      await request.json();

    const fixtureId =
      Number(body.fixtureId);

    if (
      !Number.isInteger(fixtureId) ||
      fixtureId <= 0
    ) {
      return NextResponse.json(
        {
          error:
            "Invalid fixtureId",
        },
        {
          status: 400,
        }
      );
    }

    const footballResponse =
      await fetch(
        `https://v3.football.api-sports.io/fixtures?id=${fixtureId}`,
        {
          headers: {
            "x-apisports-key":
              apiKey,
          },
          cache: "no-store",
        }
      );

    const footballData =
      await footballResponse.json();

    if (
      footballData.errors &&
      Object.keys(
        footballData.errors
      ).length > 0
    ) {
      return NextResponse.json(
        {
          error:
            "API Football error",
          details:
            footballData.errors,
        },
        {
          status: 400,
        }
      );
    }

    const fixture =
      footballData.response?.[0];

    if (!fixture) {
      return NextResponse.json(
        {
          error:
            "Fixture not found",
        },
        {
          status: 404,
        }
      );
    }

    const fixtureStatus =
      fixture.fixture?.status?.short;

    const finishedStatuses = [
      "FT",
      "AET",
      "PEN",
    ];

    if (
      !finishedStatuses.includes(
        fixtureStatus
      )
    ) {
      return NextResponse.json(
        {
          error:
            "Fixture is not finished",
          fixtureStatus,
        },
        {
          status: 409,
        }
      );
    }

    const homeGoals =
      Number(
        fixture.goals?.home
      );

    const awayGoals =
      Number(
        fixture.goals?.away
      );

    if (
      Number.isNaN(homeGoals) ||
      Number.isNaN(awayGoals)
    ) {
      return NextResponse.json(
        {
          error:
            "Invalid fixture score",
        },
        {
          status: 500,
        }
      );
    }

    let winningChoice: Choice;

    if (
      homeGoals > awayGoals
    ) {
      winningChoice = "home";
    } else if (
      awayGoals > homeGoals
    ) {
      winningChoice = "away";
    } else {
      winningChoice = "draw";
    }

    const predictionsSnap =
      await adminDb
        .collection(
          "predictions"
        )
        .where(
          "fixtureId",
          "==",
          fixtureId
        )
        .get();

    const activePredictions =
      predictionsSnap.docs.filter(
        (docSnap) =>
          docSnap.data()
            .status === "active"
      );

    if (
      activePredictions.length ===
      0
    ) {
      return NextResponse.json({
        success: true,
        fixtureId,
        fixtureStatus,
        score: {
          home: homeGoals,
          away: awayGoals,
        },
        winningChoice,
        settled: 0,
        message:
          "No active predictions found.",
      });
    }

    const settlements: {
      predictionId: string;
      result: PredictionResult;
      choice: string;
      points: number;
      balanceCredit: number;
    }[] = [];

    for (
      const predictionDoc
      of activePredictions
    ) {
      const predictionId =
        predictionDoc.id;

      const predictionRef =
        adminDb
          .collection(
            "predictions"
          )
          .doc(
            predictionId
          );

      let settlementResult:
        PredictionResult =
        "lost";

      let balanceCredit = 0;

      await adminDb.runTransaction(
        async (transaction) => {
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

          if (points <= 0) {
            throw new Error(
              "INVALID_POINTS"
            );
          }

          const choice =
            String(
              prediction.choice
            );

          settlementResult =
            choice ===
            winningChoice
              ? "won"
              : "lost";

          balanceCredit =
            settlementResult ===
            "won"
              ? points * 2
              : 0;

          const userRef =
            adminDb
              .collection(
                "users"
              )
              .doc(userId);

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

          const currentLockedPoints =
            Number(
              userData
                ?.lockedPoints
            ) || 0;

          const newBalance =
            currentBalance +
            balanceCredit;

          const newLockedPoints =
            Math.max(
              0,
              currentLockedPoints -
                points
            );

          transaction.update(
            userRef,
            {
              balance:
                newBalance,
              lockedPoints:
                newLockedPoints,
            }
          );

          transaction.update(
            predictionRef,
            {
              status:
                settlementResult,
              result:
                settlementResult,

              winningChoice,

              homeGoals,
              awayGoals,

              settlementBalanceChange:
                balanceCredit,

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
                settlementResult ===
                "won"
                  ? "win"
                  : "loss",

              description:
                settlementResult ===
                "won"
                  ? `Correct prediction: ${prediction.event}`
                  : `Lost prediction: ${prediction.event}`,

              amount:
                balanceCredit,

              balanceAfter:
                newBalance,

              status:
                "completed",

              predictionId,

              fixtureId,

              createdAt:
                FieldValue.serverTimestamp(),
            }
          );
        }
      );

      settlements.push({
        predictionId,

        result:
          settlementResult,

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

      fixtureId,

      fixtureStatus,

      match:
        `${fixture.teams?.home?.name ?? ""} vs ${fixture.teams?.away?.name ?? ""}`,

      score: {
        home: homeGoals,
        away: awayGoals,
      },

      winningChoice,

      settled:
        settlements.length,

      settlements,
    });
  } catch (error) {
    console.error(
      "FOOTBALL SETTLEMENT ERROR:",
      error
    );

    const message =
      error instanceof Error
        ? error.message
        : "UNKNOWN_ERROR";

    return NextResponse.json(
      {
        error:
          "Football settlement failed",
        details: message,
      },
      {
        status: 500,
      }
    );
  }
}