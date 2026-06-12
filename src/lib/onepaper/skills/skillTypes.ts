import type { CreatorRole, SkillType } from '../types';

export const ONEPAPER_SKILL_TYPES: SkillType[] = [
  'cover-image',
  'infographic',
  'xhs-images',
  'comic',
  'article-illustrator',
  'slide-deck',
  'logo',
  'sticker-design',
  'animation-sequence',
];

export function isOnePaperSkill(role: CreatorRole): role is SkillType {
  return ONEPAPER_SKILL_TYPES.includes(role as SkillType);
}
