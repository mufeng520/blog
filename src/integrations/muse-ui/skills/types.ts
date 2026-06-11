// Skill System Shared Types
// These mirror the types in src/types.ts for local skill module usage

export interface SkillOption {
  id: string;
  name: string;
  name_zh: string;
  description: string;
  promptModifier: string;
}

export interface SkillStyleOption extends SkillOption {
  category?: string;
  bestFor?: string[];
}
