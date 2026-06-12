import React from 'react';
import LayoutBuilder from '../LayoutBuilder';
import type { OnePaperAppActions, OnePaperAppState } from '../../hooks/useAppLogic';
import type { LayoutElement } from '../../types';

type Props = {
  state: OnePaperAppState;
  actions: OnePaperAppActions;
};

const getBuilderContextDescription = (state: OnePaperAppState) => {
  if (!state.activePageBuilderId) {
    return state.description;
  }

  if (state.activePageBuilderId.startsWith('REGEN_')) {
    return state.regenState.prompt || state.description;
  }

  if (state.activePageBuilderId === 'global') {
    return state.description;
  }

  const targetPage = state.pages.find(page => page.id === state.activePageBuilderId);
  if (!targetPage) {
    return state.description;
  }

  return `App: ${state.description}\nPage: ${targetPage.name} - ${targetPage.description}`;
};

const getInitialElements = (state: OnePaperAppState) => {
  if (!state.activePageBuilderId) {
    return state.layoutElements;
  }

  if (state.activePageBuilderId.startsWith('REGEN_')) {
    return state.regenState.layoutElements;
  }

  if (state.activePageBuilderId === 'global') {
    return state.layoutElements;
  }

  return state.pages.find(page => page.id === state.activePageBuilderId)?.layoutElements || [];
};

export default function EditorBuilderLayer({ state, actions }: Props) {
  if (!state.isBuilderOpen) {
    return null;
  }

  const handleSave = (base64: string, elements: LayoutElement[]) => {
    if (state.activePageBuilderId) {
      if (state.activePageBuilderId.startsWith('REGEN_')) {
        actions.setRegenState(prev => ({
          ...prev,
          layoutImage: base64,
          layoutElements: elements,
          isOpen: true,
        }));
      } else {
        actions.setPages(state.pages.map(page => (
          page.id === state.activePageBuilderId
            ? { ...page, layoutImage: base64, layoutElements: elements }
            : page
        )));
      }
    } else {
      actions.setLayoutImage(base64);
      actions.setLayoutElements(elements);
    }

    actions.setIsBuilderOpen(false);
  };

  const handleCancel = () => {
    actions.setIsBuilderOpen(false);

    if (state.activePageBuilderId?.startsWith('REGEN_')) {
      actions.setRegenState(prev => ({ ...prev, isOpen: true }));
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-white dark:bg-stone-900">
      <LayoutBuilder
        device={state.resolution}
        lang={state.lang}
        theme={state.theme}
        contentImages={[]}
        initialElements={getInitialElements(state)}
        contextDescription={getBuilderContextDescription(state)}
        onAddNotification={actions.addNotification}
        onSave={handleSave}
        onCancel={handleCancel}
      />
    </div>
  );
}
