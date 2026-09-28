import { NextResponse } from "next/server";
import { FieldValue } from "firebase-admin/firestore";
import { adminDb } from "@/lib/firebase-admin";

export async function GET() {
  try {
    const predictionId = "0QPwUh6ploHKCIQFHr17";

    const predictionRef = adminDb
      .collection("predictions")
      .doc(predictionId);

    await adminDb.runTransaction(async (transaction) => {
      const predictionSnap =
        await transaction.get(predictionRef);

      if (!predictionSnap.exists) {
        throw new Error("PREDICTION_NOT_FOUND");
      }

      const prediction = predictionSnap.data();

      if (!prediction) {
        throw new Error("PREDICTION_NOT_FOUND");
      }

      if (prediction.status !== "active") {
        throw new Error("ALREADY_SETTLED");
      }

      const userId = prediction.userId;
      const points = Number(prediction.points) || 0;

      const userRef = adminDb
        .collection("users")
        .doc(userId);

      const userSnap = await transaction.get(userRef);

      if (!userSnap.exists) {
        throw new Error("USER_NOT_FOUND");
      }

      const userData = userSnap.data();

      const currentBalance =
        Number(userData?.balance) || 0;

      const currentLockedPoints =
        Number(userData?.lockedPoints) || 0;

      const newBalance =
        currentBalance + points;

      const newLockedPoints =
        Math.max(0, currentLockedPoints - points);

      transaction.update(userRef, {
        balance: newBalance,
        lockedPoints: newLockedPoints,
      });

      transaction.update(predictionRef, {
        status: "refund",
        result: "refund",
        settlementBalanceChange: points,
        settledAt: FieldValue.serverTimestamp(),
      });

      const movementRef = adminDb
        .collection("transactions")
        .doc();

      transaction.set(movementRef, {
        userId,
        type: "refund",
        description: `Refund: ${prediction.event}`,
        amount: points,
        balanceAfter: newBalance,
        status: "completed",
        predictionId,
        createdAt: FieldValue.serverTimestamp(),
      });
    });

    return NextResponse.json({
      success: true,
      result: "refund",
    });
  } catch (error) {
    console.error("TEST REFUND ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "UNKNOWN_ERROR",
      },
      { status: 500 }
    );
  }
}