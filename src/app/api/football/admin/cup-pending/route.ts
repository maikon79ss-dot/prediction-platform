import {
  NextRequest,
  NextResponse,
} from "next/server";

import {
  adminDb,
} from "@/lib/firebase-admin";

export const dynamic =
  "force-dynamic";

export async function GET(
  request: NextRequest
) {
  try {
    const secret =
      request.headers.get(
        "x-admin-secret"
      );

    const expectedSecret =
      process.env.ADMIN_SECRET;

    if (
      !expectedSecret ||
      !secret ||
      secret !==
        expectedSecret
    ) {
      return NextResponse.json(
        {
          error:
            "Unauthorized",
        },
        {
          status: 401,
        }
      );
    }

    const snapshot =
      await adminDb
        .collection(
          "predictions"
        )
        .where(
          "status",
          "==",
          "active"
        )
        .get();

    const grouped =
      new Map<
        string,
        {
          eventId: string;
          event: string;
          homeTeam: string;
          awayTeam: string;
          matchDateSofia:
            string | null;
          closesAt:
            string | null;
          predictions:
            number;
        }
      >();

    for (
      const docSnap
      of snapshot.docs
    ) {
      const data =
        docSnap.data();

      if (
        data.category !==
          "football" ||
        data.provider !==
          "sportscore" ||
        data.competition !==
          "Bulgarian Cup" ||
        typeof data.eventId !==
          "string" ||
        !data.eventId
      ) {
        continue;
      }

      const eventId =
        data.eventId;

      const existing =
        grouped.get(
          eventId
        );

      if (existing) {
        existing.predictions +=
          1;

        continue;
      }

      const homeTeam =
        String(
          data.homeTeam ??
            ""
        );

      const awayTeam =
        String(
          data.awayTeam ??
            ""
        );

      grouped.set(
        eventId,
        {
          eventId,

          event:
            String(
              data.event ??
                ""
            ) ||
            `${homeTeam} vs ${awayTeam}`,

          homeTeam,

          awayTeam,

          matchDateSofia:
            typeof data
              .matchDateSofia ===
            "string"
              ? data
                  .matchDateSofia
              : null,

          closesAt:
            typeof data
              .closesAt ===
            "string"
              ? data.closesAt
              : null,

          predictions:
            1,
        }
      );
    }

    const matches = [
      ...grouped.values(),
    ].sort(
      (a, b) =>
        String(
          a.matchDateSofia ??
            ""
        ).localeCompare(
          String(
            b.matchDateSofia ??
              ""
          )
        )
    );

    return NextResponse.json({
      success: true,

      count:
        matches.length,

      matches,
    });
  } catch (error) {
    console.error(
      "ADMIN CUP PENDING ERROR:",
      error
    );

    return NextResponse.json(
      {
        error:
          "Failed to load Bulgarian Cup predictions",

        details:
          error instanceof Error
            ? error.message
            : "UNKNOWN_ERROR",
      },
      {
        status: 500,
      }
    );
  }
}