"use client";

import {
  useEffect,
  useState,
} from "react";

export type AppLanguage =
  | "bg"
  | "en";

const STORAGE_KEY =
  "prediction-platform-language";

export function useLanguage(
  defaultLanguage: AppLanguage = "bg"
) {
  const [
    language,
    setLanguageState,
  ] = useState<AppLanguage>(
    defaultLanguage
  );

  useEffect(() => {
    const savedLanguage =
      window.localStorage.getItem(
        STORAGE_KEY
      );

    if (
      savedLanguage === "bg" ||
      savedLanguage === "en"
    ) {
      setLanguageState(
        savedLanguage
      );
    }
  }, []);

  function setLanguage(
    value: AppLanguage
  ) {
    setLanguageState(value);

    window.localStorage.setItem(
      STORAGE_KEY,
      value
    );
  }

  return [
    language,
    setLanguage,
  ] as const;
}