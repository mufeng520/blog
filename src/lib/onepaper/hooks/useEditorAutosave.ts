import { useEffect, useRef } from 'react';
import type { AppConfigExport, Artboard, ArtboardGroup } from '../types';

type EditorAutosaveConfig = Partial<AppConfigExport>;

type UseEditorAutosaveOptions = {
  currentProjectId: string | null;
  isLoadingProject: boolean;
  artboards: Artboard[];
  artboardGroups: ArtboardGroup[];
  config: EditorAutosaveConfig;
  onSave: (
    projectId: string,
    config: EditorAutosaveConfig,
    artboards: Artboard[],
    artboardGroups: ArtboardGroup[],
    thumbnail?: string,
    skipStateUpdate?: boolean,
  ) => Promise<void>;
};

export function useEditorAutosave({
  currentProjectId,
  isLoadingProject,
  artboards,
  artboardGroups,
  config,
  onSave,
}: UseEditorAutosaveOptions) {
  const lastSavedRef = useRef<string>('');

  useEffect(() => {
    if (!currentProjectId) return;
    if (isLoadingProject) return;

    const currentStateString = JSON.stringify({
      artboards: artboards.map(artboard => ({
        id: artboard.id,
        x: artboard.x,
        y: artboard.y,
        w: artboard.width,
        h: artboard.height,
        imageId: artboard.image?.id,
        label: artboard.label,
        groupId: artboard.groupId,
      })),
      artboardGroups,
      config,
    });

    if (lastSavedRef.current === currentStateString) return;

    if (lastSavedRef.current === '') {
      lastSavedRef.current = currentStateString;
      return;
    }

    const timer = setTimeout(async () => {
      let thumbnail: string | undefined;
      if (artboards.length > 0) {
        try {
          const element = document.getElementById('main-canvas-area');
          if (element) {
            const { default: html2canvas } = await import('html2canvas');
            const canvas = await html2canvas(element, { useCORS: true, scale: 0.15, logging: false });
            thumbnail = canvas.toDataURL('image/jpeg', 0.6);
          }
        } catch (_) {}
      }

      onSave(currentProjectId, config, artboards, artboardGroups, thumbnail, true).then(() => {
        lastSavedRef.current = currentStateString;
        console.log('Auto-saved');
      });
    }, 3000);

    return () => clearTimeout(timer);
  }, [
    currentProjectId,
    isLoadingProject,
    artboards,
    artboardGroups,
    config,
  ]);
}
