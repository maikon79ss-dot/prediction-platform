import { NextResponse } from "next/server";

type SportScoreMatch = {
  home?: string;
  away?: string;
  home_logo?: string;
  away_logo?: string;
  status?: string;
  status_text?: string;
  time?: string;
  competition?: string;
  competition_logo?: string;
  url?: string;
};

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

function getSofiaDate(date: Date) {
  const parts =
    new Intl.DateTimeFormat(
      "en-CA",
      {
        timeZone: "Europe/Sofia",
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
      }
    ).formatToParts(date);

  const year =
    parts.find(
      (part) =>
        part.type === "year"
    )?.value ?? "";

  const month =
    parts.find(
      (part) =>
        part.type === "month"
    )?.value ?? "";

  const day =
    parts.find(
      (part) =>
        part.type === "day"
    )?.value ?? "";

  return `${year}-${month}-${day}`;
}

function addDays(
  dateString: string,
  amount: number
) {
  const [year, month, day] =
    dateString
      .split("-")
      .map(Number);

  const date = new Date(
    Date.UTC(
      year,
      month - 1,
      day
    )
  );

  date.setUTCDate(
    date.getUTCDate() + amount
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

export async function GET() {
  try {
    const todaySofia =
      getSofiaDate(
        new Date()
      );

    for (
      let dayOffset = 0;
      dayOffset < 30;
      dayOffset++
    ) {
      const date =
        addDays(
          todaySofia,
          dayOffset
        );

      const results =
        await Promise.all(
          competitions.map(
            async (
              competition
            ) => {
              try {
                const response =
                  await fetch(
                    `https://sportscore.com/api/v1/fixtures/?sport=football&date=${date}&status=upcoming&competition=${competition.slug}&limit=50`,
                    {
                      next: {
                        revalidate:
                          21600,
                      },
                    }
                  );

                if (
                  !response.ok
                ) {
                  console.error(
                    "SPORTSCORE HTTP ERROR:",
                    response.status,
                    competition.name,
                    date
                  );

                  return [];
                }

                const data =
                  await response.json();

                const matches:
                  SportScoreMatch[] =
                  Array.isArray(
                    data.matches
                  )
                    ? data.matches
                    : [];

                return matches.map(
                  (match) => {
                    const matchDateSofia =
                      match.time
                        ? getSofiaDate(
                            new Date(
                              match.time
                            )
                          )
                        : date;

                    const closesOn =
                      previousDay(
                        matchDateSofia
                      );

                    const predictionOpen =
                      todaySofia <=
                      closesOn;

                    return {
                      eventId:
                        match.url ??
                        "",

                      home:
                        match.home ??
                        "",

                      away:
                        match.away ??
                        "",

                      homeLogo:
                        match.home_logo ??
                        "",

                      awayLogo:
                        match.away_logo ??
                        "",

                      competition:
                        match.competition ??
                        competition.name,

                      competitionLogo:
                        match.competition_logo ??
                        "",

                      time:
                        match.time ??
                        null,

                      matchDateSofia,

                      closesOn,

                      closesAt:
                        `${closesOn} 23:59`,

                      predictionOpen,

                      status:
                        match.status ??
                        "upcoming",

                      sourceUrl:
                        match.url ??
                        "",
                    };
                  }
                );
              } catch (error) {
                console.error(
                  "SPORTSCORE REQUEST ERROR:",
                  competition.name,
                  date,
                  error
                );

                return [];
              }
            }
          )
        );

      const matches =
        results
          .flat()
          .filter(
            (match) =>
              match.eventId &&
              match.home &&
              match.away &&
              match.predictionOpen
          )
          .sort((a, b) => {
            const aTime =
              a.time
                ? new Date(
                    a.time
                  ).getTime()
                : 0;

            const bTime =
              b.time
                ? new Date(
                    b.time
                  ).getTime()
                : 0;

            return (
              aTime - bTime
            );
          });

      if (
        matches.length > 0
      ) {
        const nextDate =
          matches[0]
            .matchDateSofia;

        return NextResponse.json({
          timezone:
            "Europe/Sofia",

          nextDate,

          messageBg:
            `Направете прогноза за ${nextDate}`,

          messageEn:
            `Make your prediction for ${nextDate}`,

          closesAt:
            matches[0]
              .closesAt,

          count:
            matches.length,

          matches,
        });
      }
    }

    return NextResponse.json({
      timezone:
        "Europe/Sofia",

      nextDate: null,

      messageBg:
        "Няма намерени предстоящи мачове през следващите 30 дни.",

      messageEn:
        "No upcoming matches found in the next 30 days.",

      count: 0,

      matches: [],
    });
  } catch (error) {
    console.error(
      "NEXT FOOTBALL ERROR:",
      error
    );

    return NextResponse.json(
      {
        error:
          "Failed to find next football fixtures",
      },
      {
        status: 500,
      }
    );
  }
}