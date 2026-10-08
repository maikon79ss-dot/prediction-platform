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

export async function POST(
  request: NextRequest
) {
  try {
    const adminSecret =
      process.env.ADMIN_SECRET;

    const providedSecret =
      request.headers.get(
        "x-admin-secret"
      );

    if (
      !adminSecret ||
      providedSecret !==
        adminSecret
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

    const snapshot =
      await adminDb
        .collection(
          "predictions"
        )
        .where(
          "event",
          "==",
          "Arsenal vs Liverpool"
        )
        .get();

    const legacyPredictions =
      snapshot.docs.filter(
        (docSnap) => {
          const data =
            docSnap.data();

          return (
            data.status ===
              "active" &&
            !data.provider &&
            !data.eventId
          );
        }
      );

  if (
  legacyPredictions.length !==
  1
) {
  return NextResponse.json(
    {
      error:
        "LEGACY_PREDICTION_COUNT_MISMATCH",

      found:
        legacyPredictions.length,

      candidates:
        legacyPredictions.map(
          (docSnap) => {
            const data =
              docSnap.data();

            return {
              predictionId:
                docSnap.id,

              points:
                Number(
                  data.points
                ) || 0,

              createdAt:
                data.createdAt
                  ?.toDate?.()
                  ?.toISOString?.() ??
                null,
            };
          }
        ),

      message:
        "No changes were made.",
    },
    {
      status: 409,
    }
  );
}

    const predictionDoc =
      legacyPredictions[0];

    const predictionRef =
      adminDb
        .collection(
          "predictions"
        )
        .doc(
          predictionDoc.id
        );

    const result =
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
            throw new Error(
              "PREDICTION_NOT_FOUND"
            );
          }

          const prediction =
            predictionSnap.data();

          if (
            !prediction ||
            prediction.status !==
              "active"
          ) {
            throw new Error(
              "PREDICTION_NOT_ACTIVE"
            );
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
              userData?.lockedPoints
            ) || 0;

          if (
            currentLocked <
            points
          ) {
            throw new Error(
              "LOCKED_POINTS_MISMATCH"
            );
          }

          const newBalance =
            currentBalance +
            points;

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
                "refund",

              result:
                "refund",

              settlementProvider:
                "legacy-cleanup",

              cleanupReason:
                "Old static dashboard test prediction",

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
                "refund",

              description:
                "Refund old test prediction: Arsenal vs Liverpool",

              amount:
                points,

              balanceAfter:
                newBalance,

              status:
                "completed",

              predictionId:
                predictionDoc.id,

              provider:
                "legacy-cleanup",

              createdAt:
                FieldValue
                  .serverTimestamp(),
            }
          );

          return {
            predictionId:
              predictionDoc.id,

            refunded:
              points,

            balance:
              newBalance,

            lockedPoints:
              newLocked,
          };
        }
      );

    return NextResponse.json({
      success: true,
      ...result,
    });
  } catch (error) {
    console.error(
      "LEGACY FOOTBALL CLEANUP ERROR:",
      error
    );

    return NextResponse.json(
      {
        error:
          "Legacy prediction cleanup failed",

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