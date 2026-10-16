import {
  NextRequest,
  NextResponse,
} from "next/server";

import {
  adminAuth,
  adminDb,
} from "@/lib/firebase-admin";

export const dynamic = "force-dynamic";

function toNumber(value: unknown) {
  const number = Number(value);

  return Number.isFinite(number)
    ? number
    : 0;
}

export async function GET(
  request: NextRequest
) {
  try {
    const authorization =
      request.headers.get(
        "authorization"
      );

    if (
      !authorization?.startsWith(
        "Bearer "
      )
    ) {
      return NextResponse.json(
        {
          error: "UNAUTHORIZED",
        },
        {
          status: 401,
        }
      );
    }

    const idToken =
      authorization.slice(7);

    const decodedToken =
      await adminAuth.verifyIdToken(
        idToken
      );

    const snapshot =
      await adminDb
        .collection("users")
        .get();

    const allUsers =
      snapshot.docs
        .map((docSnap) => {
          const data =
            docSnap.data();

          const stats =
            data.stats ?? {};

          const available =
            toNumber(
              data.balance
            );

          const locked =
            toNumber(
              data.lockedPoints
            );

          const totalPredictions =
            toNumber(
              stats.totalPredictions ??
                data.totalPredictions
            );

          const correct =
            toNumber(
              stats.won ??
                stats.wonPredictions ??
                data.correctPredictions
            );

          const lost =
            toNumber(
              stats.lost ??
                stats.lostPredictions
            );

          const settled =
            correct + lost;

          const accuracy =
            settled > 0
              ? (correct /
                  settled) *
                100
              : 0;

          const name =
            typeof data.name ===
              "string"
              ? data.name.trim()
              : "";

          return {
            id: docSnap.id,
            name,
            points:
              available + locked,
            predictions:
              totalPredictions,
            correct,
            accuracy,
          };
        })
        .filter(
          (user) =>
            user.name.length > 0
        )
        .sort((a, b) => {
          if (
            b.points !== a.points
          ) {
            return (
              b.points - a.points
            );
          }

          if (
            b.accuracy !==
            a.accuracy
          ) {
            return (
              b.accuracy -
              a.accuracy
            );
          }

          if (
            b.correct !==
            a.correct
          ) {
            return (
              b.correct -
              a.correct
            );
          }

          return a.name.localeCompare(
            b.name
          );
        });

    const currentIndex =
      allUsers.findIndex(
        (user) =>
          user.id ===
          decodedToken.uid
      );

    const currentUser =
      currentIndex >= 0
        ? allUsers[currentIndex]
        : null;

    return NextResponse.json({
      users: allUsers.slice(
        0,
        100
      ),
      currentUser,
      currentPosition:
        currentIndex >= 0
          ? currentIndex + 1
          : null,
    });
  } catch (error) {
    console.error(
      "RANKINGS API ERROR:",
      error
    );

    return NextResponse.json(
      {
        error:
          "RANKINGS_LOAD_FAILED",
      },
      {
        status: 500,
      }
    );
  }
}