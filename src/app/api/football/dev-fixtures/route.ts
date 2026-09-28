import { NextResponse } from "next/server";

type FixtureItem = {
  fixture?: {
    id?: number;
    date?: string;
    status?: {
      short?: string;
      long?: string;
    };
  };
  league?: {
    id?: number;
    name?: string;
    country?: string;
  };
  teams?: {
    home?: {
      id?: number;
      name?: string;
    };
    away?: {
      id?: number;
      name?: string;
    };
  };
  goals?: {
    home?: number | null;
    away?: number | null;
  };
};

export async function GET() {
  try {
    const apiKey = process.env.API_FOOTBALL_KEY;

    if (!apiKey) {
      return NextResponse.json(
        { error: "Missing API_FOOTBALL_KEY" },
        { status: 500 }
      );
    }

    const leagues = [39, 172, 174];

    const from = "2024-09-28";
    const to = "2024-10-05";

    const allMatches: any[] = [];

    for (const leagueId of leagues) {
      const response = await fetch(
        `https://v3.football.api-sports.io/fixtures?league=${leagueId}&season=2024&from=${from}&to=${to}`,
        {
          headers: {
            "x-apisports-key": apiKey,
          },
          cache: "no-store",
        }
      );

      const data = await response.json();

      const fixtures: FixtureItem[] =
        Array.isArray(data.response)
          ? data.response
          : [];

      for (const item of fixtures) {
        allMatches.push({
          fixtureId: item.fixture?.id ?? null,
          date: item.fixture?.date ?? null,
          status: item.fixture?.status?.short ?? null,
          statusLong:
            item.fixture?.status?.long ?? null,

          league: {
            id: item.league?.id ?? null,
            name: item.league?.name ?? "",
            country:
              item.league?.country ?? "",
          },

          home: {
            id:
              item.teams?.home?.id ?? null,
            name:
              item.teams?.home?.name ?? "",
          },

          away: {
            id:
              item.teams?.away?.id ?? null,
            name:
              item.teams?.away?.name ?? "",
          },

          goals: {
            home:
              item.goals?.home ?? null,
            away:
              item.goals?.away ?? null,
          },
        });
      }
    }

    allMatches.sort((a, b) => {
      const aTime = a.date
        ? new Date(a.date).getTime()
        : 0;

      const bTime = b.date
        ? new Date(b.date).getTime()
        : 0;

      return aTime - bTime;
    });

    return NextResponse.json({
      development: true,
      season: 2024,
      from,
      to,
      count: allMatches.length,
      matches: allMatches,
    });
  } catch (error) {
    console.error(
      "DEV FOOTBALL FIXTURES ERROR:",
      error
    );

    return NextResponse.json(
      {
        error:
          "Failed to load development fixtures",
      },
      { status: 500 }
    );
  }
}