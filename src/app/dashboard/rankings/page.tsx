"use client";

import {
  useEffect,
  useState,
} from "react";

import Link from "next/link";
import {
  useRouter,
} from "next/navigation";

import {
  onAuthStateChanged,
} from "firebase/auth";

import {
  auth,
} from "@/lib/firebase";

import {
  useLanguage,
} from "@/lib/use-language";

type RankingUser = {
  id: string;
  name: string;
  points: number;
  predictions: number;
  correct: number;
  accuracy: number;
};

type RankingsResponse = {
  users: RankingUser[];
  currentUser:
    | RankingUser
    | null;
  currentPosition:
    | number
    | null;
};

export default function RankingsPage() {
  const [
    language,
    setLanguage,
  ] = useLanguage("bg");

  const [
    users,
    setUsers,
  ] = useState<
    RankingUser[]
  >([]);

  const [
    currentUser,
    setCurrentUser,
  ] = useState<
    RankingUser | null
  >(null);

  const [
    currentPosition,
    setCurrentPosition,
  ] = useState<
    number | null
  >(null);

  const [
    loading,
    setLoading,
  ] = useState(true);

  const [
    error,
    setError,
  ] = useState("");

  const router = useRouter();

  const t =
    language === "bg"
      ? {
          title: "Класация",
          subtitle:
            "Най-добрите прогнозисти в платформата",
          back: "Обратно към таблото",
          rank: "Място",
          user: "Потребител",
          points: "Точки",
          predictions: "Прогнози",
          correct: "Познати",
          accuracy: "Точност",
          yourPosition:
            "Твоята позиция",
          infoTitle:
            "Как се определя класацията",
          infoText:
            "Класацията се определя основно от общия брой точки. Заключените точки от активни прогнози също се включват, за да не влияят временно на позицията. При равни точки се вземат предвид точността и броят познати прогнози.",
          loading:
            "Зареждане на класацията...",
          loadError:
            "Не успяхме да заредим класацията.",
          noUsers:
            "Все още няма потребители в класацията.",
          notRanked:
            "Все още нямаш позиция в класацията.",
        }
      : {
          title: "Rankings",
          subtitle:
            "Top predictors on the platform",
          back: "Back to dashboard",
          rank: "Rank",
          user: "User",
          points: "Points",
          predictions: "Predictions",
          correct: "Correct",
          accuracy: "Accuracy",
          yourPosition:
            "Your position",
          infoTitle:
            "How rankings are calculated",
          infoText:
            "Rankings are based primarily on total points. Points locked in active predictions are also included so active predictions do not temporarily reduce a user's position. Accuracy and correct predictions are used as tie-breakers.",
          loading:
            "Loading rankings...",
          loadError:
            "The rankings could not be loaded.",
          noUsers:
            "There are no users in the rankings yet.",
          notRanked:
            "You do not have a ranking position yet.",
        };

  useEffect(() => {
    const unsubscribe =
      onAuthStateChanged(
        auth,
        async (user) => {
          if (!user) {
            router.push(
              "/login"
            );
            return;
          }

          try {
            setLoading(true);
            setError("");

            const idToken =
              await user.getIdToken();

            const response =
              await fetch(
                "/api/rankings",
                {
                  method: "GET",
                  headers: {
                    Authorization:
                      `Bearer ${idToken}`,
                  },
                  cache:
                    "no-store",
                }
              );

            const data =
              (await response.json()) as
                RankingsResponse & {
                  error?: string;
                };

            if (!response.ok) {
              throw new Error(
                data.error ||
                  "RANKINGS_LOAD_FAILED"
              );
            }

            setUsers(
              Array.isArray(
                data.users
              )
                ? data.users
                : []
            );

            setCurrentUser(
              data.currentUser ??
                null
            );

            setCurrentPosition(
              data.currentPosition ??
                null
            );
          } catch (error) {
            console.error(
              "RANKINGS PAGE ERROR:",
              error
            );

            setError(
              t.loadError
            );
          } finally {
            setLoading(false);
          }
        }
      );

    return () =>
      unsubscribe();
  }, [router, t.loadError]);

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-950 text-white">
        <p className="text-slate-400">
          {t.loading}
        </p>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <header className="border-b border-slate-800 bg-slate-950/95">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 px-6 py-5">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-emerald-400">
              Prediction Platform
            </p>

            <h1 className="mt-2 text-3xl font-bold">
              {t.title}
            </h1>

            <p className="mt-1 text-sm text-slate-400">
              {t.subtitle}
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex rounded-xl border border-slate-700 p-1">
              <button
                type="button"
                onClick={() =>
                  setLanguage("bg")
                }
                className={`rounded-lg px-3 py-1.5 text-sm font-bold ${
                  language === "bg"
                    ? "bg-emerald-500 text-slate-950"
                    : "text-slate-300"
                }`}
              >
                BG
              </button>

              <button
                type="button"
                onClick={() =>
                  setLanguage("en")
                }
                className={`rounded-lg px-3 py-1.5 text-sm font-bold ${
                  language === "en"
                    ? "bg-emerald-500 text-slate-950"
                    : "text-slate-300"
                }`}
              >
                EN
              </button>
            </div>

            <Link
              href="/dashboard"
              className="rounded-xl border border-slate-700 px-4 py-2 text-sm font-semibold hover:border-slate-500"
            >
              {t.back}
            </Link>
          </div>
        </div>
      </header>

      <section className="mx-auto max-w-7xl px-6 py-10">
        {error && (
          <div className="mb-6 rounded-2xl border border-red-500/20 bg-red-500/10 px-5 py-4 text-sm font-semibold text-red-300">
            {error}
          </div>
        )}

        <div className="rounded-3xl border border-emerald-500/20 bg-slate-900 p-6">
          <p className="text-sm font-semibold text-emerald-400">
            {t.yourPosition}
          </p>

          {currentUser &&
          currentPosition ? (
            <div className="mt-4 flex flex-wrap items-center justify-between gap-4">
              <div>
                <p className="text-4xl font-bold">
                  #{currentPosition}
                </p>

                <p className="mt-2 text-slate-400">
                  {currentUser.name}
                </p>
              </div>

              <div className="text-right">
                <p className="text-sm text-slate-500">
                  {t.points}
                </p>

                <p className="mt-1 text-3xl font-bold text-emerald-400">
                  {currentUser.points.toLocaleString()}
                </p>
              </div>
            </div>
          ) : (
            <p className="mt-4 text-slate-400">
              {t.notRanked}
            </p>
          )}
        </div>

        <section className="mt-10">
          <div className="overflow-x-auto rounded-3xl border border-slate-800 bg-slate-900">
            {users.length === 0 ? (
              <div className="p-7 text-slate-400">
                {t.noUsers}
              </div>
            ) : (
              <table className="w-full min-w-[760px] text-left">
                <thead className="border-b border-slate-800 bg-slate-950/60">
                  <tr>
                    <th className="px-6 py-4 text-sm font-semibold text-slate-400">
                      {t.rank}
                    </th>

                    <th className="px-6 py-4 text-sm font-semibold text-slate-400">
                      {t.user}
                    </th>

                    <th className="px-6 py-4 text-sm font-semibold text-slate-400">
                      {t.points}
                    </th>

                    <th className="px-6 py-4 text-sm font-semibold text-slate-400">
                      {t.predictions}
                    </th>

                    <th className="px-6 py-4 text-sm font-semibold text-slate-400">
                      {t.correct}
                    </th>

                    <th className="px-6 py-4 text-sm font-semibold text-slate-400">
                      {t.accuracy}
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {users.map(
                    (
                      user,
                      index
                    ) => (
                      <tr
                        key={
                          user.id
                        }
                        className={`border-b border-slate-800 last:border-b-0 ${
                          user.id ===
                          currentUser?.id
                            ? "bg-emerald-500/5"
                            : ""
                        }`}
                      >
                        <td className="px-6 py-5">
                          <span
                            className={`inline-flex h-9 w-9 items-center justify-center rounded-full text-sm font-bold ${
                              index ===
                              0
                                ? "bg-amber-400 text-slate-950"
                                : index ===
                                  1
                                ? "bg-slate-300 text-slate-950"
                                : index ===
                                  2
                                ? "bg-orange-400 text-slate-950"
                                : "bg-slate-800 text-slate-300"
                            }`}
                          >
                            {index +
                              1}
                          </span>
                        </td>

                        <td className="px-6 py-5 font-semibold">
                          {
                            user.name
                          }
                        </td>

                        <td className="px-6 py-5 font-bold text-emerald-400">
                          {user.points.toLocaleString()}
                        </td>

                        <td className="px-6 py-5 text-slate-300">
                          {
                            user.predictions
                          }
                        </td>

                        <td className="px-6 py-5 text-slate-300">
                          {
                            user.correct
                          }
                        </td>

                        <td className="px-6 py-5 text-slate-300">
                          {user.accuracy.toFixed(
                            1
                          )}
                          %
                        </td>
                      </tr>
                    )
                  )}
                </tbody>
              </table>
            )}
          </div>
        </section>

        <section className="mt-10 rounded-3xl border border-slate-800 bg-slate-900 p-7">
          <h2 className="text-2xl font-bold">
            {t.infoTitle}
          </h2>

          <p className="mt-4 max-w-3xl leading-7 text-slate-400">
            {t.infoText}
          </p>
        </section>
      </section>
    </main>
  );
}