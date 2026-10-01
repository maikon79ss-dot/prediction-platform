import {
  NextRequest,
  NextResponse,
} from "next/server";

import {
  settlePendingSportScoreFootball,
} from "@/lib/football-sportscore-settlement";

export async function POST(
  request: NextRequest
) {
  try {
    const settlementSecret =
      process.env
        .SETTLEMENT_SECRET;

    const cronSecret =
      process.env
        .CRON_SECRET;

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

    const result =
      await settlePendingSportScoreFootball();

    return NextResponse.json(
      result
    );
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