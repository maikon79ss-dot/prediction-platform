import {
  NextRequest,
  NextResponse,
} from "next/server";

import {
  adminAuth,
  adminDb,
} from "@/lib/firebase-admin";

function toNumber(value: unknown) {
  const number = Number(value);

  return Number.isFinite(number)
    ? number
    : 0;
}

async function getUserFromRequest(
  request: NextRequest
) {
  const authorization =
    request.headers.get(
      "authorization"
    );

  if (
    !authorization?.startsWith(
      "Bearer "
    )
  ) {
    throw new Error(
      "UNAUTHORIZED"
    );
  }

  const idToken =
    authorization.slice(7);

  return adminAuth.verifyIdToken(
    idToken
  );
}

export async function GET(
  request: NextRequest
) {
  try {
    const decodedToken =
      await getUserFromRequest(
        request
      );

    const userRef =
      adminDb
        .collection("users")
        .doc(decodedToken.uid);

    const userSnap =
      await userRef.get();

    const authUser =
      await adminAuth.getUser(
        decodedToken.uid
      );

    const data =
      userSnap.exists
        ? userSnap.data() ?? {}
        : {};

    const stats =
      data.stats ?? {};

    const won =
      toNumber(
        stats.won ??
          stats.wonPredictions
      );

    const lost =
      toNumber(
        stats.lost ??
          stats.lostPredictions
      );

    const totalPredictions =
      toNumber(
        stats.totalPredictions ??
          data.totalPredictions
      );

    const settled =
      won + lost;

    const accuracy =
      settled > 0
        ? (won / settled) * 100
        : 0;

    const createdAt =
      data.createdAt?.toDate?.();

    return NextResponse.json({
      name:
        data.name ||
        authUser.displayName ||
        "",
      email:
        authUser.email ||
        data.email ||
        "",
      language:
        data.language === "en"
          ? "en"
          : "bg",
      balance:
        toNumber(
          data.balance
        ),
      lockedPoints:
        toNumber(
          data.lockedPoints
        ),
      totalPredictions,
      accuracy,
      registeredAt:
        createdAt
          ? createdAt.toISOString()
          : authUser.metadata.creationTime
          ? new Date(
              authUser.metadata.creationTime
            ).toISOString()
          : null,
    });
  } catch (error) {
    console.error(
      "PROFILE GET ERROR:",
      error
    );

    return NextResponse.json(
      {
        error:
          "PROFILE_LOAD_FAILED",
      },
      {
        status: 401,
      }
    );
  }
}

export async function PATCH(
  request: NextRequest
) {
  try {
    const decodedToken =
      await getUserFromRequest(
        request
      );

    const body =
      await request.json();

    const name =
      typeof body.name === "string"
        ? body.name.trim()
        : "";

    const language =
      body.language === "en"
        ? "en"
        : "bg";

    if (!name) {
      return NextResponse.json(
        {
          error: "NAME_REQUIRED",
        },
        {
          status: 400,
        }
      );
    }

    await adminAuth.updateUser(
      decodedToken.uid,
      {
        displayName: name,
      }
    );

    await adminDb
      .collection("users")
      .doc(decodedToken.uid)
      .set(
        {
          name,
          language,
        },
        {
          merge: true,
        }
      );

    return NextResponse.json({
      success: true,
      name,
      language,
    });
  } catch (error) {
    console.error(
      "PROFILE UPDATE ERROR:",
      error
    );

    return NextResponse.json(
      {
        error:
          "PROFILE_UPDATE_FAILED",
      },
      {
        status: 500,
      }
    );
  }
}