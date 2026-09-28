import { NextResponse } from "next/server";

export async function GET() {
  try {
    const apiKey = process.env.API_FOOTBALL_KEY;

    if (!apiKey) {
      return NextResponse.json(
        { error: "Missing API_FOOTBALL_KEY" },
        { status: 500 }
      );
    }

    const leagues = [
      { id: 39, name: "Premier League" },
      { id: 172, name: "Bulgaria First League" },
      { id: 174, name: "Bulgaria Cup" },
    ];

    const results = [];

    for (const league of leagues) {
      const response = await fetch(
        `https://v3.football.api-sports.io/fixtures?league=${league.id}&season=2026&next=5`,
        {
          headers: {
            "x-apisports-key": apiKey,
          },
          cache: "no-store",
        }
      );

      const data = await response.json();

      results.push({
        leagueId: league.id,
        leagueName: league.name,
        count: Array.isArray(data.response)
          ? data.response.length
          : 0,
        matches: Array.isArray(data.response)
          ? data.response.map((item: any) => ({
              fixtureId: item.fixture?.id ?? null,
              date: item.fixture?.date ?? null,
              status: item.fixture?.status?.short ?? null,
              home: item.teams?.home?.name ?? "",
              away: item.teams?.away?.name ?? "",
            }))
          : [],
      });
    }

    return NextResponse.json({ results });
  } catch (error) {
    console.error("TEST FIXTURES ERROR:", error);

    return NextResponse.json(
      { error: "Failed to load test fixtures" },
      { status: 500 }
    );
  }
}