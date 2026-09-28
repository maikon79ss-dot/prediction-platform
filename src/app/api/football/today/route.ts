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
    logo?: string;
  };
  teams?: {
    home?: {
      id?: number;
      name?: string;
      logo?: string;
    };
    away?: {
      id?: number;
      name?: string;
      logo?: string;
    };
  };
  goals?: {
    home?: number | null;
    away?: number | null;
  };
};

function formatDate(date: Date) {
  return date.toISOString().split("T")[0];
}

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

    const fromDate = new Date();
    const toDate = new Date();

    toDate.setDate(
      toDate.getDate() + 7
    );

    const from = formatDate(fromDate);
    const to = formatDate(toDate);

    const response = await fetch(
      `https://v3.football.api-sports.io/fixtures?from=${from}&to=${to}`,
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

    const fixtures: FixtureItem[] =
      Array.isArray(data.response)
        ? data.response
        : [];

    const allowedLeagueIds = [
      39,  // Premier League
      172, // Bulgaria First League
      174, // Bulgaria Cup
    ];

    const filteredFixtures =
      fixtures.filter((item) => {
        const leagueId =
          item.league?.id ?? null;

        return (
          leagueId !== null &&
          allowedLeagueIds.includes(
            leagueId
          )
        );
      });

    const matches =
      filteredFixtures
        .map((item) => ({
          fixtureId:
            item.fixture?.id ?? null,

          date:
            item.fixture?.date ?? null,

          status:
            item.fixture?.status?.short ??
            null,

          statusLong:
            item.fixture?.status?.long ??
            null,

          league: {
            id:
              item.league?.id ?? null,
            name:
              item.league?.name ?? "",
            country:
              item.league?.country ?? "",
            logo:
              item.league?.logo ?? "",
          },

          home: {
            id:
              item.teams?.home?.id ??
              null,
            name:
              item.teams?.home?.name ??
              "",
            logo:
              item.teams?.home?.logo ??
              "",
          },

          away: {
            id:
              item.teams?.away?.id ??
              null,
            name:
              item.teams?.away?.name ??
              "",
            logo:
              item.teams?.away?.logo ??
              "",
          },

          goals: {
            home:
              item.goals?.home ?? null,
            away:
              item.goals?.away ?? null,
          },
        }))
        .sort((a, b) => {
          const aTime = a.date
            ? new Date(a.date).getTime()
            : 0;

          const bTime = b.date
            ? new Date(b.date).getTime()
            : 0;

          return aTime - bTime;
        });

    return NextResponse.json({
      from,
      to,
      count: matches.length,
      matches,
    });
  } catch (error) {
    console.error(
      "FOOTBALL FIXTURES ERROR:",
      error
    );

    return NextResponse.json(
      {
        error:
          "Failed to load football fixtures",
      },
      { status: 500 }
    );
  }
}