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

type ManualResult =
  | "home"
  | "draw"
  | "away"
  | "refund";

export async function POST(
  request: NextRequest
) {
  try {
    const secret =
      request.headers.get(
        "x-settlement-secret"
      );

    const adminSecret =
  process.env.ADMIN_SECRET;

const settlementSecret =
  process.env.SETTLEMENT_SECRET;

const adminHeader =
  request.headers.get(
    "x-admin-secret"
  );

const settlementHeader =
  request.headers.get(
    "x-settlement-secret"
  );

const authorized =
  Boolean(
    adminSecret &&
      adminHeader ===
        adminSecret
  ) ||
  Boolean(
    settlementSecret &&
      settlementHeader ===
        settlementSecret
  );

if (!authorized) {
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
      typeof body.eventId === "string"
        ? body.eventId
        : "";

    const result =
      typeof body.result === "string"
        ? body.result
        : "";

    const allowedResults:
      ManualResult[] = [
        "home",
        "draw",
        "away",
        "refund",
      ];

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

    if (
      !allowedResults.includes(
        result as ManualResult
      )
    ) {
      return NextResponse.json(
        {
          error:
            "Invalid result",
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

    const predictions =
      predictionsSnap.docs.filter(
        (docSnap) => {
          const data =
            docSnap.data();

          return (
            data.status ===
              "active" &&
            data.provider ===
              "sportscore" &&
            data.competition ===
              "Bulgarian Cup"
          );
        }
      );

    if (
      predictions.length === 0
    ) {
      return NextResponse.json({
        success: true,
        settled: 0,
        message:
          "No active Bulgarian Cup predictions found.",
      });
    }

    const settlements = [];

    for (
      const predictionDoc
      of predictions
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
              String(
                prediction.userId ??
                  ""
              );

            const points =
              Number(
                prediction.points
              ) || 0;

            const choice =
              String(
                prediction.choice ??
                  ""
              );

            if (
              !userId ||
              points <= 0
            ) {
              throw new Error(
                "INVALID_PREDICTION"
              );
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
                userData?.balance
              ) || 0;

            const currentLocked =
              Number(
                userData
                  ?.lockedPoints
              ) || 0;

            if (
              currentLocked <
              points
            ) {
              throw new Error(
                "LOCKED_POINTS_MISMATCH"
              );
            }

            let finalResult:
              | "won"
              | "lost"
              | "refund";

            let balanceCredit =
              0;

            if (
              result ===
              "refund"
            ) {
              finalResult =
                "refund";

              balanceCredit =
                points;
            } else {
              finalResult =
                choice === result
                  ? "won"
                  : "lost";

              balanceCredit =
                finalResult ===
                "won"
                  ? points * 2
                  : 0;
            }

            const newBalance =
              currentBalance +
              balanceCredit;

            const newLocked =
              currentLocked -
              points;

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

                winningChoice:
                  result ===
                  "refund"
                    ? null
                    : result,

                settlementProvider:
                  "manual-admin",

                manualSettlement:
                  true,

                settledAt:
                  FieldValue
                    .serverTimestamp(),
              }
            );

            const transactionRef =
              adminDb
                .collection(
                  "transactions"
                )
                .doc();

            transaction.set(
              transactionRef,
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
                  "manual-admin",

                createdAt:
                  FieldValue
                    .serverTimestamp(),
              }
            );

            return {
              predictionId:
                predictionDoc.id,

              choice,

              points,

              result:
                finalResult,

              balanceCredit,
            };
          }
        );

      if (settlement) {
        settlements.push(
          settlement
        );
      }
    }

    return NextResponse.json({
      success: true,

      eventId,

      winningChoice:
        result ===
        "refund"
          ? null
          : result,

      settled:
        settlements.length,

      settlements,
    });
  } catch (error) {
    console.error(
      "MANUAL CUP SETTLEMENT ERROR:",
      error
    );

    return NextResponse.json(
      {
        error:
          "Manual Bulgarian Cup settlement failed",

        details:
          error instanceof Error
            ? error.message
            : "UNKNOWN_ERROR",
      },
      {
        status: 500,
      }
    );
  }
}