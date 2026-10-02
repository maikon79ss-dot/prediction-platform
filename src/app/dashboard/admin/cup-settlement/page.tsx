"use client";

import {
  useState,
} from "react";

import Link from "next/link";

type CupMatch = {
  eventId: string;

  event: string;

  homeTeam: string;

  awayTeam: string;

  matchDateSofia:
    string | null;

  closesAt:
    string | null;

  predictions: number;
};

type ManualResult =
  | "home"
  | "draw"
  | "away"
  | "refund";

export default function CupSettlementPage() {
  const [
    adminSecret,
    setAdminSecret,
  ] =
    useState("");

  const [
    authorized,
    setAuthorized,
  ] =
    useState(false);

  const [
    matches,
    setMatches,
  ] =
    useState<
      CupMatch[]
    >([]);

  const [
    loading,
    setLoading,
  ] =
    useState(false);

  const [
    settling,
    setSettling,
  ] =
    useState<
      string | null
    >(null);

  const [
    message,
    setMessage,
  ] =
    useState("");

  async function loadMatches(
    secretValue =
      adminSecret
  ) {
    const secret =
      secretValue.trim();

    if (!secret) {
      setMessage(
        "Въведи ADMIN_SECRET."
      );

      return;
    }

    try {
      setLoading(
        true
      );

      setMessage(
        ""
      );

      const response =
        await fetch(
          "/api/football/admin/cup-pending",
          {
            method:
              "GET",

            headers: {
              "x-admin-secret":
                secret,
            },

            cache:
              "no-store",
          }
        );

      const data =
        await response.json();

      if (
        !response.ok
      ) {
        setAuthorized(
          false
        );

        setMatches(
          []
        );

        setMessage(
          response.status ===
            401
            ? "Грешен ADMIN_SECRET."
            : "Грешка при зареждането."
        );

        return;
      }

      setAuthorized(
        true
      );

      setMatches(
        Array.isArray(
          data.matches
        )
          ? data.matches
          : []
      );
    } catch (
      error
    ) {
      console.error(
        error
      );

      setMessage(
        "Неуспешна връзка със сървъра."
      );
    } finally {
      setLoading(
        false
      );
    }
  }

  async function settleMatch(
    match: CupMatch,
    result: ManualResult
  ) {
    const labels:
      Record<
        ManualResult,
        string
      > = {
        home:
          "Домакин",

        draw:
          "Равен",

        away:
          "Гост",

        refund:
          "Върни точките",
      };

    const confirmed =
      window.confirm(
        `Сигурен ли си?\n\n${match.homeTeam} - ${match.awayTeam}\n\nРезултат за settlement: ${labels[result]}`
      );

    if (!confirmed) {
      return;
    }

    try {
      setSettling(
        match.eventId
      );

      setMessage(
        ""
      );

      const response =
        await fetch(
          "/api/football/settle-cup-manual",
          {
            method:
              "POST",

            headers: {
              "Content-Type":
                "application/json",

              "x-admin-secret":
                adminSecret.trim(),
            },

            body:
              JSON.stringify({
                eventId:
                  match.eventId,

                result,
              }),
          }
        );

      const data =
        await response.json();

      if (
        !response.ok
      ) {
        setMessage(
          data.details ||
            data.error ||
            "Settlement грешка."
        );

        return;
      }

      await loadMatches(
        adminSecret
      );

      setMessage(
        `Готово. Приключени прогнози: ${
          data.settled ??
          0
        }.`
      );
    } catch (
      error
    ) {
      console.error(
        error
      );

      setMessage(
        "Възникна грешка при settlement."
      );
    } finally {
      setSettling(
        null
      );
    }
  }

  function logout() {
    setAdminSecret(
      ""
    );

    setAuthorized(
      false
    );

    setMatches(
      []
    );

    setMessage(
      ""
    );
  }

  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <header className="border-b border-slate-800">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-6 py-5">
          <div>
            <p className="text-sm font-semibold text-amber-400">
              ADMIN
            </p>

            <h1 className="mt-1 text-2xl font-bold">
              Купа на България
            </h1>

            <p className="mt-1 text-sm text-slate-400">
              Settlement по резултата след 90 минути
            </p>
          </div>

          <Link
            href="/dashboard"
            className="rounded-xl border border-slate-700 px-4 py-2 text-sm font-semibold hover:border-slate-500"
          >
            Обратно
          </Link>
        </div>
      </header>

      <section className="mx-auto max-w-6xl px-6 py-10">
        {!authorized ? (
          <div className="mx-auto max-w-lg rounded-3xl border border-slate-800 bg-slate-900 p-7">
            <h2 className="text-xl font-bold">
              Администраторски достъп
            </h2>

            <p className="mt-2 text-sm text-slate-400">
              Въведи ADMIN_SECRET. Кодът не се записва в браузъра.
            </p>

            <input
              type="password"
              value={
                adminSecret
              }
              onChange={(
                event
              ) =>
                setAdminSecret(
                  event.target
                    .value
                )
              }
              onKeyDown={(
                event
              ) => {
                if (
                  event.key ===
                  "Enter"
                ) {
                  loadMatches();
                }
              }}
              autoComplete="off"
              placeholder="ADMIN_SECRET"
              className="mt-5 w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 outline-none focus:border-amber-400"
            />

            <button
              type="button"
              disabled={
                loading
              }
              onClick={() =>
                loadMatches()
              }
              className="mt-4 w-full rounded-xl bg-amber-400 px-4 py-3 font-bold text-slate-950 hover:bg-amber-300 disabled:opacity-50"
            >
              {loading
                ? "Проверка..."
                : "Вход"}
            </button>
          </div>
        ) : (
          <>
            <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
              <div>
                <p className="font-semibold text-emerald-400">
                  Администраторски достъп: активен
                </p>

                <p className="mt-1 text-sm text-slate-400">
                  Активни мачове за ръчна проверка:{" "}
                  {
                    matches.length
                  }
                </p>
              </div>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() =>
                    loadMatches()
                  }
                  className="rounded-xl border border-slate-700 px-4 py-2 text-sm font-semibold"
                >
                  Обнови
                </button>

                <button
                  type="button"
                  onClick={
                    logout
                  }
                  className="rounded-xl border border-red-500/40 px-4 py-2 text-sm font-semibold text-red-300"
                >
                  Изход
                </button>
              </div>
            </div>

            {matches.length ===
            0 ? (
              <div className="rounded-3xl border border-slate-800 bg-slate-900 p-8 text-slate-400">
                Няма активни прогнози за Купата на България.
              </div>
            ) : (
              <div className="grid gap-5 lg:grid-cols-2">
                {matches.map(
                  (
                    match
                  ) => (
                    <article
                      key={
                        match.eventId
                      }
                      className="rounded-3xl border border-slate-800 bg-slate-900 p-6"
                    >
                      <span className="rounded-full bg-amber-500/10 px-3 py-1 text-xs font-bold text-amber-300">
                        BULGARIAN CUP
                      </span>

                      <h2 className="mt-5 text-xl font-bold">
                        {
                          match.homeTeam
                        }{" "}
                        -{" "}
                        {
                          match.awayTeam
                        }
                      </h2>

                      <p className="mt-3 text-sm text-slate-400">
                        Дата:{" "}
                        {match.matchDateSofia ??
                          "—"}
                      </p>

                      <p className="mt-1 text-sm text-slate-400">
                        Активни прогнози:{" "}
                        {
                          match.predictions
                        }
                      </p>

                      <p className="mt-5 text-sm font-semibold text-slate-300">
                        Резултат след 90 минути:
                      </p>

                      <div className="mt-3 grid grid-cols-3 gap-2">
                        <button
                          type="button"
                          disabled={
                            settling ===
                            match.eventId
                          }
                          onClick={() =>
                            settleMatch(
                              match,
                              "home"
                            )
                          }
                          className="rounded-xl bg-emerald-500 px-3 py-3 font-bold text-slate-950 disabled:opacity-40"
                        >
                          Домакин
                        </button>

                        <button
                          type="button"
                          disabled={
                            settling ===
                            match.eventId
                          }
                          onClick={() =>
                            settleMatch(
                              match,
                              "draw"
                            )
                          }
                          className="rounded-xl bg-slate-700 px-3 py-3 font-bold disabled:opacity-40"
                        >
                          Равен
                        </button>

                        <button
                          type="button"
                          disabled={
                            settling ===
                            match.eventId
                          }
                          onClick={() =>
                            settleMatch(
                              match,
                              "away"
                            )
                          }
                          className="rounded-xl bg-emerald-500 px-3 py-3 font-bold text-slate-950 disabled:opacity-40"
                        >
                          Гост
                        </button>
                      </div>

                      <button
                        type="button"
                        disabled={
                          settling ===
                          match.eventId
                        }
                        onClick={() =>
                          settleMatch(
                            match,
                            "refund"
                          )
                        }
                        className="mt-3 w-full rounded-xl border border-red-500/40 px-4 py-3 font-semibold text-red-300 disabled:opacity-40"
                      >
                        Върни точките
                      </button>
                    </article>
                  )
                )}
              </div>
            )}
          </>
        )}

        {message && (
          <div className="mt-6 rounded-2xl border border-slate-700 bg-slate-900 px-5 py-4 text-sm">
            {message}
          </div>
        )}
      </section>
    </main>
  );
}