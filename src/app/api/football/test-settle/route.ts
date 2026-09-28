import {
  NextResponse,
} from "next/server";

export async function GET() {
  try {
    const baseUrl =
      process.env.NEXT_PUBLIC_BASE_URL ??
      "https://prediction-platform-eight.vercel.app";

    const secret =
      process.env.SETTLEMENT_SECRET;

    if (!secret) {
      return NextResponse.json(
        {
          error:
            "Missing SETTLEMENT_SECRET",
        },
        {
          status: 500,
        }
      );
    }

    const response =
      await fetch(
        `${baseUrl}/api/football/settle-fixture`,
        {
          method: "POST",
          headers: {
            "Content-Type":
              "application/json",
            "x-settlement-secret":
              secret,
          },
          body: JSON.stringify({
            fixtureId: 1208074,
          }),
          cache: "no-store",
        }
      );

    const data =
      await response.json();

    return NextResponse.json(
      data,
      {
        status:
          response.status,
      }
    );
  } catch (error) {
    console.error(
      "TEST SETTLEMENT ERROR:",
      error
    );

    return NextResponse.json(
      {
        error:
          "Test settlement failed",
      },
      {
        status: 500,
      }
    );
  }
}