"use client";

import {
  useEffect,
  useState,
} from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { onAuthStateChanged } from "firebase/auth";
import {
  collection,
  doc,
  runTransaction,
  serverTimestamp,
} from "firebase/firestore";
import { auth, db } from "@/lib/firebase";

type Language = "bg" | "en";

type Match = {
  fixtureId: number | null;
  date: string | null;
  status: string | null;
  statusLong: string | null;

  league: {
    id: number | null;
    name: string;
    country: string;
  };

  home: {
    id: number | null;
    name: string;
  };

  away: {
    id: number | null;
    name: string;
  };

  goals: {
    home: number | null;
    away: number | null;
  };
};

const longTermMarkets = [
  {
    bg: "Кой ще стане шампион на България?",
    en: "Who will become Bulgarian champion?",
  },
  {
    bg: "Кой ще спечели Premier League?",
    en: "Who will win the Premier League?",
  },
  {
    bg: "Кой ще спечели Champions League?",
    en: "Who will win the Champions League?",
  },
  {
    bg: "Кой ще спечели Купата на България?",
    en: "Who will win the Bulgarian Cup?",
  },
];

export default function FootballPage() {
  const [language, setLanguage] =
    useState<Language>("bg");

  const [matches, setMatches] =
    useState<Match[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  const [selectedOptions, setSelectedOptions] =
    useState<Record<string, string>>({});

  const [amounts, setAmounts] =
    useState<Record<string, number>>({});
const [balance, setBalance] =
  useState(0);

const [submitting, setSubmitting] =
  useState<string | null>(null);

const [message, setMessage] =
  useState("");

const router = useRouter();
  const t =
    language === "bg"
      ? {
          title: "Футбол",
          subtitle:
            "Реални футболни събития от API",
          back: "Обратно към таблото",
          open: "ОТВОРЕНО",
          finished: "ПРИКЛЮЧИЛ",
          start: "Начало",
          minimum: "Минимум: 100 точки",
          home: "Домакин",
          draw: "Равен",
          away: "Гост",
          points: "Точки",
          confirm: "Потвърди прогноза",
          leagues: "Първенства",
          longTerm:
            "Дългосрочни футболни прогнози",
          longTermMinimum:
            "Минимум: 1 000 точки",
          view: "Виж пазара",
          loading: "Зареждане на мачове...",
          noMatches:
            "Няма намерени мачове за тестовия период.",
          development:
            "Тестови реални данни от сезон 2024",
        }
      : {
          title: "Football",
          subtitle:
            "Real football events from the API",
          back: "Back to dashboard",
          open: "OPEN",
          finished: "FINISHED",
          start: "Starts",
          minimum: "Minimum: 100 points",
          home: "Home",
          draw: "Draw",
          away: "Away",
          points: "Points",
          confirm: "Confirm prediction",
          leagues: "Leagues",
          longTerm:
            "Long-term football predictions",
          longTermMinimum:
            "Minimum: 1,000 points",
          view: "View market",
          loading: "Loading matches...",
          noMatches:
            "No matches found for the development period.",
          development:
            "Development data from the 2024 season",
        };
useEffect(() => {
  const unsubscribe = onAuthStateChanged(
    auth,
    async (user) => {
      if (!user) {
        router.push("/login");
        return;
      }

      try {
        const userRef = doc(
          db,
          "users",
          user.uid
        );

        const { getDoc } =
          await import(
            "firebase/firestore"
          );

        const userSnap =
          await getDoc(userRef);

        if (userSnap.exists()) {
          const data =
            userSnap.data();

          setBalance(
            Number(data.balance) || 0
          );
        }
      } catch (error) {
        console.error(
          "FOOTBALL USER ERROR:",
          error
        );
      }
    }
  );

  return () => unsubscribe();
}, [router]);
  useEffect(() => {
    async function loadMatches() {
      try {
        setLoading(true);
        setError("");

        const response = await fetch(
          "/api/football/dev-fixtures",
          {
            cache: "no-store",
          }
        );

        if (!response.ok) {
          throw new Error(
            "Failed to load football fixtures"
          );
        }

        const data = await response.json();

        setMatches(
          Array.isArray(data.matches)
            ? data.matches
            : []
        );
      } catch (error) {
        console.error(
          "FOOTBALL PAGE ERROR:",
          error
        );

        setError(
          language === "bg"
            ? "Възникна грешка при зареждането на мачовете."
            : "An error occurred while loading matches."
        );
      } finally {
        setLoading(false);
      }
    }

    loadMatches();
  }, [language]);

  function formatMatchDate(
    value: string | null
  ) {
    if (!value) {
      return "—";
    }

    const date = new Date(value);

    return date.toLocaleString(
      language === "bg"
        ? "bg-BG"
        : "en-GB",
      {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      }
    );
  }

  function getLeagueName(
    match: Match
  ) {
    if (
      match.league.id === 172 &&
      language === "bg"
    ) {
      return "България - Първа лига";
    }

    if (
      match.league.id === 174 &&
      language === "bg"
    ) {
      return "България - Купа";
    }

    if (
      match.league.id === 39 &&
      language === "bg"
    ) {
      return "Англия - Premier League";
    }

    return `${match.league.country} - ${match.league.name}`;
  }
async function handlePrediction(
  match: Match
) {
  const user = auth.currentUser;

  if (!user) {
    router.push("/login");
    return;
  }

  if (!match.fixtureId) {
    setMessage(
      language === "bg"
        ? "Липсва Fixture ID."
        : "Fixture ID is missing."
    );
    return;
  }

  const key = String(
    match.fixtureId
  );

  const choice =
    selectedOptions[key];

  const points =
    amounts[key] ?? 100;

  if (!choice) {
    setMessage(
      language === "bg"
        ? "Избери Домакин, Равен или Гост."
        : "Choose Home, Draw or Away."
    );
    return;
  }

  if (points < 100) {
    setMessage(
      language === "bg"
        ? "Минималната прогноза е 100 точки."
        : "Minimum prediction is 100 points."
    );
    return;
  }

  if (points > balance) {
    setMessage(
      language === "bg"
        ? "Нямаш достатъчно точки."
        : "You do not have enough points."
    );
    return;
  }

  try {
    setSubmitting(key);
    setMessage("");

    const userRef = doc(
      db,
      "users",
      user.uid
    );

    const predictionRef = doc(
      collection(
        db,
        "predictions"
      )
    );

    const transactionRef = doc(
      collection(
        db,
        "transactions"
      )
    );

    await runTransaction(
      db,
      async (transaction) => {
        const userSnap =
          await transaction.get(
            userRef
          );

        if (!userSnap.exists()) {
          throw new Error(
            "USER_NOT_FOUND"
          );
        }

        const userData =
          userSnap.data();

        const currentBalance =
          Number(
            userData.balance
          ) || 0;

        const currentLocked =
          Number(
            userData.lockedPoints
          ) || 0;

        if (
          points >
          currentBalance
        ) {
          throw new Error(
            "INSUFFICIENT_BALANCE"
          );
        }

        const newBalance =
          currentBalance -
          points;

        const newLocked =
          currentLocked +
          points;

        transaction.update(
          userRef,
          {
            balance:
              newBalance,
            lockedPoints:
              newLocked,
          }
        );

        transaction.set(
          predictionRef,
          {
            userId:
              user.uid,

            category:
              "football",

            fixtureId:
              match.fixtureId,

            leagueId:
              match.league.id,

            leagueName:
              match.league.name,

            homeTeam:
              match.home.name,

            awayTeam:
              match.away.name,

            event:
              `${match.home.name} vs ${match.away.name}`,

            eventBg:
              `${match.home.name} срещу ${match.away.name}`,

            choice,

            points,

            status:
              "active",

            result:
              "pending",

            balanceChange:
              -points,

            fixtureDate:
              match.date,

            development:
              true,

            season:
              2024,

            createdAt:
              serverTimestamp(),
          }
        );

        transaction.set(
          transactionRef,
          {
            userId:
              user.uid,

            type:
              "prediction",

            description:
              `Prediction: ${match.home.name} vs ${match.away.name}`,

            amount:
              -points,

            balanceAfter:
              newBalance,

            status:
              "completed",

            predictionId:
              predictionRef.id,

            createdAt:
              serverTimestamp(),
          }
        );

        setBalance(
          newBalance
        );
      }
    );

    setSelectedOptions(
      (current) => ({
        ...current,
        [key]: "",
      })
    );

    setAmounts(
      (current) => ({
        ...current,
        [key]: 100,
      })
    );

    setMessage(
      language === "bg"
        ? "Тестовата футболна прогноза е записана успешно."
        : "Development football prediction saved successfully."
    );
  } catch (error) {
    console.error(
      "FOOTBALL PREDICTION ERROR:",
      error
    );

    setMessage(
      language === "bg"
        ? "Възникна грешка при записването на прогнозата."
        : "An error occurred while saving the prediction."
    );
  } finally {
    setSubmitting(null);
  }
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
        <div className="mb-8">
          <p className="text-sm font-semibold text-emerald-400">
            {t.leagues}
          </p>

          <p className="mt-2 text-sm text-amber-300">
            {t.development}
          </p>
          <p className="mt-2 text-sm font-semibold text-emerald-400">
  {language === "bg"
    ? "Наличен баланс"
    : "Available balance"}
  : {balance.toLocaleString()}{" "}
  {language === "bg"
    ? "точки"
    : "points"}
</p>
{message && (
  <div className="mt-4 rounded-2xl border border-emerald-500/20 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-300">
    {message}
  </div>
)}
        </div>

        {loading ? (
          <div className="rounded-3xl border border-slate-800 bg-slate-900 p-7 text-slate-400">
            {t.loading}
          </div>
        ) : error ? (
          <div className="rounded-3xl border border-red-500/20 bg-red-500/10 p-7 text-red-300">
            {error}
          </div>
        ) : matches.length === 0 ? (
          <div className="rounded-3xl border border-slate-800 bg-slate-900 p-7 text-slate-400">
            {t.noMatches}
          </div>
        ) : (
          <div className="grid gap-5 xl:grid-cols-3">
            {matches.map((match) => {
              const key = String(
                match.fixtureId
              );

              const selected =
                selectedOptions[key];

              const isFinished =
                match.status === "FT";

              return (
                <article
                  key={key}
                  className="rounded-3xl border border-slate-800 bg-slate-900 p-6"
                >
                  <div className="flex items-center justify-between gap-3">
                    <span className="rounded-full bg-slate-800 px-3 py-1 text-xs font-semibold text-slate-300">
                      {getLeagueName(match)}
                    </span>

                    <span
                      className={`text-xs font-bold ${
                        isFinished
                          ? "text-slate-400"
                          : "text-emerald-400"
                      }`}
                    >
                      {isFinished
                        ? t.finished
                        : t.open}
                    </span>
                  </div>

                  <h2 className="mt-5 text-xl font-bold">
                    {match.home.name} vs{" "}
                    {match.away.name}
                  </h2>

                  <p className="mt-3 text-sm text-slate-400">
                    {t.start}:{" "}
                    {formatMatchDate(
                      match.date
                    )}
                  </p>

                  <p className="mt-1 text-sm text-slate-500">
                    Fixture ID:{" "}
                    {match.fixtureId}
                  </p>

                  <p className="mt-1 text-sm text-slate-500">
                    {t.minimum}
                  </p>

                  <div className="mt-6 grid grid-cols-3 gap-2">
                    <button
                      type="button"
                      
                      onClick={() =>
                        setSelectedOptions(
                          (current) => ({
                            ...current,
                            [key]: "home",
                          })
                        )
                      }
                      className={`rounded-xl border px-3 py-3 text-sm font-semibold ${
                        selected === "home"
                          ? "border-emerald-400 bg-emerald-500 text-slate-950"
                          : "border-slate-700 hover:border-emerald-400"
                      } disabled:cursor-not-allowed disabled:opacity-40`}
                    >
                      {t.home}
                    </button>

                    <button
                      type="button"
                      
                      onClick={() =>
                        setSelectedOptions(
                          (current) => ({
                            ...current,
                            [key]: "draw",
                          })
                        )
                      }
                      className={`rounded-xl border px-3 py-3 text-sm font-semibold ${
                        selected === "draw"
                          ? "border-emerald-400 bg-emerald-500 text-slate-950"
                          : "border-slate-700 hover:border-emerald-400"
                      } disabled:cursor-not-allowed disabled:opacity-40`}
                    >
                      {t.draw}
                    </button>

                    <button
                      type="button"
                      
                      onClick={() =>
                        setSelectedOptions(
                          (current) => ({
                            ...current,
                            [key]: "away",
                          })
                        )
                      }
                      className={`rounded-xl border px-3 py-3 text-sm font-semibold ${
                        selected === "away"
                          ? "border-emerald-400 bg-emerald-500 text-slate-950"
                          : "border-slate-700 hover:border-emerald-400"
                      } disabled:cursor-not-allowed disabled:opacity-40`}
                    >
                      {t.away}
                    </button>
                  </div>

                  <div className="mt-4">
                    <label className="mb-2 block text-sm text-slate-400">
                      {t.points}
                    </label>

                    <input
                      type="number"
                      min="100"
                      
                      value={
                        amounts[key] ?? 100
                      }
                      onChange={(event) =>
                        setAmounts(
                          (current) => ({
                            ...current,
                            [key]:
                              Number(
                                event.target
                                  .value
                              ) || 0,
                          })
                        )
                      }
                      className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none focus:border-emerald-400 disabled:opacity-40"
                    />
                  </div>

                <button
  type="button"
  disabled={
    !selected ||
    submitting === key
  }
  onClick={() =>
    handlePrediction(match)
  }
  className="mt-4 w-full rounded-xl bg-emerald-500 px-4 py-3 font-bold text-slate-950 hover:bg-emerald-400 disabled:cursor-not-allowed disabled:opacity-40"
>
  {submitting === key
    ? language === "bg"
      ? "Записване..."
      : "Saving..."
    : t.confirm}
</button>
                  </button>
                </article>
              );
            })}
          </div>
        )}

        <section className="mt-14">
          <div className="mb-6">
            <p className="text-sm font-semibold text-amber-400">
              {t.longTerm}
            </p>
          </div>

          <div className="grid gap-5 md:grid-cols-2">
            {longTermMarkets.map(
              (market) => (
                <article
                  key={market.en}
                  className="rounded-3xl border border-amber-500/20 bg-slate-900 p-6"
                >
                  <span className="rounded-full bg-amber-500/10 px-3 py-1 text-xs font-semibold text-amber-300">
                    LONG-TERM
                  </span>

                  <h3 className="mt-5 text-xl font-bold">
                    {language === "bg"
                      ? market.bg
                      : market.en}
                  </h3>

                  <p className="mt-3 text-sm text-slate-400">
                    {t.longTermMinimum}
                  </p>

                  <button className="mt-6 rounded-xl border border-amber-400 px-5 py-3 font-bold text-amber-300 hover:bg-amber-400 hover:text-slate-950">
                    {t.view}
                  </button>
                </article>
              )
            )}
          </div>
        </section>
      </section>
    </main>
  );
}