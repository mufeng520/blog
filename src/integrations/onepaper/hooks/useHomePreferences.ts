import { useEffect, useState } from 'react';
import { getNextTheme, readStoredTheme, storeTheme, type ThemeMode } from '../services/themeStore';
import type { LangType } from '../types';

const readStoredLang = (): LangType => {
  if (typeof localStorage === 'undefined') return 'zh';
  return (localStorage.getItem('onepaper-lang') as LangType) || 'zh';
};

export function useHomePreferences() {
  const [lang, setLang] = useState<LangType>(readStoredLang);
  const [theme, setTheme] = useState<ThemeMode>(readStoredTheme);

  const toggleTheme = () => {
    setTheme((prev) => {
      const next = getNextTheme(prev);
      storeTheme(next);
      return next;
    });
  };

  useEffect(() => {
    storeTheme(theme);
  }, [theme]);

  useEffect(() => {
    localStorage.setItem('onepaper-lang', lang);
  }, [lang]);

  return {
    lang,
    setLang,
    theme,
    toggleTheme,
  };
}
