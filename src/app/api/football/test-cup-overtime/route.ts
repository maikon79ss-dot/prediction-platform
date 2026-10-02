import {
  NextResponse,
} from "next/server";

export async function GET() {
  try {
    const response =
      await fetch(
        "https://sportscore.com/api/v1/fixtures/?sport=football&date=2025-10-28&competition=bulgarian-cup&limit=200",
        {
          cache:
            "no-store",
        }
      );

    if (!response.ok) {
      return NextResponse.json(
        {
          error:
            "SportScore request failed",

          httpStatus:
            response.status,
        },
        {
          status: 502,
        }
      );
    }

    const data =
      await response.json();

    const matches =
      Array.isArray(
        data.matches
      )
        ? data.matches
        : [];

    const match =
      matches.find(
        (item: any) => {
          const home =
            String(
              item.home ?? ""
            ).toLowerCase();

          const away =
            String(
              item.away ?? ""
            ).toLowerCase();

          return (
            home.includes(
              "dunav"
            ) &&
            away.includes(
              "lokomotiv"
            )
          );
        }
      );

    if (!match) {
      return NextResponse.json({
        found: false,

        count:
          matches.length,

        matches:
          matches.map(
            (item: any) => ({
              home:
                item.home,

              away:
                item.away,

              homeScore:
                item.home_score,

              awayScore:
                item.away_score,

              status:
                item.status,

              statusText:
                item.status_text,

              url:
                item.url,
            })
          ),
      });
    }

    return NextResponse.json({
      found: true,

      knownRealResult: {
        regularTime:
          "1-1",

        afterExtraTime:
          "1-2",
      },

      sportScoreFields:
        Object.keys(
          match
        ),

      match,
    });
  } catch (error) {
    console.error(
      "CUP OVERTIME TEST ERROR:",
      error
    );

    return NextResponse.json(
      {
        error:
          "Failed to inspect cup match",

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