"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { onAuthStateChanged } from "firebase/auth";
import {
  collection,
  doc,
  getDoc,
  runTransaction,
  serverTimestamp,
} from "firebase/firestore";

import { auth, db } from "@/lib/firebase";

type Language = "bg" | "en";

type Match = {
  eventId: string;
  home: string;
  away: string;
  homeLogo: string;
  awayLogo: string;
  competition: string;
  competitionLogo: string;
  time: string | null;
  matchDateSofia: string;
  closesOn: string;
  closesAt: string;
  predictionOpen: boolean;
  status: string;
  sourceUrl: string;
};

type CompetitionSection = {
  competition: string;
  competitionSlug: string;
  nextDate: string | null;
  count: number;
  matches: Match[];
};

type NextFootballResponse = {
  timezone?: string;
  rule?: string;
  from?: string;
  searchDays?: number;
  count?: number;
  sections?: CompetitionSection[];
  matches?: Match[];
};

const competitionOrder = [
  "English Premier League",
  "Spanish La Liga",
  "Bundesliga",
  "French Ligue 1",
  "Bulgarian First League",
  "Bulgarian Cup",
];

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
  const router = useRouter();

  const [language, setLanguage] = useState<Language>("bg");
  const [sections, setSections] = useState<CompetitionSection[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [selectedOptions, setSelectedOptions] = useState<
    Record<string, string>
  >({});

  const [amounts, setAmounts] = useState<Record<string, number>>({});
  const [balance, setBalance] = useState(0);
  const [submitting, setSubmitting] = useState<string | null>(null);
  const [message, setMessage] = useState("");

  const t =
    language === "bg"
      ? {
          title: "Футбол",
          subtitle: "Предстоящи футболни прогнози",
          back: "Обратно към таблото",
          open: "ОТВОРЕНО",
          closed: "ЗАТВОРЕНО",
          start: "Начало",
          deadline: "Прогнозите се приемат до",
          minimum: "Минимум: 100 точки",
          home: "Домакин",
          draw: "Равен",
          away: "Гост",
          points: "Точки",
          confirm: "Потвърди прогноза",
          leagues: "Следващи футболни срещи",
          nextDate: "Направете прогноза за",
          longTerm: "Дългосрочни футболни прогнози",
          longTermMinimum: "Минимум: 1 000 точки",
          view: "Виж пазара",
          loading: "Търсим следващите футболни срещи...",
          noMatches:
            "Няма намерени предстоящи мачове през следващите 30 дни.",
          balance: "Наличен баланс",
          saved: "Футболната прогноза е записана успешно.",
        }
      : {
          title: "Football",
          subtitle: "Upcoming football predictions",
          back: "Back to dashboard",
          open: "OPEN",
          closed: "CLOSED",
          start: "Starts",
          deadline: "Predictions accepted until",
          minimum: "Minimum: 100 points",
          home: "Home",
          draw: "Draw",
          away: "Away",
          points: "Points",
          confirm: "Confirm prediction",
          leagues: "Next football matches",
          nextDate: "Make your prediction for",
          longTerm: "Long-term football predictions",
          longTermMinimum: "Minimum: 1,000 points",
          view: "View market",
          loading: "Looking for the next football matches...",
          noMatches: "No upcoming matches found in the next 30 days.",
          balance: "Available balance",
          saved: "Football prediction saved successfully.",
        };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        router.push("/login");
        return;
      }

      try {
        const userRef = doc(db, "users", user.uid);
        const userSnap = await getDoc(userRef);

        if (userSnap.exists()) {
          const data = userSnap.data();
          setBalance(Number(data.balance) || 0);
        }
      } catch (error) {
        console.error("FOOTBALL USER ERROR:", error);
      }
    });

    return () => unsubscribe();
  }, [router]);

  useEffect(() => {
    async function loadMatches() {
      try {
        setLoading(true);
        setError("");

        const response = await fetch("/api/football/next", {
          cache: "no-store",
        });

        if (!response.ok) {
          throw new Error("Failed to load football fixtures");
        }

        const data: NextFootballResponse = await response.json();

        setSections(
          Array.isArray(data.sections)
            ? data.sections
            : []
        );
      } catch (error) {
        console.error("FOOTBALL PAGE ERROR:", error);

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
  }, []);

  function formatMatchDate(value: string | null) {
    if (!value) {
      return "—";
    }

    const date = new Date(value);

    return date.toLocaleString(language === "bg" ? "bg-BG" : "en-GB", {
      timeZone: "Europe/Sofia",
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  function formatDateOnly(
    value: string | null | undefined
  ) {
    if (!value) {
      return "—";
    }

    const parts = value.split("-");

    if (parts.length !== 3) {
      return value;
    }

    const [year, month, day] = parts;

    if (language === "bg") {
      return `${day}.${month}.${year}`;
    }

    return `${day}/${month}/${year}`;
  }

  function getCompetitionName(competition: string) {
    if (language === "en") {
      return competition;
    }

    const names: Record<string, string> = {
      "English Premier League": "Англия - Premier League",
      "Spanish La Liga": "Испания - La Liga",
      Bundesliga: "Германия - Bundesliga",
      "French Ligue 1": "Франция - Ligue 1",
      "Bulgarian First League": "България - Първа лига",
      "Bulgarian Cup": "България - Купа",
    };

    return names[competition] ?? competition;
  }

  async function handlePrediction(match: Match) {
    const user = auth.currentUser;

    if (!user) {
      router.push("/login");
      return;
    }

    if (!match.eventId) {
      setMessage(
        language === "bg"
          ? "Липсва идентификатор на събитието."
          : "Event identifier is missing."
      );
      return;
    }

    if (!match.predictionOpen) {
      setMessage(
        language === "bg"
          ? "Прогнозите за този мач вече са затворени."
          : "Predictions for this match are already closed."
      );
      return;
    }

    const key = match.eventId;
    const choice = selectedOptions[key];
    const points = amounts[key] ?? 100;

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

      const userRef = doc(db, "users", user.uid);
      const predictionRef = doc(collection(db, "predictions"));
      const transactionRef = doc(collection(db, "transactions"));

      await runTransaction(db, async (transaction) => {
        const userSnap = await transaction.get(userRef);

        if (!userSnap.exists()) {
          throw new Error("USER_NOT_FOUND");
        }

        const userData = userSnap.data();

        const currentBalance =
          Number(userData.balance) || 0;

        const currentLocked =
          Number(userData.lockedPoints) || 0;

        if (points > currentBalance) {
          throw new Error("INSUFFICIENT_BALANCE");
        }

        const newBalance =
          currentBalance - points;

        const newLocked =
          currentLocked + points;

        transaction.update(userRef, {
          balance: newBalance,
          lockedPoints: newLocked,
        });

        transaction.set(predictionRef, {
          userId: user.uid,
          category: "football",
          provider: "sportscore",
          eventId: match.eventId,
          sourceUrl: match.sourceUrl,
          competition: match.competition,
          homeTeam: match.home,
          awayTeam: match.away,
          event: `${match.home} vs ${match.away}`,
          eventBg: `${match.home} срещу ${match.away}`,
          choice,
          points,
          status: "active",
          result: "pending",
          balanceChange: -points,
          eventTime: match.time,
          matchDateSofia: match.matchDateSofia,
          closesOn: match.closesOn,
          closesAt: match.closesAt,
          createdAt: serverTimestamp(),
        });

        transaction.set(transactionRef, {
          userId: user.uid,
          type: "prediction",
          description: `Prediction: ${match.home} vs ${match.away}`,
          amount: -points,
          balanceAfter: newBalance,
          status: "completed",
          predictionId: predictionRef.id,
          eventId: match.eventId,
          provider: "sportscore",
          createdAt: serverTimestamp(),
        });

        setBalance(newBalance);
      });

      setSelectedOptions((current) => ({
        ...current,
        [key]: "",
      }));

      setAmounts((current) => ({
        ...current,
        [key]: 100,
      }));

      setMessage(t.saved);
    } catch (error) {
      console.error("FOOTBALL PREDICTION ERROR:", error);

      setMessage(
        language === "bg"
          ? "Възникна грешка при записването на прогнозата."
          : "An error occurred while saving the prediction."
      );
    } finally {
      setSubmitting(null);
    }
  }

  const orderedSections = [...sections].sort((a, b) => {
    const aIndex = competitionOrder.indexOf(a.competition);
    const bIndex = competitionOrder.indexOf(b.competition);

    return (
      (aIndex === -1 ? 999 : aIndex) -
      (bIndex === -1 ? 999 : bIndex)
    );
  });

  const hasMatches = orderedSections.some(
    (section) =>
      Array.isArray(section.matches) &&
      section.matches.length > 0
  );

  function renderMatchCard(match: Match) {
    const key = match.eventId;
    const selected = selectedOptions[key];
    const closed = !match.predictionOpen;

    return (
      <article
        key={key}
        className="rounded-3xl border border-slate-800 bg-slate-900 p-6"
      >
        <div className="flex items-center justify-between gap-3">
          <span className="rounded-full bg-slate-800 px-3 py-1 text-xs font-semibold text-slate-300">
            {getCompetitionName(match.competition)}
          </span>

          <span
            className={`text-xs font-bold ${
              closed
                ? "text-slate-500"
                : "text-emerald-400"
            }`}
          >
            {closed ? t.closed : t.open}
          </span>
        </div>

        <h3 className="mt-5 text-xl font-bold">
          {match.home} vs {match.away}
        </h3>

        <p className="mt-3 text-sm text-slate-400">
          {t.start}: {formatMatchDate(match.time)}
        </p>

        <p className="mt-2 text-sm text-amber-300">
          {t.deadline}: {formatDateOnly(match.closesOn)} 23:59
        </p>

        <p className="mt-2 text-sm text-slate-500">
          {t.minimum}
        </p>

        <div className="mt-6 grid grid-cols-3 gap-2">
          <button
            type="button"
            disabled={closed}
            onClick={() =>
              setSelectedOptions((current) => ({
                ...current,
                [key]: "home",
              }))
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
            disabled={closed}
            onClick={() =>
              setSelectedOptions((current) => ({
                ...current,
                [key]: "draw",
              }))
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
            disabled={closed}
            onClick={() =>
              setSelectedOptions((current) => ({
                ...current,
                [key]: "away",
              }))
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
            disabled={closed}
            value={amounts[key] ?? 100}
            onChange={(event) =>
              setAmounts((current) => ({
                ...current,
                [key]:
                  Number(event.target.value) || 0,
              }))
            }
            className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none focus:border-emerald-400 disabled:opacity-40"
          />
        </div>

        <button
          type="button"
          disabled={
            closed ||
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
      </article>
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
                onClick={() => setLanguage("bg")}
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
                onClick={() => setLanguage("en")}
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

          <div className="mt-4 rounded-2xl border border-emerald-500/20 bg-emerald-500/10 p-5">
            <p className="text-sm text-slate-300">
              {language === "bg"
                ? "Всяко първенство показва своята най-близка дата с налични мачове. Прогнозите се затварят в 23:59 ч. в деня преди мача."
                : "Each competition shows its nearest available match date. Predictions close at 23:59 on the day before the match."}
            </p>
          </div>

          <p className="mt-4 text-sm font-semibold text-emerald-400">
            {t.balance}: {balance.toLocaleString()}{" "}
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
        ) : !hasMatches ? (
          <div className="rounded-3xl border border-slate-800 bg-slate-900 p-7 text-slate-400">
            {t.noMatches}
          </div>
        ) : (
          <div className="space-y-12">
            {orderedSections.map((section) => {
              if (
                !Array.isArray(section.matches) ||
                section.matches.length === 0
              ) {
                return null;
              }

              return (
                <section
                  key={section.competitionSlug}
                  className="scroll-mt-6"
                >
                  <div className="mb-5 rounded-2xl border border-slate-800 bg-slate-900/60 px-5 py-4">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div>
                        <p className="text-sm font-semibold text-emerald-400">
                          {getCompetitionName(
                            section.competition
                          )}
                        </p>

                        <h2 className="mt-1 text-xl font-bold">
                          {t.nextDate}{" "}
                          {formatDateOnly(
                            section.nextDate
                          )}
                        </h2>
                      </div>

                      <span className="rounded-full bg-slate-800 px-3 py-1 text-xs font-semibold text-slate-300">
                        {section.count}{" "}
                        {language === "bg"
                          ? section.count === 1
                            ? "мач"
                            : "мача"
                          : section.count === 1
                            ? "match"
                            : "matches"}
                      </span>
                    </div>
                  </div>

                  <div className="grid gap-5 xl:grid-cols-3">
                    {section.matches.map(
                      renderMatchCard
                    )}
                  </div>
                </section>
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
            {longTermMarkets.map((market) => (
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
            ))}
          </div>
        </section>
      </section>
    </main>
  );
}
