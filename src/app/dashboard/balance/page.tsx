"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { onAuthStateChanged } from "firebase/auth";
import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  where,
} from "firebase/firestore";
import { auth, db } from "@/lib/firebase";

type Language = "bg" | "en";

type TransactionType =
  | "bonus"
  | "prediction"
  | "win"
  | "refund";

type Transaction = {
  id: string;
  type: TransactionType;
  titleBg: string;
  titleEn: string;
  amount: number;
  date: string;
};

export default function BalancePage() {
  const [language, setLanguage] = useState<Language>("bg");
  const [availableBalance, setAvailableBalance] = useState(0);
  const [lockedBalance, setLockedBalance] = useState(0);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  const router = useRouter();

  const totalBalance = availableBalance + lockedBalance;

  const t =
    language === "bg"
      ? {
          title: "Баланс",
          subtitle:
            "Следи наличните, заключените и всички движения на точки",
          back: "Обратно към таблото",
          available: "Налични точки",
          locked: "Заключени точки",
          total: "Общо точки",
          history: "История на движенията",
          amount: "Промяна",
          bonus: "Бонус",
          prediction: "Прогноза",
          win: "Печалба",
          refund: "Връщане",
          loading: "Зареждане...",
          noTransactions: "Все още няма движения по баланса.",
          infoTitle: "Как работи балансът",
          infoText:
            "При потвърждаване на прогноза точките се изваждат от наличния баланс и се считат за заключени до приключване на събитието. След уреждане на резултата заключените точки се освобождават според изхода на прогнозата.",
        }
      : {
          title: "Balance",
          subtitle:
            "Track available, locked and all point movements",
          back: "Back to dashboard",
          available: "Available points",
          locked: "Locked points",
          total: "Total points",
          history: "Transaction history",
          amount: "Change",
          bonus: "Bonus",
          prediction: "Prediction",
          win: "Win",
          refund: "Refund",
          loading: "Loading...",
          noTransactions: "There are no balance movements yet.",
          infoTitle: "How the balance works",
          infoText:
            "When a prediction is confirmed, points are deducted from the available balance and remain locked until the event is settled. After settlement, locked points are released according to the prediction result.",
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
          const userData = userSnap.data();

          setAvailableBalance(
            Number(userData.balance) || 0
          );

          setLockedBalance(
            Number(userData.lockedPoints) || 0
          );
        }

        const transactionsRef = collection(
          db,
          "transactions"
        );

        const transactionsQuery = query(
          transactionsRef,
          where("userId", "==", user.uid)
        );

        const snapshot = await getDocs(
          transactionsQuery
        );

        const loadedTransactions: Transaction[] =
          snapshot.docs
            .sort((a, b) => {
              const aTime =
                a.data().createdAt?.toMillis?.() ?? 0;

              const bTime =
                b.data().createdAt?.toMillis?.() ?? 0;

              return bTime - aTime;
            })
            .map((docSnap) => {
              const data = docSnap.data();

              const type: TransactionType =
                data.type === "prediction"
                  ? "prediction"
                  : data.type === "win"
                  ? "win"
                  : data.type === "refund"
                  ? "refund"
                  : "bonus";

              let date = "";

              if (data.createdAt?.toDate) {
                date = data.createdAt
                  .toDate()
                  .toLocaleString(
                    language === "bg"
                      ? "bg-BG"
                      : "en-GB"
                  );
              }

              let titleBg =
                data.description || "";
              let titleEn =
                data.description || "";

              if (type === "bonus") {
                titleBg = "Стартов бонус";
                titleEn = "Welcome bonus";
              }

              if (type === "prediction") {
                const original =
                  data.description || "";

                titleEn = original;

                titleBg = original.startsWith(
                  "Prediction:"
                )
                  ? original.replace(
                      "Prediction:",
                      "Прогноза:"
                    )
                  : original;
              }

              if (type === "win") {
                titleBg = "Позната прогноза";
                titleEn = "Correct prediction";
              }

              if (type === "refund") {
                titleBg =
                  "Върнати точки от отменено събитие";
                titleEn =
                  "Refund from cancelled event";
              }

              return {
                id: docSnap.id,
                type,
                titleBg,
                titleEn,
                amount:
                  Number(data.amount) || 0,
                date,
              };
            });

        setTransactions(loadedTransactions);
      } catch (error) {
        console.error(
          "BALANCE PAGE ERROR:",
          error
        );
      } finally {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, [router, language]);

  function getTypeLabel(
    type: Transaction["type"]
  ) {
    if (type === "bonus") return t.bonus;
    if (type === "prediction") return t.prediction;
    if (type === "win") return t.win;
    return t.refund;
  }

  function getTypeClasses(
    type: Transaction["type"]
  ) {
    if (type === "bonus") {
      return "bg-sky-500/10 text-sky-300";
    }

    if (type === "prediction") {
      return "bg-amber-500/10 text-amber-300";
    }

    if (type === "win") {
      return "bg-emerald-500/10 text-emerald-300";
    }

    return "bg-violet-500/10 text-violet-300";
  }

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
        <div className="grid gap-5 md:grid-cols-3">
          <div className="rounded-3xl border border-slate-800 bg-slate-900 p-6">
            <p className="text-sm text-slate-400">
              {t.available}
            </p>

            <p className="mt-3 text-4xl font-bold text-emerald-400">
              {availableBalance.toLocaleString()}
            </p>
          </div>

          <div className="rounded-3xl border border-slate-800 bg-slate-900 p-6">
            <p className="text-sm text-slate-400">
              {t.locked}
            </p>

            <p className="mt-3 text-4xl font-bold text-amber-300">
              {lockedBalance.toLocaleString()}
            </p>
          </div>

          <div className="rounded-3xl border border-slate-800 bg-slate-900 p-6">
            <p className="text-sm text-slate-400">
              {t.total}
            </p>

            <p className="mt-3 text-4xl font-bold">
              {totalBalance.toLocaleString()}
            </p>
          </div>
        </div>

        <section className="mt-10">
          <h2 className="text-2xl font-bold">
            {t.history}
          </h2>

          <div className="mt-6 space-y-4">
            {transactions.length === 0 ? (
              <div className="rounded-3xl border border-slate-800 bg-slate-900 p-7 text-slate-400">
                {t.noTransactions}
              </div>
            ) : (
              transactions.map((transaction) => (
                <article
                  key={transaction.id}
                  className="rounded-3xl border border-slate-800 bg-slate-900 p-6"
                >
                  <div className="flex flex-wrap items-center justify-between gap-4">
                    <div>
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-bold ${getTypeClasses(
                          transaction.type
                        )}`}
                      >
                        {getTypeLabel(
                          transaction.type
                        )}
                      </span>

                      <h3 className="mt-4 text-lg font-bold">
                        {language === "bg"
                          ? transaction.titleBg
                          : transaction.titleEn}
                      </h3>

                      <p className="mt-2 text-sm text-slate-500">
                        {transaction.date || "—"}
                      </p>
                    </div>

                    <div className="text-right">
                      <p className="text-xs uppercase tracking-wide text-slate-500">
                        {t.amount}
                      </p>

                      <p
                        className={`mt-2 text-2xl font-bold ${
                          transaction.amount >= 0
                            ? "text-emerald-400"
                            : "text-amber-300"
                        }`}
                      >
                        {transaction.amount > 0
                          ? "+"
                          : ""}
                        {transaction.amount.toLocaleString()}
                      </p>
                    </div>
                  </div>
                </article>
              ))
            )}
          </div>
        </section>

        <section className="mt-10 rounded-3xl border border-slate-800 bg-slate-900 p-7">
          <h3 className="text-2xl font-bold">
            {t.infoTitle}
          </h3>

          <p className="mt-4 max-w-3xl leading-7 text-slate-400">
            {t.infoText}
          </p>
        </section>
      </section>
    </main>
  );
}