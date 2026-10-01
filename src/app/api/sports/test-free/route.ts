import { NextResponse } from "next/server";

export async function GET() {
  try {
    const date = "2026-10-10";

    const competitions = [
      {
        name: "English Premier League",
        slug: "english-premier-league",
      },
      {
        name: "Bulgarian First League",
        slug: "bulgarian-first-league",
      },
      {
        name: "Bulgarian Cup",
        slug: "bulgarian-cup",
      },
    ];

    const results = [];

    for (const competition of competitions) {
      const response = await fetch(
        `https://sportscore.com/api/v1/fixtures/?sport=football&date=${date}&status=upcoming&competition=${competition.slug}&limit=50`,
        {
          cache: "no-store",
        }
      );

      const data = await response.json();

      results.push({
        competition: competition.name,
        httpStatus: response.status,
        count: data.count ?? 0,
        matches: Array.isArray(data.matches)
          ? data.matches.map((match: any) => ({
              home: match.home,
              away: match.away,
              time: match.time,
              status: match.status,
              competition: match.competition,
              url: match.url,
            }))
          : [],
      });
    }

    return NextResponse.json({
      date,
      results,
    });
  } catch (error) {
    console.error(
      "SPORTSCORE TEST ERROR:",
      error
    );

    return NextResponse.json(
      {
        error: "Failed to load fixtures",
      },
      {
        status: 500,
      }
    );
  }
}