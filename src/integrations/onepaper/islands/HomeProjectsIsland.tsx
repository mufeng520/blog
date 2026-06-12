import React, { useEffect, useState } from 'react';
import { ToolRuntimeBoundary } from '../../../components/ToolRuntimeBoundary';
import { ToastContainer } from '../components/Toast';
import HomeProjectGrid from '../components/home/HomeProjectGrid';
import IconLoader from '../components/IconLoader';
import { getHomeCopy } from '../components/home/homeCopy';
import type { HomeNotification } from '../hooks/homeTypes';
import {
  emitHomeProjectCountChange,
  HOME_LANG_EVENT,
  readHomeLang,
} from '../hooks/homeRuntimeEvents';
import { useHomeProjects } from '../hooks/useHomeProjects';
import type { LangType } from '../types';

function HomeProjectsRuntime() {
  const [lang, setLang] = useState<LangType>(readHomeLang);
  const [notifications, setNotifications] = useState<HomeNotification[]>([]);
  const copy = getHomeCopy(lang);

  const addNotification = (message: string, type: HomeNotification['type']) => {
    const id = Date.now().toString();
    setNotifications((prev) => [...prev, { id, message, type }]);
    setTimeout(() => setNotifications((prev) => prev.filter((item) => item.id !== id)), 3000);
  };

  const {
    projects,
    isLoading,
    handleCreateProject,
    handleDeleteProject,
    handleRenameProject,
  } = useHomeProjects(lang, addNotification);

  useEffect(() => {
    emitHomeProjectCountChange(projects.length);
  }, [projects.length]);

  useEffect(() => {
    const handleLangChange = (event: Event) => {
      const detail = (event as CustomEvent<{ lang: LangType }>).detail;
      if (detail?.lang) setLang(detail.lang);
    };

    window.addEventListener(HOME_LANG_EVENT, handleLangChange);
    return () => window.removeEventListener(HOME_LANG_EVENT, handleLangChange);
  }, []);

  return (
    <>
      <div className="flex items-start justify-end gap-4 mb-8 md:mb-10">
        <button
          type="button"
          onClick={handleCreateProject}
          className="px-6 py-3 bg-stone-800 dark:bg-white text-white dark:text-black rounded-xl font-bold hover:scale-105 transition-transform shadow-lg flex items-center gap-2"
        >
          <IconLoader name="plus" size={20} />
          {copy.newProject}
        </button>
      </div>

      <HomeProjectGrid
        lang={lang}
        isLoading={isLoading}
        projects={projects}
        onCreateProject={handleCreateProject}
        onDeleteProject={handleDeleteProject}
        onRenameProject={handleRenameProject}
      />

      <ToastContainer
        notifications={notifications}
        onClose={(id) => setNotifications((prev) => prev.filter((item) => item.id !== id))}
      />
    </>
  );
}

export default function HomeProjectsIsland() {
  return (
    <ToolRuntimeBoundary toolName="OnePaper">
      <HomeProjectsRuntime />
    </ToolRuntimeBoundary>
  );
}
