import React from 'react';
import AppHeader from '../AppHeader';
import type { OnePaperAppActions, OnePaperAppState } from '../../hooks/useAppLogic';

type Props = {
  state: OnePaperAppState;
  actions: OnePaperAppActions;
  showBreadcrumb?: boolean;
};

export default function EditorChromeLayer({ state, actions, showBreadcrumb = true }: Props) {
  return (
    <AppHeader
      showBreadcrumb={showBreadcrumb}
      lang={state.lang}
      setLang={actions.setLang}
      theme={state.theme}
      toggleTheme={actions.toggleTheme}
      devMode={state.devMode}
      toggleDevMode={actions.toggleDevMode}
      onOpenGallery={() => actions.setIsGalleryOpen(true)}
      onExportConfig={actions.handleExportConfig}
      onImportConfig={actions.handleImportConfig}
      currentProject={state.currentProjectId ? state.projects.find(project => project.id === state.currentProjectId) : undefined}
      isSaving={state.isSaving}
      onUpdateCurrentProject={() => state.currentProjectId && actions.handleUpdateProjectContent(state.currentProjectId)}
      onRenameProject={(newName) => state.currentProjectId && actions.handleUpdateProjectName(state.currentProjectId, newName)}
      onOpenProjectManager={() => actions.setIsProjectManagerOpen(true)}
    />
  );
}
