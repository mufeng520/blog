import type { LayoutElement } from '../types';
import { getDB } from './db';

export interface LayoutPreset {
  id: string;
  name: string;
  elements: LayoutElement[];
  timestamp: number;
}

export const getPresets = async (): Promise<LayoutPreset[]> => {
  const db = await getDB();
  return db.getAll('layoutPresets');
};

export const savePreset = async (preset: LayoutPreset): Promise<string> => {
  const db = await getDB();
  const id = preset.id || crypto.randomUUID();
  await db.put('layoutPresets', { ...preset, id });
  return id;
};

export const deletePreset = async (id: string): Promise<void> => {
  const db = await getDB();
  await db.delete('layoutPresets', id);
};
