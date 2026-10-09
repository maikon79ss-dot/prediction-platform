import {
  adminDb,
} from "@/lib/firebase-admin";

const HISTORY_LIMIT = 60;

const SETTLED_STATUSES =
  new Set([
    "won",
    "lost",
    "refund",
    "refunded",
    "cancelled",
  ]);

function getPredictionTime(
  data: Record<string, any>
) {
  const value =
    data.settledAt ??
    data.updatedAt ??
    data.createdAt;

  if (value?.toMillis) {
    return value.toMillis();
  }

  if (value?.toDate) {
    return value
      .toDate()
      .getTime();
  }

  return 0;
}

export async function trimUserPredictionHistory(
  userId: string
) {
  if (!userId) {
    return {
      deleted: 0,
      kept: 0,
    };
  }

  const snapshot =
    await adminDb
      .collection("predictions")
      .where(
        "userId",
        "==",
        userId
      )
      .get();

  const settledDocs =
    snapshot.docs
      .filter((docSnap) => {
        const data =
          docSnap.data();

        const status =
          String(
            data.status ||
            data.result ||
            ""
          ).toLowerCase();

        return SETTLED_STATUSES.has(
          status
        );
      })
      .sort((a, b) => {
        const aTime =
          getPredictionTime(
            a.data()
          );

        const bTime =
          getPredictionTime(
            b.data()
          );

        return bTime - aTime;
      });

  if (
    settledDocs.length <=
    HISTORY_LIMIT
  ) {
    return {
      deleted: 0,
      kept:
        settledDocs.length,
    };
  }

  const docsToDelete =
    settledDocs.slice(
      HISTORY_LIMIT
    );

  const BATCH_SIZE = 450;

  for (
    let index = 0;
    index < docsToDelete.length;
    index += BATCH_SIZE
  ) {
    const batch =
      adminDb.batch();

    const chunk =
      docsToDelete.slice(
        index,
        index + BATCH_SIZE
      );

    for (
      const docSnap
      of chunk
    ) {
      batch.delete(
        docSnap.ref
      );
    }

    await batch.commit();
  }

  return {
    deleted:
      docsToDelete.length,

    kept:
      HISTORY_LIMIT,
  };
}