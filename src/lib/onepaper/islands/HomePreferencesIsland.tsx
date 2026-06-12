import React, { Suspense, lazy, useState } from 'react';
import { ToolRuntimeBoundary } from '../../../components/ToolRuntimeBoundary';
import HomeSettingsMenu from '../components/home/HomeSettingsMenu';
import { emitHomeLangChange } from '../hooks/homeRuntimeEvents';
import { useHomePreferences } from '../hooks/useHomePreferences';
import type { LangType } from '../types';

const HomeApiSettingsModal = lazy(() => import('../components/home/HomeApiSettingsModal'));

function HomePreferencesRuntime() {
  const { lang, setLang, theme, toggleTheme } = useHomePreferences();
  const [showApiKeyConfig, setShowApiKeyConfig] = useState(false);

  const handleSetLang = (nextLang: LangType) => {
    setLang(nextLang);
    emitHomeLangChange(nextLang);
  };

  return (
    <>
      <HomeSettingsMenu
        lang={lang}
        setLang={handleSetLang}
        theme={theme}
        onToggleTheme={toggleTheme}
        onOpenApiSettings={() => setShowApiKeyConfig(true)}
      />
      <Suspense fallback={null}>
        {showApiKeyConfig && (
          <HomeApiSettingsModal
            isOpen
            onClose={() => setShowApiKeyConfig(false)}
          />
        )}
      </Suspense>
    </>
  );
}

export default function HomePreferencesIsland() {
  return (
    <ToolRuntimeBoundary toolName="OnePaper">
      <HomePreferencesRuntime />
    </ToolRuntimeBoundary>
  );
}
