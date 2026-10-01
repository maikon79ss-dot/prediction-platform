import {
  NextRequest,
  NextResponse,
} from "next/server";

import {
  settlePendingSportScoreFootball,
} from "@/lib/football-sportscore-settlement";

export async function GET(
  request: NextRequest
) {
  try {
    const authHeader =
      request.headers.get(
        "authorization"
      );

    const cronSecret =
      process.env
        .CRON_SECRET;

    if (
      !cronSecret ||
      authHeader !==
        `Bearer ${cronSecret}`
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

    const result =
      await settlePendingSportScoreFootball();

    console.log(
      "FOOTBALL CRON RESULT:",
      JSON.stringify(
        result
      )
    );

    return NextResponse.json({
      cron: true,
      ...result,
    });
  } catch (error) {
    console.error(
      "FOOTBALL CRON ERROR:",
      error
    );

    return NextResponse.json(
      {
        error:
          "Football cron settlement failed",

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