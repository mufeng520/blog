import { useEffect } from 'react';

type UseEditorShortcutsOptions = {
  currentProjectId?: string | null;
  onSaveProject: (projectId: string) => void;
  setScale: (updater: (scale: number) => number) => void;
};

const isEditableTarget = (target: EventTarget | null): boolean => {
  if (!(target instanceof HTMLElement)) return false;
  return target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable;
};

export function useEditorShortcuts({
  currentProjectId,
  onSaveProject,
  setScale,
}: UseEditorShortcutsOptions) {
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (isEditableTarget(event.target)) return;

      const isMod = event.ctrlKey || event.metaKey;
      if (!isMod) return;

      if (event.key === 's') {
        event.preventDefault();
        if (currentProjectId) {
          onSaveProject(currentProjectId);
        }
        return;
      }

      if (event.key === '+' || event.key === '=') {
        event.preventDefault();
        setScale((scale) => Math.min(5, scale + 0.1));
        return;
      }

      if (event.key === '-') {
        event.preventDefault();
        setScale((scale) => Math.max(0.1, scale - 0.1));
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentProjectId, onSaveProject, setScale]);
}
