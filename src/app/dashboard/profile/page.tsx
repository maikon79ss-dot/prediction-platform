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

type Language = "bg" | "en";

type ProfileData = {
  name: string;
  email: string;
  language: Language;
  balance: number;
  lockedPoints: number;
  totalPredictions: number;
  accuracy: number;
  registeredAt: string | null;
};

export default function ProfilePage() {
  const [
    language,
    setLanguage,
  ] = useLanguage("bg");

  const [
    name,
    setName,
  ] = useState("");

  const [
    email,
    setEmail,
  ] = useState("");

  const [
    preferredLanguage,
    setPreferredLanguage,
  ] = useState<Language>("bg");

  const [
    balance,
    setBalance,
  ] = useState(0);

  const [
    lockedPoints,
    setLockedPoints,
  ] = useState(0);

  const [
    totalPredictions,
    setTotalPredictions,
  ] = useState(0);

  const [
    accuracy,
    setAccuracy,
  ] = useState(0);

  const [
    registeredAt,
    setRegisteredAt,
  ] = useState<string | null>(
    null
  );

  const [
    message,
    setMessage,
  ] = useState("");

  const [
    loading,
    setLoading,
  ] = useState(true);

  const [
    saving,
    setSaving,
  ] = useState(false);

  const router = useRouter();

  const t =
    language === "bg"
      ? {
          title: "Профил",
          subtitle:
            "Управлявай основната информация за своя акаунт",
          back: "Обратно към таблото",
          name: "Име",
          email: "Имейл",
          preferredLanguage:
            "Предпочитан език",
          registered: "Регистрация",
          predictions:
            "Общо прогнози",
          accuracy: "Точност",
          balance: "Общо точки",
          save:
            "Запази промените",
          saving:
            "Запазване...",
          saved:
            "Профилът е запазен успешно.",
          stats:
            "Статистика на акаунта",
          accountInfo:
            "Информация за акаунта",
          futureTitle:
            "Допълнителни настройки",
          futureText:
            "По-късно тук ще добавим държава, часова зона и основно местоположение за дневните прогнози за времето.",
          bulgarian:
            "Български",
          english:
            "English",
          loading:
            "Зареждане на профила...",
          loadError:
            "Не успяхме да заредим профила.",
          saveError:
            "Не успяхме да запазим профила.",
          emailInfo:
            "Имейлът се управлява от акаунта и засега не се променя от тази страница.",
        }
      : {
          title: "Profile",
          subtitle:
            "Manage the basic information for your account",
          back: "Back to dashboard",
          name: "Name",
          email: "Email",
          preferredLanguage:
            "Preferred language",
          registered:
            "Registered",
          predictions:
            "Total predictions",
          accuracy: "Accuracy",
          balance: "Total points",
          save:
            "Save changes",
          saving:
            "Saving...",
          saved:
            "Profile saved successfully.",
          stats:
            "Account statistics",
          accountInfo:
            "Account information",
          futureTitle:
            "Additional settings",
          futureText:
            "Later we will add country, time zone and primary location for the daily weather predictions here.",
          bulgarian:
            "Bulgarian",
          english:
            "English",
          loading:
            "Loading profile...",
          loadError:
            "The profile could not be loaded.",
          saveError:
            "The profile could not be saved.",
          emailInfo:
            "The email is managed by the account and cannot currently be changed from this page.",
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
            setMessage("");

            const idToken =
              await user.getIdToken();

            const response =
              await fetch(
                "/api/profile",
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
                ProfileData & {
                  error?: string;
                };

            if (!response.ok) {
              throw new Error(
                data.error ||
                  "PROFILE_LOAD_FAILED"
              );
            }

            setName(
              data.name || ""
            );

            setEmail(
              data.email || ""
            );

            setPreferredLanguage(
              data.language === "en"
                ? "en"
                : "bg"
            );

            setBalance(
              Number(
                data.balance
              ) || 0
            );

            setLockedPoints(
              Number(
                data.lockedPoints
              ) || 0
            );

            setTotalPredictions(
              Number(
                data.totalPredictions
              ) || 0
            );

            setAccuracy(
              Number(
                data.accuracy
              ) || 0
            );

            setRegisteredAt(
              data.registeredAt ??
                null
            );
          } catch (error) {
            console.error(
              "PROFILE PAGE ERROR:",
              error
            );

            setMessage(
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

  async function handleSave() {
    const user =
      auth.currentUser;

    if (!user) {
      router.push("/login");
      return;
    }

    try {
      setSaving(true);
      setMessage("");

      const idToken =
        await user.getIdToken();

      const response =
        await fetch(
          "/api/profile",
          {
            method: "PATCH",
            headers: {
              Authorization:
                `Bearer ${idToken}`,
              "Content-Type":
                "application/json",
            },
            body: JSON.stringify({
              name,
              language:
                preferredLanguage,
            }),
          }
        );

      const data =
        await response.json();

      if (!response.ok) {
        throw new Error(
          data.error ||
            "PROFILE_UPDATE_FAILED"
        );
      }

      setLanguage(
        preferredLanguage
      );

      setMessage(
        preferredLanguage ===
          "bg"
          ? "Профилът е запазен успешно."
          : "Profile saved successfully."
      );
    } catch (error) {
      console.error(
        "PROFILE SAVE ERROR:",
        error
      );

      setMessage(
        t.saveError
      );
    } finally {
      setSaving(false);
    }
  }

  const totalPoints =
    balance + lockedPoints;

  const registeredDate =
    registeredAt
      ? new Date(
          registeredAt
        ).toLocaleDateString(
          language === "bg"
            ? "bg-BG"
            : "en-GB"
        )
      : "—";

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
        <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
          <section className="rounded-3xl border border-slate-800 bg-slate-900 p-7">
            <h2 className="text-2xl font-bold">
              {t.accountInfo}
            </h2>

            <div className="mt-7 space-y-5">
              <div>
                <label className="mb-2 block text-sm text-slate-400">
                  {t.name}
                </label>

                <input
                  type="text"
                  value={name}
                  onChange={(event) =>
                    setName(
                      event.target.value
                    )
                  }
                  className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none focus:border-emerald-400"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm text-slate-400">
                  {t.email}
                </label>

                <input
                  type="email"
                  value={email}
                  readOnly
                  className="w-full cursor-not-allowed rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-slate-400 outline-none"
                />

                <p className="mt-2 text-xs text-slate-500">
                  {t.emailInfo}
                </p>
              </div>

              <div>
                <label className="mb-2 block text-sm text-slate-400">
                  {
                    t.preferredLanguage
                  }
                </label>

                <select
                  value={
                    preferredLanguage
                  }
                  onChange={(
                    event
                  ) =>
                    setPreferredLanguage(
                      event.target
                        .value as Language
                    )
                  }
                  className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none focus:border-emerald-400"
                >
                  <option value="bg">
                    {t.bulgarian}
                  </option>

                  <option value="en">
                    {t.english}
                  </option>
                </select>
              </div>

              <button
                type="button"
                onClick={
                  handleSave
                }
                disabled={saving}
                className="w-full rounded-xl bg-emerald-500 px-4 py-3 font-bold text-slate-950 hover:bg-emerald-400 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {saving
                  ? t.saving
                  : t.save}
              </button>

              {message && (
                <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/10 px-5 py-4 text-sm font-semibold text-emerald-300">
                  {message}
                </div>
              )}
            </div>
          </section>

          <section className="rounded-3xl border border-slate-800 bg-slate-900 p-7">
            <h2 className="text-2xl font-bold">
              {t.stats}
            </h2>

            <div className="mt-6 grid gap-4">
              <div className="rounded-2xl bg-slate-950 p-5">
                <p className="text-sm text-slate-500">
                  {t.registered}
                </p>

                <p className="mt-2 text-xl font-bold">
                  {registeredDate}
                </p>
              </div>

              <div className="rounded-2xl bg-slate-950 p-5">
                <p className="text-sm text-slate-500">
                  {t.predictions}
                </p>

                <p className="mt-2 text-3xl font-bold">
                  {totalPredictions.toLocaleString()}
                </p>
              </div>

              <div className="rounded-2xl bg-slate-950 p-5">
                <p className="text-sm text-slate-500">
                  {t.accuracy}
                </p>

                <p className="mt-2 text-3xl font-bold">
                  {accuracy.toFixed(
                    1
                  )}
                  %
                </p>
              </div>

              <div className="rounded-2xl bg-slate-950 p-5">
                <p className="text-sm text-slate-500">
                  {t.balance}
                </p>

                <p className="mt-2 text-3xl font-bold text-emerald-400">
                  {totalPoints.toLocaleString()}
                </p>
              </div>
            </div>
          </section>
        </div>

        <section className="mt-8 rounded-3xl border border-sky-500/20 bg-slate-900 p-7">
          <h2 className="text-2xl font-bold">
            {t.futureTitle}
          </h2>

          <p className="mt-4 max-w-3xl leading-7 text-slate-400">
            {t.futureText}
          </p>
        </section>
      </section>
    </main>
  );
}