import { NextResponse } from "next/server";

export async function GET() {
  try {
    const response = await fetch(
      "https://sportscore.com/api/v1/fixtures/?sport=football&date=2026-09-20&status=finished&competition=english-premier-league&limit=50"
      {
        cache: "no-store",
      }
    );

    const data = await response.json();

    return NextResponse.json({
      httpStatus: response.status,
      count: data.count ?? 0,
      matches: Array.isArray(data.matches)
        ? data.matches.map((match: any) => ({
            home: match.home,
            away: match.away,
            homeScore: match.home_score,
            awayScore: match.away_score,
            status: match.status,
            statusText: match.status_text,
            time: match.time,
            competition: match.competition,
            url: match.url,
          }))
        : [],
    });
  } catch (error) {
    console.error(
      "SPORTSCORE RESULTS TEST ERROR:",
      error
    );

    return NextResponse.json(
      {
        error:
          "Failed to load finished football results",
      },
      {
        status: 500,
      }
    );
  }
}