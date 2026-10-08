import {
  NextRequest,
  NextResponse,
} from "next/server";

import {
  adminDb,
} from "@/lib/firebase-admin";

export async function POST(
  request: NextRequest
) {
  try {
    const adminSecret =
      process.env.ADMIN_SECRET;

    const adminHeader =
      request.headers.get(
        "x-admin-secret"
      );

    if (
      !adminSecret ||
      adminHeader !== adminSecret
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

    const predictionsSnap =
      await adminDb
        .collection("predictions")
        .get();

    const statsByUser =
      new Map<
        string,
        {
          totalPredictions: number;
          wonPredictions: number;
          lostPredictions: number;
          refundPredictions: number;
        }
      >();

    for (
      const docSnap
      of predictionsSnap.docs
    ) {
      const data =
        docSnap.data();

      const userId =
        typeof data.userId === "string"
          ? data.userId
          : "";

      if (!userId) {
        continue;
      }

      const status =
        String(
          data.status ||
          data.result ||
          ""
        ).toLowerCase();

      let type:
        | "won"
        | "lost"
        | "refund"
        | null = null;

      if (status === "won") {
        type = "won";
      } else if (
        status === "lost"
      ) {
        type = "lost";
      } else if (
        status === "refund" ||
        status === "refunded" ||
        status === "cancelled"
      ) {
        type = "refund";
      }

      if (!type) {
        continue;
      }

      const current =
        statsByUser.get(
          userId
        ) || {
          totalPredictions: 0,
          wonPredictions: 0,
          lostPredictions: 0,
          refundPredictions: 0,
        };

      current.totalPredictions +=
        1;

      if (type === "won") {
        current.wonPredictions +=
          1;
      }

      if (type === "lost") {
        current.lostPredictions +=
          1;
      }

      if (type === "refund") {
        current.refundPredictions +=
          1;
      }

      statsByUser.set(
        userId,
        current
      );
    }

    const results = [];

    for (
      const [
        userId,
        stats,
      ] of statsByUser.entries()
    ) {
      const userRef =
        adminDb
          .collection("users")
          .doc(userId);

      const userSnap =
        await userRef.get();

      if (!userSnap.exists) {
        continue;
      }

      await userRef.update({
        "stats.totalPredictions":
          stats.totalPredictions,

        "stats.wonPredictions":
          stats.wonPredictions,

        "stats.lostPredictions":
          stats.lostPredictions,

        "stats.refundPredictions":
          stats.refundPredictions,
      });

      results.push({
        userId,
        ...stats,
      });
    }

    return NextResponse.json({
      success: true,
      usersUpdated:
        results.length,
      results,
    });
  } catch (error) {
    console.error(
      "BACKFILL STATS ERROR:",
      error
    );

    return NextResponse.json(
      {
        error:
          "Backfill failed",

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