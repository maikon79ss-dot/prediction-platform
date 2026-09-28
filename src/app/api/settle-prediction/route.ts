import { NextRequest, NextResponse } from "next/server";
import { FieldValue } from "firebase-admin/firestore";
import { adminAuth, adminDb } from "@/lib/firebase-admin";

type SettlementResult = "won" | "lost" | "refund";

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get("authorization");

    if (!authHeader?.startsWith("Bearer ")) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const idToken = authHeader.substring(7);

    const decodedToken =
      await adminAuth.verifyIdToken(idToken);

    const body = await request.json();

    const predictionId =
      typeof body.predictionId === "string"
        ? body.predictionId
        : "";

    const result =
      body.result as SettlementResult;

    if (
      !predictionId ||
      !["won", "lost", "refund"].includes(result)
    ) {
      return NextResponse.json(
        { error: "Invalid request" },
        { status: 400 }
      );
    }

    const predictionRef = adminDb
      .collection("predictions")
      .doc(predictionId);

    await adminDb.runTransaction(
      async (transaction) => {
        const predictionSnap =
          await transaction.get(predictionRef);

        if (!predictionSnap.exists) {
          throw new Error("PREDICTION_NOT_FOUND");
        }

        const prediction =
          predictionSnap.data();

        if (!prediction) {
          throw new Error("PREDICTION_NOT_FOUND");
        }

        if (
          prediction.userId !== decodedToken.uid
        ) {
          throw new Error("FORBIDDEN");
        }

        if (prediction.status !== "active") {
          throw new Error(
            "PREDICTION_ALREADY_SETTLED"
          );
        }

        const points =
          Number(prediction.points) || 0;

        const userRef = adminDb
          .collection("users")
          .doc(decodedToken.uid);

        const userSnap =
          await transaction.get(userRef);

        if (!userSnap.exists) {
          throw new Error("USER_NOT_FOUND");
        }

        const userData = userSnap.data();

        const currentBalance =
          Number(userData?.balance) || 0;

        const currentLockedPoints =
          Number(userData?.lockedPoints) || 0;

        let balanceCredit = 0;

        if (result === "won") {
          balanceCredit = points * 2;
        }

        if (result === "refund") {
          balanceCredit = points;
        }

        const newBalance =
          currentBalance + balanceCredit;

        const newLockedPoints =
          Math.max(
            0,
            currentLockedPoints - points
          );

        transaction.update(userRef, {
          balance: newBalance,
          lockedPoints: newLockedPoints,
        });

        transaction.update(predictionRef, {
          status: result,
          result,
          settlementBalanceChange:
            balanceCredit,
          settledAt:
            FieldValue.serverTimestamp(),
        });

        const transactionRef = adminDb
          .collection("transactions")
          .doc();

        transaction.set(transactionRef, {
          userId: decodedToken.uid,
          type:
            result === "won"
              ? "win"
              : result === "refund"
              ? "refund"
              : "prediction_loss",
          description:
            result === "won"
              ? `Correct prediction: ${prediction.event}`
              : result === "refund"
              ? `Refund: ${prediction.event}`
              : `Lost prediction: ${prediction.event}`,
          amount: balanceCredit,
          balanceAfter: newBalance,
          status: "completed",
          predictionId,
          createdAt:
            FieldValue.serverTimestamp(),
        });
      }
    );

    return NextResponse.json({
      success: true,
      result,
    });
  } catch (error) {
    console.error(
      "SETTLEMENT ERROR:",
      error
    );

    const message =
      error instanceof Error
        ? error.message
        : "UNKNOWN_ERROR";

    if (message === "FORBIDDEN") {
      return NextResponse.json(
        { error: message },
        { status: 403 }
      );
    }

    if (
      message ===
        "PREDICTION_NOT_FOUND" ||
      message ===
        "USER_NOT_FOUND"
    ) {
      return NextResponse.json(
        { error: message },
        { status: 404 }
      );
    }

    if (
      message ===
      "PREDICTION_ALREADY_SETTLED"
    ) {
      return NextResponse.json(
        { error: message },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { error: "Settlement failed" },
      { status: 500 }
    );
  }
}