import { createContext, useContext, useState, useEffect, type ReactNode } from "react";
import { translations } from "@/data/mockData";

type Lang = "en" | "hi";
type TranslationKeys = keyof typeof translations.en;

interface LanguageContextType {
  lang: Lang;
  toggleLang: () => void;
  t: (key: TranslationKeys) => string;
}

const LanguageContext = createContext<LanguageContextType | null>(null);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLang] = useState<Lang>(() => (localStorage.getItem("lang") as Lang) || "en");

  useEffect(() => { localStorage.setItem("lang", lang); }, [lang]);

  const toggleLang = () => setLang(l => l === "en" ? "hi" : "en");
  const t = (key: TranslationKeys) => translations[lang][key] || key;

  return <LanguageContext.Provider value={{ lang, toggleLang, t }}>{children}</LanguageContext.Provider>;
}

export const useLanguage = () => {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error("useLanguage must be used within LanguageProvider");
  return ctx;
};
