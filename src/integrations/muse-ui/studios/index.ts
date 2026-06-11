import type { StudioType } from '../types';
import type { StudioDefinition } from './types';
import uiDesigner from './uiDesigner';
import mediaStudio from './mediaStudio';
import gameStudio from './gameStudio';

export const STUDIOS: Record<StudioType, StudioDefinition> = {
  'ui-designer': uiDesigner,
  'media-studio': mediaStudio,
  'game-studio': gameStudio,
};

export const STUDIO_LIST: StudioDefinition[] = [uiDesigner, mediaStudio, gameStudio];

export function getStudio(id: StudioType | string | undefined): StudioDefinition {
  const key = id as StudioType;
  return STUDIOS[key] || uiDesigner;
}

export * from './types';
