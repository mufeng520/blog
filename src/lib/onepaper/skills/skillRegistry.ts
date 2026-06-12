import type {
  AnimationSequenceConfig,
  ArticleIllustratorConfig,
  ComicConfig,
  CoverImageConfig,
  InfographicConfig,
  LangType,
  LogoConfig,
  SkillConfig,
  SkillType,
  SlideDeckConfig,
  StickerDesignConfig,
  XHSImagesConfig,
} from '../types';
export { isOnePaperSkill, ONEPAPER_SKILL_TYPES } from './skillTypes';

export interface OnePaperSkillDefinition {
  id: SkillType;
  label: string;
  label_zh: string;
  description: string;
  description_zh: string;
  generateLabel: string;
  generateLabel_zh: string;
  defaultConfig: SkillConfig;
}

const defaultCoverConfig: CoverImageConfig = {
  type: 'conceptual',
  palette: 'warm',
  rendering: 'flat-vector',
  text: 'title-only',
  mood: 'balanced',
  font: 'clean',
  title: '',
  subtitle: '',
  aspect: '16:9',
};

const defaultInfographicConfig: InfographicConfig = {
  layout: 'bento-grid',
  style: 'craft-handmade',
  aspect: 'landscape',
};

const defaultXHSConfig: XHSImagesConfig = {
  style: 'cute',
  layout: 'balanced',
  strategy: 'info-dense',
};

const defaultComicConfig: ComicConfig = {
  art: 'manga',
  tone: 'neutral',
  layout: 'standard',
  preset: 'custom',
  aspect: '3:4',
  pageCount: 6,
};

const defaultArticleConfig: ArticleIllustratorConfig = {
  type: 'infographic',
  style: 'notion',
  density: 'balanced',
};

const defaultSlideConfig: SlideDeckConfig = {
  preset: 'blueprint',
  audience: 'general',
};

const defaultLogoConfig: LogoConfig = {
  type: 'combination',
  style: 'flat',
  palette: 'dual-tone',
  industry: 'general',
  mood: 'professional',
  size: '1:1',
  brandName: '',
  slogan: '',
};

const defaultStickerConfig: StickerDesignConfig = {
  style: 'flat',
  shape: 'custom',
  theme: 'character',
  size: 'medium',
  format: 'single',
  background: 'transparent',
  subjectName: '',
  expression: '',
  aspect: '1:1',
  sheetCount: 6,
  text: '',
  textStyle: 'none',
  whiteBorder: true,
  facialFeatures: true,
};

const defaultAnimationSequenceConfig: AnimationSequenceConfig = {
  style: 'clean-vector',
  motion: 'subtle-loop',
  framing: 'medium',
  continuity: 'strict',
  aspect: '16:9',
  frameCount: 6,
  fps: 12,
  durationSeconds: 2,
};

export const ONEPAPER_SKILL_DEFINITIONS: OnePaperSkillDefinition[] = [
  {
    id: 'cover-image',
    label: 'Cover',
    label_zh: '封面图',
    description: 'Article & book covers',
    description_zh: '文章与书籍封面',
    generateLabel: 'Generate Cover',
    generateLabel_zh: '生成封面图',
    defaultConfig: { type: 'cover-image', coverImage: defaultCoverConfig },
  },
  {
    id: 'infographic',
    label: 'Info',
    label_zh: '信息图',
    description: 'Data visualizations',
    description_zh: '数据可视化',
    generateLabel: 'Generate Infographic',
    generateLabel_zh: '生成信息图',
    defaultConfig: { type: 'infographic', infographic: defaultInfographicConfig },
  },
  {
    id: 'xhs-images',
    label: 'XHS',
    label_zh: '小红书',
    description: 'Social media carousels',
    description_zh: '社交媒体轮播图',
    generateLabel: 'Generate XHS Images',
    generateLabel_zh: '生成小红书配图',
    defaultConfig: { type: 'xhs-images', xhsImages: defaultXHSConfig },
  },
  {
    id: 'comic',
    label: 'Comic',
    label_zh: '漫画',
    description: 'Knowledge comics',
    description_zh: '知识漫画',
    generateLabel: 'Generate Comic',
    generateLabel_zh: '生成漫画',
    defaultConfig: { type: 'comic', comic: defaultComicConfig },
  },
  {
    id: 'article-illustrator',
    label: 'Illus',
    label_zh: '插图',
    description: 'Article illustrations',
    description_zh: '文章插图',
    generateLabel: 'Generate Illustrations',
    generateLabel_zh: '生成文章插图',
    defaultConfig: { type: 'article-illustrator', articleIllustrator: defaultArticleConfig },
  },
  {
    id: 'slide-deck',
    label: 'Slides',
    label_zh: '幻灯片',
    description: 'Presentation slides',
    description_zh: '演示幻灯片',
    generateLabel: 'Generate Slides',
    generateLabel_zh: '生成幻灯片',
    defaultConfig: { type: 'slide-deck', slideDeck: defaultSlideConfig },
  },
  {
    id: 'logo',
    label: 'Logo',
    label_zh: 'Logo',
    description: 'Brand logo design',
    description_zh: 'Logo 设计',
    generateLabel: 'Generate Logo',
    generateLabel_zh: '生成 Logo',
    defaultConfig: { type: 'logo', logo: defaultLogoConfig },
  },
  {
    id: 'sticker-design',
    label: 'Sticker',
    label_zh: '贴纸',
    description: 'Sticker & emoji design',
    description_zh: '贴纸与表情设计',
    generateLabel: 'Generate Sticker',
    generateLabel_zh: '生成贴纸',
    defaultConfig: { type: 'sticker-design', stickerDesign: defaultStickerConfig },
  },
  {
    id: 'animation-sequence',
    label: 'Animation',
    label_zh: '动画序列',
    description: 'Keyframes & storyboards',
    description_zh: '关键帧与分镜序列',
    generateLabel: 'Generate Animation Frames',
    generateLabel_zh: '生成动画序列',
    defaultConfig: { type: 'animation-sequence', animationSequence: defaultAnimationSequenceConfig },
  },
];

export function getOnePaperSkillDefinition(skillType: SkillType): OnePaperSkillDefinition {
  const definition = ONEPAPER_SKILL_DEFINITIONS.find(skill => skill.id === skillType);
  if (!definition) {
    throw new Error(`Unknown OnePaper skill: ${skillType}`);
  }
  return definition;
}

export function getSkillGenerateLabel(skillType: SkillType, lang: LangType): string {
  const definition = getOnePaperSkillDefinition(skillType);
  return lang === 'zh' ? definition.generateLabel_zh : definition.generateLabel;
}

export function createDefaultSkillConfig(skillType: SkillType): SkillConfig {
  const config = getOnePaperSkillDefinition(skillType).defaultConfig;

  return {
    ...config,
    coverImage: config.coverImage ? { ...config.coverImage } : undefined,
    infographic: config.infographic ? { ...config.infographic } : undefined,
    xhsImages: config.xhsImages ? { ...config.xhsImages } : undefined,
    comic: config.comic ? { ...config.comic } : undefined,
    articleIllustrator: config.articleIllustrator ? { ...config.articleIllustrator } : undefined,
    slideDeck: config.slideDeck ? { ...config.slideDeck } : undefined,
    logo: config.logo ? { ...config.logo } : undefined,
    stickerDesign: config.stickerDesign ? { ...config.stickerDesign } : undefined,
    animationSequence: config.animationSequence ? { ...config.animationSequence } : undefined,
  };
}
