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

    const response = await fetch(
      "https://v3.football.api-sports.io/fixtures?league=39&season=2026&next=5",
      {
        headers: {
          "x-apisports-key": apiKey,
        },
        cache: "no-store",
      }
    );

    const data = await response.json();

    return NextResponse.json({
      httpStatus: response.status,
      parameters: data.parameters ?? null,
      errors: data.errors ?? null,
      results: data.results ?? null,
      remainingToday:
        response.headers.get(
          "x-ratelimit-requests-remaining"
        ),
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
  } catch (error) {
    console.error("FIXTURE DEBUG ERROR:", error);

    return NextResponse.json(
      { error: "Failed to debug fixtures" },
      { status: 500 }
    );
  }
}