import { useState } from 'react';
import { useAppLogic } from './useAppLogic';
import { useEditorShortcuts } from './useEditorShortcuts';
import { useFirstUseTips } from './useFirstUseTips';
import { useRegenTargetImage } from './useRegenTargetImage';

export function useEditorRuntime(projectId?: string) {
  const { state, actions } = useAppLogic(projectId);
  const [isChangelogOpen, setIsChangelogOpen] = useState(false);
  const { showFirstUseTips, closeFirstUseTips } = useFirstUseTips();

  useEditorShortcuts({
    currentProjectId: state.currentProjectId,
    onSaveProject: actions.handleUpdateProjectContent,
    setScale: actions.setScale,
  });

  const targetImage = useRegenTargetImage(state.artboards, state.regenState.artboardId);

  return {
    state,
    actions,
    isChangelogOpen,
    setIsChangelogOpen,
    showFirstUseTips,
    closeFirstUseTips,
    targetImage,
  };
}
