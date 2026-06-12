import React, { useState } from 'react';
import IconLoader from '../IconLoader';
import type { LangType } from '../../types';
import type { ThemeMode } from '../../services/themeStore';
import { getHomeCopy } from './homeCopy';

type Props = {
  lang: LangType;
  setLang: (lang: LangType) => void;
  theme: ThemeMode;
  onToggleTheme: () => void;
  onOpenApiSettings: () => void;
};

export default function HomeSettingsMenu({
  lang,
  setLang,
  theme,
  onToggleTheme,
  onOpenApiSettings,
}: Props) {
  const copy = getHomeCopy(lang);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setIsMenuOpen(!isMenuOpen)}
        className="w-12 h-12 rounded-full overflow-hidden hover:shadow-lg transition-shadow"
        aria-label="OnePaper menu"
      >
        <img src="/integrations/onepaper/logo.png" alt="OnePaper" className="w-full h-full object-cover" />
      </button>
      {isMenuOpen && (
        <div className="absolute top-14 left-0 w-48 bg-white dark:bg-stone-800 rounded-xl shadow-xl border border-stone-200 dark:border-stone-700 z-50 overflow-hidden">
          <button
            type="button"
            onClick={onToggleTheme}
            className="w-full text-left px-4 py-2.5 text-sm hover:bg-stone-100 dark:hover:bg-stone-700 text-stone-600 dark:text-stone-300 flex items-center gap-2"
          >
            {theme === 'dark' ? <IconLoader name="sun" size={16} /> : <IconLoader name="moon" size={16} />}
            {theme === 'dark' ? copy.lightMode : copy.darkMode}
          </button>
          <button
            type="button"
            onClick={() => setLang(lang === 'zh' ? 'en' : 'zh')}
            className="w-full text-left px-4 py-2.5 text-sm hover:bg-stone-100 dark:hover:bg-stone-700 text-stone-600 dark:text-stone-300 flex items-center gap-2"
          >
            <IconLoader name="globe" size={16} />
            {copy.languageToggle}
          </button>
          <div className="h-px bg-stone-200 dark:bg-stone-700 my-1" />
          <button
            type="button"
            onClick={() => {
              onOpenApiSettings();
              setIsMenuOpen(false);
            }}
            className="w-full text-left px-4 py-2.5 text-sm hover:bg-stone-100 dark:hover:bg-stone-700 text-stone-600 dark:text-stone-300 flex items-center gap-2"
          >
            <IconLoader name="settings" size={16} />
            {copy.apiSettings}
          </button>
        </div>
      )}
    </div>
  );
}
