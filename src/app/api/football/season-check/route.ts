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

    const leagueIds = [39, 172, 174];

    const results = [];

    for (const leagueId of leagueIds) {
      const response = await fetch(
        `https://v3.football.api-sports.io/leagues?id=${leagueId}`,
        {
          headers: {
            "x-apisports-key": apiKey,
          },
          cache: "no-store",
        }
      );

      const data = await response.json();

      const item = data.response?.[0];

      results.push({
        leagueId,
        name: item?.league?.name ?? "",
        country: item?.country?.name ?? "",
        seasons:
          item?.seasons?.map((season: any) => ({
            year: season.year,
            start: season.start,
            end: season.end,
            current: season.current,
          })) ?? [],
      });
    }

    return NextResponse.json({ results });
  } catch (error) {
    console.error("SEASON CHECK ERROR:", error);

    return NextResponse.json(
      { error: "Failed to check seasons" },
      { status: 500 }
    );
  }
}