"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { Language, dict } from "./dictionaries";

type LanguageContextType = {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: typeof dict.en;
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<Language>("en");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // 1. Check local storage first
    const saved = localStorage.getItem("vyas-language") as Language;
    if (saved && (saved === "en" || saved === "hi")) {
      setLanguageState(saved);
    } else {
      // 2. Auto-detect from browser
      if (typeof navigator !== "undefined") {
        const browserLang = navigator.language.toLowerCase();
        if (browserLang.startsWith("hi")) {
          setLanguageState("hi");
        }
      }
    }
    setMounted(true);
  }, []);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem("vyas-language", lang);
  };

  const t = dict[language];

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {!mounted ? (
        <div style={{ visibility: "hidden" }}>{children}</div>
      ) : (
        children
      )}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
}
