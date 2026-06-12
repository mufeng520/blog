import React from 'react';
import type { LangType, Project } from '../types';
import EditorBreadcrumb from './editor/header/EditorBreadcrumb';
import EditorHeaderActions from './editor/header/EditorHeaderActions';
import ProjectStatusControl from './editor/header/ProjectStatusControl';

interface Props {
  lang: LangType;
  setLang: (l: LangType) => void;
  theme: 'dark' | 'light';
  toggleTheme: () => void;
  devMode: boolean;
  toggleDevMode: () => void;
  onOpenGallery: () => void;
  onExportConfig: () => void;
  onImportConfig: (e: React.ChangeEvent<HTMLInputElement>) => void;
  currentProject?: Project;
  isSaving?: boolean;
  onUpdateCurrentProject: () => void;
  onRenameProject?: (newName: string) => void;
  onOpenProjectManager: () => void;
  showBreadcrumb?: boolean;
}

const AppHeader: React.FC<Props> = ({
  lang, setLang, theme, toggleTheme, devMode, toggleDevMode, onOpenGallery,
  onExportConfig, onImportConfig,
  currentProject, isSaving, onUpdateCurrentProject, onRenameProject, onOpenProjectManager,
  showBreadcrumb = true,
}) => {
  return (
    <header className="min-h-14 bg-white dark:bg-stone-900 border-b border-stone-200 dark:border-stone-800 flex items-center justify-between gap-2 px-2 sm:px-4 py-2 z-20 shrink-0">
      <div className="min-w-0 flex-1">
        {showBreadcrumb ? <EditorBreadcrumb lang={lang} /> : null}
      </div>

      <div className="flex items-center justify-end gap-1.5 sm:gap-2 shrink-0 min-w-0">
        <ProjectStatusControl
          currentProject={currentProject}
          isSaving={isSaving}
          lang={lang}
          onUpdateCurrentProject={onUpdateCurrentProject}
          onRenameProject={onRenameProject}
        />
        <EditorHeaderActions
          lang={lang}
          setLang={setLang}
          theme={theme}
          toggleTheme={toggleTheme}
          devMode={devMode}
          toggleDevMode={toggleDevMode}
          onOpenGallery={onOpenGallery}
          onOpenProjectManager={onOpenProjectManager}
          onExportConfig={onExportConfig}
          onImportConfig={onImportConfig}
        />
      </div>
    </header>
  );
};

export default AppHeader;
