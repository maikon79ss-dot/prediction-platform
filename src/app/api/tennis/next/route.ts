import {
  NextResponse,
} from "next/server";

export const dynamic =
  "force-dynamic";

type SportScoreMatch = {
  home?: string;
  away?: string;
  home_logo?: string | null;
  away_logo?: string | null;
  time?: string;
  status?: string;
  status_text?: string;
  competition?: string;
  competition_logo?: string | null;
  url?: string;
};

function getSofiaDate() {
  return new Intl.DateTimeFormat(
    "en-CA",
    {
      timeZone: "Europe/Sofia",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    }
  ).format(new Date());
}

function addDays(
  dateString: string,
  days: number
) {
  const date = new Date(
    `${dateString}T12:00:00Z`
  );

  date.setUTCDate(
    date.getUTCDate() + days
  );

  return date
    .toISOString()
    .slice(0, 10);
}

function previousDay(
  dateString: string
) {
  return addDays(
    dateString,
    -1
  );
}

function isUsableSinglesMatch(
  match: SportScoreMatch
) {
  const home =
    match.home?.trim() || "";

  const away =
    match.away?.trim() || "";

  if (!home || !away) {
    return false;
  }

  if (
    home.includes("/") ||
    away.includes("/")
  ) {
    return false;
  }

  const combined =
    `${home} ${away}`.toLowerCase();

  if (
    combined.includes(
      "winner of"
    ) ||
    combined.includes("tbd")
  ) {
    return false;
  }

  return true;
}

async function fetchDay(
  matchDate: string
) {
  const url =
    new URL(
      "https://sportscore.com/api/v1/fixtures/"
    );

  url.searchParams.set(
    "sport",
    "tennis"
  );

  url.searchParams.set(
    "date",
    matchDate
  );

  url.searchParams.set(
    "status",
    "upcoming"
  );

  url.searchParams.set(
    "limit",
    "100"
  );

  const controller =
    new AbortController();

  const timeout =
    setTimeout(
      () =>
        controller.abort(),
      6000
    );

  try {
    const response =
      await fetch(
        url.toString(),
        {
          cache: "no-store",
          signal:
            controller.signal,
        }
      );

    if (!response.ok) {
      return {
        date: matchDate,
        matches: [],
      };
    }

    const data =
      await response.json();

    const rawMatches:
      SportScoreMatch[] =
      Array.isArray(data)
        ? data
        : Array.isArray(
            data.matches
          )
        ? data.matches
        : Array.isArray(
            data.results
          )
        ? data.results
        : [];

    const matches =
      rawMatches
        .filter(
          isUsableSinglesMatch
        )
        .filter(
          (match) =>
            match.url &&
            match.time
        )
        .slice(0, 12)
        .map((match) => ({
          eventId:
            match.url as string,

          player1:
            match.home || "",

          player2:
            match.away || "",

          player1Logo:
            match.home_logo ??
            null,

          player2Logo:
            match.away_logo ??
            null,

          tournament:
            match.competition ||
            "Tennis",

          tournamentLogo:
            match.competition_logo ??
            null,

          eventTime:
            match.time as string,

          matchDateSofia:
            matchDate,

          closesOn:
            previousDay(
              matchDate
            ),

          closesAt:
            `${previousDay(
              matchDate
            )} 23:59`,

          predictionOpen:
            true,

          provider:
            "sportscore",
        }));

    return {
      date: matchDate,
      matches,
    };
  } catch (error) {
    console.error(
      `TENNIS ${matchDate} ERROR:`,
      error
    );

    return {
      date: matchDate,
      matches: [],
    };
  } finally {
    clearTimeout(timeout);
  }
}

export async function GET() {
  try {
    const today =
      getSofiaDate();

    const dates =
      Array.from(
        { length: 7 },
        (_, index) =>
          addDays(
            today,
            index + 1
          )
      );

    const results =
      await Promise.all(
        dates.map(
          fetchDay
        )
      );

    const firstDay =
      results.find(
        (result) =>
          result.matches.length > 0
      );

    if (!firstDay) {
      return NextResponse.json({
        date: null,
        matches: [],
      });
    }

    return NextResponse.json(
      firstDay
    );
  } catch (error) {
    console.error(
      "TENNIS NEXT ERROR:",
      error
    );

    return NextResponse.json(
      {
        error:
          "TENNIS_EVENTS_LOAD_FAILED",
        matches: [],
      },
      {
        status: 500,
      }
    );
  }
}