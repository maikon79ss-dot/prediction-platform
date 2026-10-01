import {
  NextRequest,
  NextResponse,
} from "next/server";

import {
  settleSportScoreEvent,
} from "@/lib/football-sportscore-settlement";

export async function POST(
  request: NextRequest
) {
  try {
    const secret =
      request.headers.get(
        "x-settlement-secret"
      );

    const expectedSecret =
      process.env
        .SETTLEMENT_SECRET;

    if (
      !expectedSecret ||
      !secret ||
      secret !==
        expectedSecret
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

    const result =
      await settleSportScoreEvent(
        eventId
      );

    return NextResponse.json(
      result.body,
      {
        status:
          result.status,
      }
    );
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