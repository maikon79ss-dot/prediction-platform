"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

import { onAuthStateChanged } from "firebase/auth";
import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  runTransaction,
  serverTimestamp,
  where,
} from "firebase/firestore";

import { auth, db } from "@/lib/firebase";

type Language = "bg" | "en";

type DashboardMatch = {
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

type CompetitionSection = {
  competition: string;
  competitionSlug: string;
  nextDate: string | null;
  count: number;
  matches: DashboardMatch[];
};

type NextFootballResponse = {
  sections?: CompetitionSection[];
};

type UserPrediction = {
  id: string;
  category: string;
  event: string;
  eventBg: string;
  choice: string;
  points: number;
  status: string;
  result: string;
};

const dashboardCompetitionOrder = [
  "English Premier League",
  "Spanish La Liga",
  "Bundesliga",
  "French Ligue 1",
  "Bulgarian First League",
  "Bulgarian Cup",
];

export default function DashboardPage() {
  const [language, setLanguage] = useState<Language>("bg");

  const [balance, setBalance] = useState(0);
  const [lockedPoints, setLockedPoints] = useState(0);
  const [userName, setUserName] = useState("");
  const [loadingUser, setLoadingUser] = useState(true);

  const [predictions, setPredictions] = useState<UserPrediction[]>([]);
  const [predictionStats, setPredictionStats] = useState({
  total: 0,
  won: 0,
  lost: 0,
  refund: 0,
});
  const [openMatches, setOpenMatches] = useState<DashboardMatch[]>([]);
  const [loadingMatches, setLoadingMatches] = useState(true);

  const [selectedOptions, setSelectedOptions] = useState<
    Record<string, string>
  >({});

  const [amounts, setAmounts] = useState<Record<string, number>>({});
  const [submitting, setSubmitting] = useState<string | null>(null);
  const [message, setMessage] = useState("");

  const router = useRouter();

  const t =
    language === "bg"
      ? {
          dashboard: "Табло",
          welcome: "Добре дошъл",
          subtitle: "Твоето табло за прогнози",
          available: "Налични",
          locked: "Заключени",
          points: "точки",
          predictions: "Прогнози",
          correct: "Познати",
          accuracy: "Точност",
          ranking: "Класиране",
          upcoming: "Предстоящи събития",
          openPredictions: "Отворени прогнози",
          dailyMinimum: "Минимум за ежедневна прогноза: 100 точки",
          startsAt: "Начало",
          deadline: "Прогнозите се приемат до",
          amount: "Точки",
          makePrediction: "Потвърди прогноза",
          football: "Футбол",
          open: "OPEN",
          chooseOption: "Избери Домакин, Равен или Гост.",
          minimumError: "Минималната прогноза е 100 точки.",
          balanceError: "Нямаш достатъчно точки в баланса.",
          success: "Прогнозата е приета успешно.",
          loadingEvents: "Зареждане на реалните предстоящи събития...",
          noEvents: "В момента няма намерени отворени футболни събития.",
          viewAllFootball: "Виж всички футболни срещи",
          myPredictions: "Моите активни прогнози",
          noPredictions: "Все още нямаш активни прогнози.",
          longTerm: "Дългосрочна прогноза",
          leagueQuestion: "Кой ще спечели Premier League?",
          minimum1000: "Минимум: 1 000 точки",
          viewMarket: "Виж прогнозата",
          weatherPrediction: "Прогноза за времето",
          rainQuestion: "Какво ще бъде времето днес?",
          closes: "Прогнозите са отворени от 09:00 до 11:00",
          menu: [
            "Преглед",
            "Спорт на живо",
            "Футбол",
            "Тенис",
            "Баскетбол",
            "Време",
            "Дългосрочни",
            "Моите прогнози",
            "Баланс",
            "Класация",
            "История",
            "Профил",
          ],
        }
      : {
          dashboard: "Dashboard",
          welcome: "Welcome back",
          subtitle: "Your prediction dashboard",
          available: "Available",
          locked: "Locked",
          points: "points",
          predictions: "Predictions",
          correct: "Correct",
          accuracy: "Accuracy",
          ranking: "Ranking",
          upcoming: "Upcoming events",
          openPredictions: "Open Predictions",
          dailyMinimum: "Daily minimum: 100 points",
          startsAt: "Starts",
          deadline: "Predictions accepted until",
          amount: "Points",
          makePrediction: "Confirm prediction",
          football: "Football",
          open: "OPEN",
          chooseOption: "Choose Home, Draw or Away.",
          minimumError: "The minimum prediction is 100 points.",
          balanceError: "You do not have enough points.",
          success: "Prediction submitted successfully.",
          loadingEvents: "Loading real upcoming events...",
          noEvents: "No open football events were found.",
          viewAllFootball: "View all football matches",
          myPredictions: "My active predictions",
          noPredictions: "You do not have any active predictions yet.",
          longTerm: "Long-term prediction",
          leagueQuestion: "Who will win the Premier League?",
          minimum1000: "Minimum: 1,000 points",
          viewMarket: "View market",
          weatherPrediction: "Weather prediction",
          rainQuestion: "What will the weather be today?",
          closes: "Predictions are open from 09:00 to 11:00",
          menu: [
            "Overview",
            "Live Sports",
            "Football",
            "Tennis",
            "Basketball",
            "Weather",
            "Long-Term",
            "My Predictions",
            "Balance",
            "Rankings",
            "History",
            "Profile",
          ],
        };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        router.push("/login");
        return;
      }

      try {
        const userRef = doc(db, "users", user.uid);

        const predictionsQuery = query(
          collection(db, "predictions"),
          where("userId", "==", user.uid)
        );

        const [userSnap, predictionsSnap] = await Promise.all([
          getDoc(userRef),
          getDocs(predictionsQuery),
        ]);

     if (userSnap.exists()) {
  const data = userSnap.data();

  setBalance(Number(data.balance) || 0);
  setLockedPoints(Number(data.lockedPoints) || 0);
  setUserName(data.name ?? user.displayName ?? "");

  const stats = data.stats ?? {};

  setPredictionStats({
    total:
      Number(stats.totalPredictions) || 0,

    won:
      Number(stats.wonPredictions) || 0,

    lost:
      Number(stats.lostPredictions) || 0,

    refund:
      Number(stats.refundPredictions) || 0,
  });
}

        const loadedPredictions: UserPrediction[] =
          predictionsSnap.docs.map((docSnap) => {
            const data = docSnap.data();

            return {
              id: docSnap.id,
              category: String(data.category ?? ""),
              event: String(data.event ?? ""),
              eventBg: String(data.eventBg ?? data.event ?? ""),
              choice: String(data.choice ?? ""),
              points: Number(data.points) || 0,
              status: String(data.status ?? ""),
              result: String(data.result ?? ""),
            };
          });

        setPredictions(loadedPredictions);
      } catch (error) {
        console.error("DASHBOARD USER ERROR:", error);
      } finally {
        setLoadingUser(false);
      }
    });

    return () => unsubscribe();
  }, [router]);

  useEffect(() => {
    async function loadOpenMatches() {
      try {
        setLoadingMatches(true);

        const response = await fetch("/api/football/next", {
          cache: "no-store",
        });

        if (!response.ok) {
          throw new Error("FAILED_TO_LOAD_FOOTBALL");
        }

        const data: NextFootballResponse = await response.json();

        const sections = Array.isArray(data.sections)
          ? data.sections
          : [];

        const orderedSections = [...sections].sort((a, b) => {
          const aIndex = dashboardCompetitionOrder.indexOf(
            a.competition
          );

          const bIndex = dashboardCompetitionOrder.indexOf(
            b.competition
          );

          return (
            (aIndex === -1 ? 999 : aIndex) -
            (bIndex === -1 ? 999 : bIndex)
          );
        });

        const selectedMatches: DashboardMatch[] = [];

        for (const section of orderedSections) {
          const firstOpenMatch = section.matches?.find(
            (match) => match.predictionOpen
          );

          if (firstOpenMatch) {
            selectedMatches.push(firstOpenMatch);
          }

          if (selectedMatches.length === 3) {
            break;
          }
        }

        setOpenMatches(selectedMatches);
      } catch (error) {
        console.error("DASHBOARD OPEN MATCHES ERROR:", error);
        setOpenMatches([]);
      } finally {
        setLoadingMatches(false);
      }
    }

    loadOpenMatches();
  }, []);

  function formatMatchDate(value: string | null) {
    if (!value) {
      return "—";
    }

    const date = new Date(value);

    return date.toLocaleString(
      language === "bg" ? "bg-BG" : "en-GB",
      {
        timeZone: "Europe/Sofia",
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      }
    );
  }

  function formatDateOnly(value: string) {
    const parts = value.split("-");

    if (parts.length !== 3) {
      return value;
    }

    const [year, month, day] = parts;

    return language === "bg"
      ? `${day}.${month}.${year}`
      : `${day}/${month}/${year}`;
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

  function getChoiceLabel(choice: string) {
    if (language === "en") {
      const labels: Record<string, string> = {
        home: "Home",
        draw: "Draw",
        away: "Away",
      };

      return labels[choice] ?? choice;
    }

    const labels: Record<string, string> = {
      home: "Домакин",
      draw: "Равен",
      away: "Гост",
    };

    return labels[choice] ?? choice;
  }

  async function handlePrediction(match: DashboardMatch) {
    const user = auth.currentUser;

    if (!user) {
      router.push("/login");
      return;
    }

    const key = match.eventId;
    const selected = selectedOptions[key];
    const amount = amounts[key] ?? 100;

    if (!selected) {
      setMessage(t.chooseOption);
      return;
    }

    if (amount < 100) {
      setMessage(t.minimumError);
      return;
    }

    if (amount > balance) {
      setMessage(t.balanceError);
      return;
    }

    try {
      setSubmitting(key);
      setMessage("");

      const userRef = doc(db, "users", user.uid);
      const predictionRef = doc(collection(db, "predictions"));
      const transactionRef = doc(collection(db, "transactions"));

      let newBalanceAfter = 0;
      let newLockedAfter = 0;

      await runTransaction(db, async (transaction) => {
        const userSnap = await transaction.get(userRef);

        if (!userSnap.exists()) {
          throw new Error("USER_NOT_FOUND");
        }

        const userData = userSnap.data();

        const currentBalance =
          Number(userData.balance) || 0;

        const currentLockedPoints =
          Number(userData.lockedPoints) || 0;

        if (amount > currentBalance) {
          throw new Error("INSUFFICIENT_BALANCE");
        }

        const newBalance =
          currentBalance - amount;

        const newLockedPoints =
          currentLockedPoints + amount;

        newBalanceAfter = newBalance;
        newLockedAfter = newLockedPoints;

        transaction.update(userRef, {
          balance: newBalance,
          lockedPoints: newLockedPoints,
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
          choice: selected,
          points: amount,
          status: "active",
          result: "pending",
          balanceChange: -amount,
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
          amount: -amount,
          balanceAfter: newBalance,
          status: "completed",
          predictionId: predictionRef.id,
          eventId: match.eventId,
          provider: "sportscore",
          createdAt: serverTimestamp(),
        });
      });

      setBalance(newBalanceAfter);
      setLockedPoints(newLockedAfter);

      setPredictions((current) => [
        {
          id: predictionRef.id,
          category: "football",
          event: `${match.home} vs ${match.away}`,
          eventBg: `${match.home} срещу ${match.away}`,
          choice: selected,
          points: amount,
          status: "active",
          result: "pending",
        },
        ...current,
      ]);

      setSelectedOptions((current) => ({
        ...current,
        [key]: "",
      }));

      setAmounts((current) => ({
        ...current,
        [key]: 100,
      }));

      setMessage(t.success);
    } catch (error) {
      console.error("PREDICTION ERROR:", error);

      if (
        error instanceof Error &&
        error.message === "INSUFFICIENT_BALANCE"
      ) {
        setMessage(t.balanceError);
        return;
      }

      setMessage(
        language === "bg"
          ? "Възникна грешка при записването на прогнозата."
          : "An error occurred while saving the prediction."
      );
    } finally {
      setSubmitting(null);
    }
  }

  const activePredictions = predictions.filter(
  (prediction) =>
    prediction.status === "active"
);

const settledForAccuracy =
  predictionStats.won +
  predictionStats.lost;

const accuracy =
  settledForAccuracy > 0
    ? `${Math.round(
        (
          predictionStats.won /
          settledForAccuracy
        ) * 100
      )}%`
    : "—";

  if (loadingUser) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-950 text-white">
        <p className="text-slate-400">
          {language === "bg" ? "Зареждане..." : "Loading..."}
        </p>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <div className="flex min-h-screen">
        <aside className="hidden w-64 border-r border-slate-800 bg-slate-900 lg:block">
          <div className="border-b border-slate-800 px-6 py-6">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-emerald-400">
              Prediction Platform
            </p>

            <h1 className="mt-2 text-xl font-bold">
              {t.dashboard}
            </h1>
          </div>

          <nav className="space-y-1 p-4">
            {t.menu.map((item, index) => {
              const routes = [
                "/dashboard",
                "/dashboard",
                "/dashboard/football",
                "/dashboard/tennis",
                "/dashboard/basketball",
                "/dashboard/weather",
                "/dashboard/long-term",
                "/dashboard/my-predictions",
                "/dashboard/balance",
                "/dashboard/rankings",
                "/dashboard/history",
                "/dashboard/profile",
              ];

              return (
                <Link
                  key={item}
                  href={routes[index]}
                  className={`block w-full rounded-xl px-4 py-3 text-left text-sm font-medium transition ${
                    index === 0
                      ? "bg-emerald-500 text-slate-950"
                      : "text-slate-300 hover:bg-slate-800 hover:text-white"
                  }`}
                >
                  {item}
                </Link>
              );
            })}
          </nav>
        </aside>

        <section className="flex-1">
          <header className="border-b border-slate-800 bg-slate-950/95">
            <div className="flex flex-wrap items-center justify-between gap-4 px-6 py-5 lg:px-8">
              <div>
                <p className="text-sm text-slate-400">
                  {t.welcome}
                  {userName ? `, ${userName}` : ""}
                </p>

                <h2 className="text-2xl font-bold">
                  {t.subtitle}
                </h2>
              </div>

              <div className="flex flex-wrap items-center gap-3">
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

                <div className="rounded-2xl border border-slate-700 bg-slate-900 px-5 py-3">
                  <p className="text-xs uppercase tracking-wider text-slate-400">
                    {t.available}
                  </p>

                  <p className="text-xl font-bold text-emerald-400">
                    {balance.toLocaleString()} {t.points}
                  </p>
                </div>

                <div className="rounded-2xl border border-slate-700 bg-slate-900 px-5 py-3">
                  <p className="text-xs uppercase tracking-wider text-slate-400">
                    {t.locked}
                  </p>

                  <p className="text-xl font-bold">
                    {lockedPoints.toLocaleString()} {t.points}
                  </p>
                </div>
              </div>
            </div>
          </header>

          <div className="p-6 lg:p-8">
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
           <StatCard
  label={t.correct}
  value={String(predictionStats.won)}
/>

              <StatCard
                label={t.correct}
                value={String(wonPredictions.length)}
              />

              <StatCard
                label={t.accuracy}
                value={accuracy}
              />

              <StatCard
                label={t.ranking}
                value="—"
              />
            </div>

            {message && (
              <div className="mt-6 rounded-2xl border border-emerald-500/20 bg-emerald-500/10 px-5 py-4 text-sm font-semibold text-emerald-300">
                {message}
              </div>
            )}

            <section className="mt-10">
              <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
                <div>
                  <p className="text-sm font-medium text-emerald-400">
                    {t.upcoming}
                  </p>

                  <h3 className="text-3xl font-bold">
                    {t.openPredictions}
                  </h3>
                </div>

                <p className="text-sm text-slate-400">
                  {t.dailyMinimum}
                </p>
              </div>

              {loadingMatches ? (
                <div className="rounded-3xl border border-slate-800 bg-slate-900 p-6 text-slate-400">
                  {t.loadingEvents}
                </div>
              ) : openMatches.length === 0 ? (
                <div className="rounded-3xl border border-slate-800 bg-slate-900 p-6 text-slate-400">
                  {t.noEvents}
                </div>
              ) : (
                <>
                  <div className="grid gap-5 xl:grid-cols-3">
                    {openMatches.map((match) => {
                      const key = match.eventId;
                      const selected = selectedOptions[key];

                      return (
                        <article
                          key={key}
                          className="rounded-3xl border border-slate-800 bg-slate-900 p-6"
                        >
                          <div className="flex items-center justify-between gap-3">
                            <div className="flex flex-wrap items-center gap-2">
                              <span className="rounded-full bg-slate-800 px-3 py-1 text-xs font-semibold text-slate-300">
                                {t.football}
                              </span>

                              <span className="text-xs text-slate-500">
                                {getCompetitionName(
                                  match.competition
                                )}
                              </span>
                            </div>

                            <span className="text-xs font-bold text-emerald-400">
                              {t.open}
                            </span>
                          </div>

                          <h4 className="mt-5 text-xl font-bold">
                            {match.home} vs {match.away}
                          </h4>

                          <p className="mt-3 text-sm text-slate-400">
                            {t.startsAt}:{" "}
                            {formatMatchDate(match.time)}
                          </p>

                          <p className="mt-2 text-sm text-amber-300">
                            {t.deadline}:{" "}
                            {formatDateOnly(match.closesOn)} 23:59
                          </p>

                          <div className="mt-6 grid grid-cols-3 gap-2">
                            {[
                              ["home", language === "bg" ? "Домакин" : "Home"],
                              ["draw", language === "bg" ? "Равен" : "Draw"],
                              ["away", language === "bg" ? "Гост" : "Away"],
                            ].map(([value, label]) => {
                              const isSelected =
                                selected === value;

                              return (
                                <button
                                  key={value}
                                  type="button"
                                  onClick={() =>
                                    setSelectedOptions(
                                      (current) => ({
                                        ...current,
                                        [key]: value,
                                      })
                                    )
                                  }
                                  className={`rounded-xl border px-3 py-3 text-sm font-semibold transition ${
                                    isSelected
                                      ? "border-emerald-400 bg-emerald-500 text-slate-950"
                                      : "border-slate-700 hover:border-emerald-400"
                                  }`}
                                >
                                  {label}
                                </button>
                              );
                            })}
                          </div>

                          <div className="mt-4">
                            <label className="mb-2 block text-sm text-slate-400">
                              {t.amount}
                            </label>

                            <input
                              type="number"
                              min="100"
                              value={amounts[key] ?? 100}
                              onChange={(event) =>
                                setAmounts((current) => ({
                                  ...current,
                                  [key]:
                                    Number(
                                      event.target.value
                                    ) || 0,
                                }))
                              }
                              className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none focus:border-emerald-400"
                            />
                          </div>

                          <button
                            type="button"
                            disabled={submitting === key}
                            onClick={() =>
                              handlePrediction(match)
                            }
                            className="mt-4 w-full rounded-xl bg-emerald-500 px-4 py-3 font-bold text-slate-950 hover:bg-emerald-400 disabled:cursor-not-allowed disabled:opacity-40"
                          >
                            {submitting === key
                              ? language === "bg"
                                ? "Записване..."
                                : "Saving..."
                              : t.makePrediction}
                          </button>
                        </article>
                      );
                    })}
                  </div>

                  <div className="mt-5">
                    <Link
                      href="/dashboard/football"
                      className="inline-flex rounded-xl border border-emerald-500/40 px-4 py-2 text-sm font-semibold text-emerald-300 hover:bg-emerald-500 hover:text-slate-950"
                    >
                      {t.viewAllFootball}
                    </Link>
                  </div>
                </>
              )}
            </section>

            <section className="mt-12">
              <div className="mb-5">
                <p className="text-sm font-medium text-emerald-400">
                  {t.myPredictions}
                </p>
              </div>

              {activePredictions.length === 0 ? (
                <div className="rounded-3xl border border-slate-800 bg-slate-900 p-6 text-slate-400">
                  {t.noPredictions}
                </div>
              ) : (
                <div className="space-y-3">
                  {activePredictions.slice(0, 5).map((prediction) => (
                    <div
                      key={prediction.id}
                      className="rounded-2xl border border-slate-800 bg-slate-900 p-5"
                    >
                      <div className="flex flex-wrap items-start justify-between gap-3">
                        <div>
                          <p className="font-bold">
                            {language === "bg"
                              ? prediction.eventBg
                              : prediction.event}
                          </p>

                          <p className="mt-2 text-sm text-slate-400">
                            {getChoiceLabel(prediction.choice)}
                          </p>
                        </div>

                        <p className="text-sm font-semibold text-emerald-400">
                          {prediction.points.toLocaleString()}{" "}
                          {t.points}
                        </p>
                      </div>
                    </div>
                  ))}

                  {activePredictions.length > 5 && (
                    <Link
                      href="/dashboard/my-predictions"
                      className="inline-flex rounded-xl border border-slate-700 px-4 py-2 text-sm font-semibold text-slate-300 hover:border-slate-500"
                    >
                      {language === "bg"
                        ? "Виж всички активни прогнози"
                        : "View all active predictions"}
                    </Link>
                  )}
                </div>
              )}
            </section>

            <section className="mt-12 grid gap-5 lg:grid-cols-2">
              <div className="rounded-3xl border border-amber-500/20 bg-slate-900 p-6">
                <p className="text-sm font-medium text-amber-400">
                  {t.longTerm}
                </p>

                <h3 className="mt-2 text-2xl font-bold">
                  {t.leagueQuestion}
                </h3>

                <p className="mt-3 text-sm text-slate-400">
                  {t.minimum1000}
                </p>

                <Link
                  href="/dashboard/long-term"
                  className="mt-6 inline-flex rounded-xl border border-amber-400 px-5 py-3 font-bold text-amber-300 hover:bg-amber-400 hover:text-slate-950"
                >
                  {t.viewMarket}
                </Link>
              </div>

              <div className="rounded-3xl border border-sky-500/20 bg-slate-900 p-6">
                <p className="text-sm font-medium text-sky-400">
                  {t.weatherPrediction}
                </p>

                <h3 className="mt-2 text-2xl font-bold">
                  {t.rainQuestion}
                </h3>

                <p className="mt-3 text-sm text-slate-400">
                  {t.closes}
                </p>

                <Link
                  href="/dashboard/weather"
                  className="mt-6 inline-flex rounded-xl border border-sky-400 px-5 py-3 font-bold text-sky-300 hover:bg-sky-400 hover:text-slate-950"
                >
                  {t.viewMarket}
                </Link>
              </div>
            </section>
          </div>
        </section>
      </div>
    </main>
  );
}

function StatCard({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5">
      <p className="text-sm text-slate-400">{label}</p>
      <p className="mt-2 text-3xl font-bold">{value}</p>
    </div>
  );
}
