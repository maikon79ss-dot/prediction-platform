import { NextResponse } from "next/server";

export async function GET() {
  try {
    const apiKey =
      process.env.API_FOOTBALL_KEY;

    if (!apiKey) {
      return NextResponse.json(
        { error: "Missing API_FOOTBALL_KEY" },
        { status: 500 }
      );
    }

    const response = await fetch(
      "https://v3.football.api-sports.io/leagues?country=Bulgaria",
      {
        headers: {
          "x-apisports-key": apiKey,
        },
        cache: "no-store",
      }
    );

    if (!response.ok) {
      return NextResponse.json(
        {
          error: "API-Football request failed",
          status: response.status,
        },
        { status: 500 }
      );
    }

    const data = await response.json();

    const leagues = Array.isArray(data.response)
      ? data.response.map((item: any) => ({
          id: item.league?.id ?? null,
          name: item.league?.name ?? "",
          type: item.league?.type ?? "",
          country: item.country?.name ?? "",
          logo: item.league?.logo ?? "",
        }))
      : [];

    return NextResponse.json({
      count: leagues.length,
      leagues,
    });
  } catch (error) {
    console.error(
      "FOOTBALL LEAGUES ERROR:",
      error
    );

    return NextResponse.json(
      { error: "Failed to load leagues" },
      { status: 500 }
    );
  }
}