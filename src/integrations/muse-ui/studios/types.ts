import type { StudioType } from '../types';

export interface StudioDefinition {
  id: StudioType;
  name: string;
  name_zh: string;
  icon: string; // IconLoader name
  description: string;
  description_zh: string;
  themeColor: string; // Tailwind color class, e.g. 'indigo', 'rose', 'emerald'
}
