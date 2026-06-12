import type { ChangeEvent } from 'react';
import { lazy, Suspense, useRef, useState } from 'react';
import { I18N } from '../../../constants';
import type { LangType } from '../../../types';
import IconLoader from '../../IconLoader';

const ApiKeyConfig = lazy(() => import('../../ApiKeyConfig'));

type Props = {
  lang: LangType;
  setLang: (lang: LangType) => void;
  theme: 'dark' | 'light';
  toggleTheme: () => void;
  devMode: boolean;
  toggleDevMode: () => void;
  onOpenGallery: () => void;
  onOpenProjectManager: () => void;
  onExportConfig: () => void;
  onImportConfig: (event: ChangeEvent<HTMLInputElement>) => void;
};

const zh = {
  switchLight: '\u5207\u6362\u5230\u6d45\u8272\u6a21\u5f0f',
  switchDark: '\u5207\u6362\u5230\u6df1\u8272\u6a21\u5f0f',
  projects: '\u9879\u76ee',
  exportConfig: '\u5bfc\u51fa\u914d\u7f6e',
  importConfig: '\u5bfc\u5165\u914d\u7f6e',
  unsetApi: '\u672a\u8bbe\u7f6e Key',
};

const hasAnyStoredAPI = () => {
  try {
    const raw = localStorage.getItem('onepaper-api-settings');
    if (raw) {
      const settings = JSON.parse(raw);
      return [...(settings.textAPIs || []), ...(settings.imageAPIs || [])].some(api => api.enabled);
    }
    return Boolean(localStorage.getItem('onepaper-gemini-api-key'));
  } catch {
    return false;
  }
};

export default function EditorHeaderActions({
  lang,
  setLang,
  theme,
  toggleTheme,
  devMode,
  toggleDevMode,
  onOpenGallery,
  onOpenProjectManager,
  onExportConfig,
  onImportConfig,
}: Props) {
  const t = I18N[lang];
  const importInputRef = useRef<HTMLInputElement>(null);
  const [showApiSettings, setShowApiSettings] = useState(false);
  const [hasKey, setHasKey] = useState(() => hasAnyStoredAPI());
  const themeToggleLabel = lang === 'zh'
    ? (theme === 'dark' ? zh.switchLight : zh.switchDark)
    : (theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode');

  return (
    <>
      <div className="flex items-center gap-2 shrink-0">
        <div className="flex bg-stone-100 dark:bg-stone-800 rounded-lg p-1">
          <button
            onClick={() => setLang('en')}
            className={`px-2 py-1 text-xs rounded ${lang === 'en' ? 'bg-white dark:bg-stone-700 shadow text-stone-800 dark:text-stone-100' : 'text-stone-500'}`}
          >
            EN
          </button>
          <button
            onClick={() => setLang('zh')}
            className={`px-2 py-1 text-xs rounded ${lang === 'zh' ? 'bg-white dark:bg-stone-700 shadow text-stone-800 dark:text-stone-100' : 'text-stone-500'}`}
          >
            {lang === 'zh' ? '\u4e2d\u6587' : 'ZH'}
          </button>
        </div>

        <button
          type="button"
          onClick={(event) => {
            event.preventDefault();
            toggleTheme();
          }}
          aria-label={themeToggleLabel}
          aria-pressed={theme === 'dark'}
          title={themeToggleLabel}
          className="p-2 text-stone-500 hover:bg-stone-100 dark:hover:bg-stone-800 rounded-lg transition-colors"
        >
          {theme === 'dark' ? <IconLoader name="sun" size={20} /> : <IconLoader name="moon" size={20} />}
        </button>

        <button
          onClick={onOpenGallery}
          className="px-3 py-1.5 bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 dark:hover:bg-stone-700 rounded-lg text-xs font-bold text-stone-600 dark:text-stone-300 flex items-center gap-2"
        >
          <IconLoader name="image" size={16} />
          <span>{t.gallery}</span>
        </button>

        <button
          onClick={onOpenProjectManager}
          className="px-3 py-1.5 bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 dark:hover:bg-stone-700 rounded-lg text-xs font-bold text-stone-600 dark:text-stone-300 flex items-center gap-2"
        >
          <IconLoader name="list" size={16} />
          <span>{lang === 'zh' ? zh.projects : 'Projects'}</span>
        </button>

        <button
          onClick={toggleDevMode}
          className={`px-2 py-1 text-[10px] rounded border ${devMode ? 'bg-teal-100 text-teal-700 border-teal-300' : 'bg-stone-100 text-stone-400 border-stone-200'}`}
        >
          DEV
        </button>

        <button
          onClick={onExportConfig}
          className="p-2 text-stone-500 hover:bg-stone-100 dark:hover:bg-stone-800 rounded-lg transition-colors"
          title={lang === 'zh' ? zh.exportConfig : 'Export config'}
          aria-label={lang === 'zh' ? zh.exportConfig : 'Export config'}
        >
          <IconLoader name="download" size={18} />
        </button>

        <button
          onClick={() => importInputRef.current?.click()}
          className="p-2 text-stone-500 hover:bg-stone-100 dark:hover:bg-stone-800 rounded-lg transition-colors"
          title={lang === 'zh' ? zh.importConfig : 'Import config'}
          aria-label={lang === 'zh' ? zh.importConfig : 'Import config'}
        >
          <IconLoader name="upload" size={18} />
        </button>
        <input ref={importInputRef} type="file" accept="application/json" className="hidden" onChange={onImportConfig} />

        <button
          onClick={() => setShowApiSettings(true)}
          className={`relative px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-colors ${
            hasKey
              ? 'bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 dark:hover:bg-stone-700 text-stone-600 dark:text-stone-300'
              : 'bg-amber-100 dark:bg-amber-900/30 hover:bg-amber-200 dark:hover:bg-amber-900/50 text-amber-700 dark:text-amber-400 border border-amber-300 dark:border-amber-700'
          }`}
        >
          <IconLoader name="settings" size={14} />
          {hasKey ? 'API' : lang === 'zh' ? zh.unsetApi : 'Set API Key'}
          {!hasKey && <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-amber-500 rounded-full animate-pulse" />}
        </button>
      </div>

      {showApiSettings && (
        <Suspense fallback={null}>
          <ApiKeyConfig
            lang={lang}
            onClose={() => setShowApiSettings(false)}
            onConfigured={() => {
              setHasKey(hasAnyStoredAPI());
              setShowApiSettings(false);
            }}
          />
        </Suspense>
      )}
    </>
  );
}
