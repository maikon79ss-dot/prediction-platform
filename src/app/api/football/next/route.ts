import {
  NextResponse,
} from "next/server";

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
    name:
      "English Premier League",
    slug:
      "english-premier-league",
  },
  {
    name:
      "Bulgarian First League",
    slug:
      "bulgarian-first-league",
  },
  {
    name:
      "Bulgarian Cup",
    slug:
      "bulgarian-cup",
  },
  {
    name:
      "Spanish La Liga",
    slug:
      "spanish-la-liga",
  },
  {
    name:
      "Bundesliga",
    slug:
      "bundesliga",
  },
  {
    name:
      "French Ligue 1",
    slug:
      "french-ligue-1",
  },
];

function getSofiaDate(
  date: Date
) {
  const parts =
    new Intl.DateTimeFormat(
      "en-CA",
      {
        timeZone:
          "Europe/Sofia",
        year:
          "numeric",
        month:
          "2-digit",
        day:
          "2-digit",
      }
    ).formatToParts(
      date
    );

  const year =
    parts.find(
      (part) =>
        part.type ===
        "year"
    )?.value ?? "";

  const month =
    parts.find(
      (part) =>
        part.type ===
        "month"
    )?.value ?? "";

  const day =
    parts.find(
      (part) =>
        part.type ===
        "day"
    )?.value ?? "";

  return `${year}-${month}-${day}`;
}

function addDays(
  dateString: string,
  amount: number
) {
  const [
    year,
    month,
    day,
  ] =
    dateString
      .split("-")
      .map(Number);

  const date =
    new Date(
      Date.UTC(
        year,
        month - 1,
        day
      )
    );

  date.setUTCDate(
    date.getUTCDate() +
      amount
  );

  return date
    .toISOString()
    .slice(
      0,
      10
    );
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

    const found =
      new Map<
        string,
        {
          competition:
            string;
          competitionSlug:
            string;
          nextDate:
            string;
          matches:
            any[];
        }
      >();

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

      const missingCompetitions =
        competitions.filter(
          (
            competition
          ) =>
            !found.has(
              competition.slug
            )
        );

      if (
        missingCompetitions.length ===
        0
      ) {
        break;
      }

      const dayResults =
        await Promise.all(
          missingCompetitions.map(
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

                  return {
                    competition,
                    matches:
                      [],
                  };
                }

                const data =
                  await response.json();

                const rawMatches:
                  SportScoreMatch[] =
                  Array.isArray(
                    data.matches
                  )
                    ? data.matches
                    : [];

                const matches =
                  rawMatches
                    .map(
                      (
                        match
                      ) => {
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

                          predictionOpen:
                            todaySofia <=
                            closesOn,

                          status:
                            match.status ??
                            "upcoming",

                          sourceUrl:
                            match.url ??
                            "",
                        };
                      }
                    )
                    .filter(
                      (
                        match
                      ) =>
                        match.eventId &&
                        match.home &&
                        match.away &&
                        match.predictionOpen
                    )
                    .sort(
                      (
                        a,
                        b
                      ) => {
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
                          aTime -
                          bTime
                        );
                      }
                    );

                return {
                  competition,
                  matches,
                };
              } catch (
                error
              ) {
                console.error(
                  "SPORTSCORE REQUEST ERROR:",
                  competition.name,
                  date,
                  error
                );

                return {
                  competition,
                  matches:
                    [],
                };
              }
            }
          )
        );

      for (
        const result
        of dayResults
      ) {
        if (
          result.matches.length >
            0 &&
          !found.has(
            result.competition
              .slug
          )
        ) {
          found.set(
            result.competition
              .slug,
            {
              competition:
                result.competition
                  .name,

              competitionSlug:
                result.competition
                  .slug,

              nextDate:
                date,

              matches:
                result.matches,
            }
          );
        }
      }
    }

    const sections =
      competitions.map(
        (
          competition
        ) => {
          const section =
            found.get(
              competition.slug
            );

          if (!section) {
            return {
              competition:
                competition.name,

              competitionSlug:
                competition.slug,

              nextDate:
                null,

              count:
                0,

              matches:
                [],
            };
          }

          return {
            ...section,

            count:
              section.matches
                .length,
          };
        }
      );

    const allMatches =
      sections.flatMap(
        (
          section
        ) =>
          section.matches
      );

    return NextResponse.json({
      timezone:
        "Europe/Sofia",

      rule:
        "Predictions close at 23:59 Europe/Sofia on the day before the match.",

      from:
        todaySofia,

      searchDays:
        30,

      count:
        allMatches.length,

      sections,

      matches:
        allMatches,
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