import React from 'react';
import GalleryManager from '../GalleryManager';
import type { OnePaperAppActions, OnePaperAppState } from '../../hooks/useAppLogic';
import type { GeneratedImage } from '../../types';

type Props = {
  state: OnePaperAppState;
  actions: OnePaperAppActions;
};

const getImageSize = (image: GeneratedImage) => {
  if (!image.details?.resolution) {
    return { width: 1000, height: 1000 };
  }

  const [rawWidth, rawHeight] = image.details.resolution.split('x');
  const width = Number.parseInt(rawWidth, 10);
  const height = Number.parseInt(rawHeight, 10);

  if (Number.isNaN(width) || Number.isNaN(height)) {
    return { width: 1000, height: 1000 };
  }

  return { width, height };
};

export default function EditorGalleryLayer({ state, actions }: Props) {
  if (!state.isGalleryOpen) {
    return null;
  }

  return (
    <GalleryManager
      history={state.history}
      onUpdateHistory={actions.setHistory}
      onSelect={() => {}}
      onAddBatch={(images) => {
        const newBoards = images.map((image, index) => {
          const { width, height } = getImageSize(image);

          return {
            id: `${image.id}-${Date.now()}`,
            x: 100 + index * 50,
            y: 100 + index * 50,
            width,
            height,
            image,
            label: image.prompt,
          };
        });

        actions.setArtboards(prev => [...prev, ...newBoards]);
        actions.setIsGalleryOpen(false);
      }}
      onClose={() => actions.setIsGalleryOpen(false)}
      lang={state.lang}
      onAddNotification={actions.addNotification}
      projects={state.projects}
      currentProjectId={state.currentProjectId}
    />
  );
}
