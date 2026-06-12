import { useMemo } from 'react';
import type { Artboard } from '../types';

export function useRegenTargetImage(artboards: Artboard[], artboardId: string | null) {
  return useMemo(() => {
    if (!artboardId) return null;
    const artboard = artboards.find(item => item.id === artboardId);
    return artboard ? artboard.image.url : null;
  }, [artboardId, artboards]);
}
