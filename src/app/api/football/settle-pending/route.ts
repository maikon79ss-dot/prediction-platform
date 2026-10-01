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
    const settlementSecret =
  process.env.SETTLEMENT_SECRET;

const cronSecret =
  process.env.CRON_SECRET;

const settlementHeader =
  request.headers.get(
    "x-settlement-secret"
  );

const authorizationHeader =
  request.headers.get(
    "authorization"
  );

const authorized =
  Boolean(
    settlementSecret &&
      settlementHeader ===
        settlementSecret
  ) ||
  Boolean(
    cronSecret &&
      authorizationHeader ===
        `Bearer ${cronSecret}`
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
      return NextResponse.json({
        success: true,
        checked: 0,
        settledMatches: 0,
        message:
          "No active SportScore football predictions.",
      });
    }

    const origin =
      request.nextUrl.origin;

    const results = [];

    for (
      const eventId
      of eventIds
    ) {
      try {
        const response =
          await fetch(
            `${origin}/api/football/settle-sportscore`,
            {
              method:
                "POST",

              headers: {
                "Content-Type":
                  "application/json",

               "x-settlement-secret":
  settlementSecret!,
              },

              body:
                JSON.stringify({
                  eventId,
                }),

              cache:
                "no-store",
            }
          );

        const data =
          await response.json();

        results.push({
          eventId,

          httpStatus:
            response.status,

          ...data,
        });
      } catch (
        error
      ) {
        results.push({
          eventId,

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
        (result: any) =>
          result.success ===
            true &&
          Number(
            result.settled
          ) > 0
      ).length;

    return NextResponse.json({
      success: true,

      activePredictions:
        activePredictions.length,

      checked:
        eventIds.length,

      settledMatches,

      results,
    });
  } catch (error) {
    console.error(
      "SETTLE PENDING FOOTBALL ERROR:",
      error
    );

    return NextResponse.json(
      {
        error:
          "Failed to settle pending football predictions",

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