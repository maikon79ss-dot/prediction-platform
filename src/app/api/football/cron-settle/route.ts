import {
  NextRequest,
  NextResponse,
} from "next/server";

export async function GET(
  request: NextRequest
) {
  try {
    const authHeader =
      request.headers.get(
        "authorization"
      );

    const cronSecret =
      process.env.CRON_SECRET;

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

    const settlementSecret =
      process.env.SETTLEMENT_SECRET;

    if (
      !settlementSecret
    ) {
      return NextResponse.json(
        {
          error:
            "SETTLEMENT_SECRET is missing",
        },
        {
          status: 500,
        }
      );
    }

    const response =
      await fetch(
        `${request.nextUrl.origin}/api/football/settle-pending`,
        {
          method:
            "POST",

          headers: {
            "Content-Type":
              "application/json",

            "x-settlement-secret":
              settlementSecret,
          },

          cache:
            "no-store",
        }
      );

    const data =
      await response.json();

    return NextResponse.json(
      {
        cron: true,
        ...data,
      },
      {
        status:
          response.status,
      }
    );
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