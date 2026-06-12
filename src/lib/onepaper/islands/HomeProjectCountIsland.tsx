import React, { useEffect, useState } from 'react';
import { ToolRuntimeBoundary } from '../../../components/ToolRuntimeBoundary';
import HomeProjectCount from '../components/home/HomeProjectCount';
import {
  HOME_LANG_EVENT,
  HOME_PROJECT_COUNT_EVENT,
  readHomeLang,
} from '../hooks/homeRuntimeEvents';
import type { LangType } from '../types';

function HomeProjectCountRuntime() {
  const [lang, setLang] = useState<LangType>(readHomeLang);
  const [count, setCount] = useState(0);

  useEffect(() => {
    const handleLangChange = (event: Event) => {
      const detail = (event as CustomEvent<{ lang: LangType }>).detail;
      if (detail?.lang) setLang(detail.lang);
    };
    const handleCountChange = (event: Event) => {
      const detail = (event as CustomEvent<{ count: number }>).detail;
      if (typeof detail?.count === 'number') setCount(detail.count);
    };

    window.addEventListener(HOME_LANG_EVENT, handleLangChange);
    window.addEventListener(HOME_PROJECT_COUNT_EVENT, handleCountChange);
    return () => {
      window.removeEventListener(HOME_LANG_EVENT, handleLangChange);
      window.removeEventListener(HOME_PROJECT_COUNT_EVENT, handleCountChange);
    };
  }, []);

  return <HomeProjectCount lang={lang} count={count} />;
}

export default function HomeProjectCountIsland() {
  return (
    <ToolRuntimeBoundary toolName="OnePaper">
      <HomeProjectCountRuntime />
    </ToolRuntimeBoundary>
  );
}
