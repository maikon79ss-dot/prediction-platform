import {
  NextRequest,
  NextResponse,
} from "next/server";

import {
  FieldValue,
} from "firebase-admin/firestore";

import {
  adminAuth,
  adminDb,
} from "@/lib/firebase-admin";

type FootballMatch = {
  eventId: string;
  home: string;
  away: string;
  competition: string;
  time: string | null;
  matchDateSofia: string;
  closesOn: string;
  closesAt: string;
  predictionOpen: boolean;
  sourceUrl: string;
};

type FootballResponse = {
  sections?: {
    matches?: FootballMatch[];
  }[];
};

export async function POST(
  request: NextRequest
) {
  try {
    const authorization =
      request.headers.get(
        "authorization"
      );

    if (
      !authorization ||
      !authorization.startsWith(
        "Bearer "
      )
    ) {
      return NextResponse.json(
        {
          error:
            "UNAUTHORIZED",
        },
        {
          status: 401,
        }
      );
    }

    const idToken =
      authorization
        .slice(7)
        .trim();

    if (!idToken) {
      return NextResponse.json(
        {
          error:
            "UNAUTHORIZED",
        },
        {
          status: 401,
        }
      );
    }

    const decodedToken =
      await adminAuth
        .verifyIdToken(
          idToken
        );

    const userId =
      decodedToken.uid;

    const body =
      await request.json();

    const eventId =
      typeof body.eventId ===
      "string"
        ? body.eventId.trim()
        : "";

    const choice =
      typeof body.choice ===
      "string"
        ? body.choice.trim()
        : "";

    const points =
      Number(body.points);

    if (!eventId) {
      return NextResponse.json(
        {
          error:
            "MISSING_EVENT_ID",
        },
        {
          status: 400,
        }
      );
    }

    if (
      ![
        "home",
        "draw",
        "away",
      ].includes(choice)
    ) {
      return NextResponse.json(
        {
          error:
            "INVALID_CHOICE",
        },
        {
          status: 400,
        }
      );
    }

    if (
      !Number.isInteger(
        points
      ) ||
      points < 100
    ) {
      return NextResponse.json(
        {
          error:
            "INVALID_POINTS",

          message:
            "Minimum prediction is 100 points.",
        },
        {
          status: 400,
        }
      );
    }

    const fixturesResponse =
      await fetch(
        `${request.nextUrl.origin}/api/football/next`,
        {
          cache:
            "no-store",
        }
      );

    if (
      !fixturesResponse.ok
    ) {
      return NextResponse.json(
        {
          error:
            "FIXTURE_CHECK_FAILED",
        },
        {
          status: 502,
        }
      );
    }

    const fixtures:
      FootballResponse =
      await fixturesResponse.json();

    const allMatches =
      Array.isArray(
        fixtures.sections
      )
        ? fixtures.sections.flatMap(
            (section) =>
              Array.isArray(
                section.matches
              )
                ? section.matches
                : []
          )
        : [];

    const match =
      allMatches.find(
        (item) =>
          item.eventId ===
          eventId
      );

    if (!match) {
      return NextResponse.json(
        {
          error:
            "MATCH_NOT_AVAILABLE",
        },
        {
          status: 404,
        }
      );
    }

    if (
      match.predictionOpen !==
      true
    ) {
      return NextResponse.json(
        {
          error:
            "PREDICTION_CLOSED",

          closesAt:
            match.closesAt,
        },
        {
          status: 409,
        }
      );
    }

    const userRef =
      adminDb
        .collection("users")
        .doc(userId);

    const predictionRef =
      adminDb
        .collection(
          "predictions"
        )
        .doc();

    const movementRef =
      adminDb
        .collection(
          "transactions"
        )
        .doc();

    let newBalance = 0;
    let newLockedPoints =
      0;

    await adminDb.runTransaction(
      async (transaction) => {
        const userSnap =
          await transaction.get(
            userRef
          );

        if (
          !userSnap.exists
        ) {
          throw new Error(
            "USER_NOT_FOUND"
          );
        }

        const userData =
          userSnap.data();

        const currentBalance =
          Number(
            userData?.balance
          ) || 0;

        const currentLocked =
          Number(
            userData
              ?.lockedPoints
          ) || 0;

        if (
          points >
          currentBalance
        ) {
          throw new Error(
            "INSUFFICIENT_BALANCE"
          );
        }

        newBalance =
          currentBalance -
          points;

        newLockedPoints =
          currentLocked +
          points;

        transaction.update(
          userRef,
          {
            balance:
              newBalance,

            lockedPoints:
              newLockedPoints,
          }
        );

        transaction.set(
          predictionRef,
          {
            userId,

            category:
              "football",

            provider:
              "sportscore",

            eventId:
              match.eventId,

            sourceUrl:
              match.sourceUrl,

            competition:
              match.competition,

            homeTeam:
              match.home,

            awayTeam:
              match.away,

            event:
              `${match.home} vs ${match.away}`,

            eventBg:
              `${match.home} срещу ${match.away}`,

            choice,

            points,

            status:
              "active",

            result:
              "pending",

            balanceChange:
              -points,

            eventTime:
              match.time,

            matchDateSofia:
              match.matchDateSofia,

            closesOn:
              match.closesOn,

            closesAt:
              match.closesAt,

            createdAt:
              FieldValue
                .serverTimestamp(),
          }
        );

        transaction.set(
          movementRef,
          {
            userId,

            type:
              "prediction",

            description:
              `Prediction: ${match.home} vs ${match.away}`,

            amount:
              -points,

            balanceAfter:
              newBalance,

            status:
              "completed",

            predictionId:
              predictionRef.id,

            eventId:
              match.eventId,

            provider:
              "sportscore",

            createdAt:
              FieldValue
                .serverTimestamp(),
          }
        );
      }
    );

    return NextResponse.json({
      success: true,

      predictionId:
        predictionRef.id,

      balance:
        newBalance,

      lockedPoints:
        newLockedPoints,

      prediction: {
        eventId:
          match.eventId,

        event:
          `${match.home} vs ${match.away}`,

        eventBg:
          `${match.home} срещу ${match.away}`,

        choice,

        points,

        competition:
          match.competition,

        eventTime:
          match.time,

        closesAt:
          match.closesAt,
      },
    });
  } catch (error) {
    console.error(
      "CREATE FOOTBALL PREDICTION ERROR:",
      error
    );

    if (
      error instanceof Error &&
      error.message ===
        "INSUFFICIENT_BALANCE"
    ) {
      return NextResponse.json(
        {
          error:
            "INSUFFICIENT_BALANCE",
        },
        {
          status: 409,
        }
      );
    }

    if (
      error instanceof Error &&
      error.message ===
        "USER_NOT_FOUND"
    ) {
      return NextResponse.json(
        {
          error:
            "USER_NOT_FOUND",
        },
        {
          status: 404,
        }
      );
    }

    return NextResponse.json(
      {
        error:
          "CREATE_PREDICTION_FAILED",
      },
      {
        status: 500,
      }
    );
  }
}