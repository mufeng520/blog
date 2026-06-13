import type {
  AnimationSequenceConfig,
  CoverImageConfig, InfographicConfig, XHSImagesConfig,
  ComicConfig, ArticleIllustratorConfig, SlideDeckConfig,
  LogoConfig, StickerDesignConfig, SkillType
} from '../types';
import { buildStickerDesignPrompt as buildStickerDesignProductionPrompt } from './sticker-design/promptBuilder';

// Placeholder imports - will be resolved once constants are migrated
// import { COVER_TYPES, COVER_PALETTES, COVER_RENDERINGS, COVER_TEXTS, COVER_MOODS, COVER_FONTS } from './cover-image/constants';
// import { INFOGRAPHIC_LAYOUTS, INFOGRAPHIC_STYLES } from './infographic/constants';
// import { XHS_STYLES, XHS_LAYOUTS, XHS_STRATEGIES } from './xhs-images/constants';
// import { COMIC_ART_STYLES, COMIC_TONES, COMIC_LAYOUTS, COMIC_PRESETS } from './comic/constants';
// import { ARTICLE_TYPES, ARTICLE_STYLES, ARTICLE_DENSITIES } from './article-illustrator/constants';
// import { SLIDE_PRESETS, SLIDE_AUDIENCES } from './slide-deck/constants';

// ============================================================
// Helper: resolve option by id from an array
// ============================================================
function findOption<T extends { id: string }>(arr: T[] | undefined, id: string): T | undefined {
  return arr?.find(o => o.id === id);
}

function getModifier(arr: { id: string; promptModifier?: string }[] | undefined, id: string): string {
  return findOption(arr, id)?.promptModifier ?? '';
}

const getAnimationAspectRatioValue = (aspect: string): number => {
  const map: Record<string, number> = {
    '1:1': 1,
    '3:4': 3 / 4,
    '4:3': 4 / 3,
    '9:16': 9 / 16,
    '16:9': 16 / 9,
    '2:3': 2 / 3,
    '3:2': 3 / 2,
  };
  return map[aspect] || 16 / 9;
};

const inferAnimationGrid = (frameCount: number, aspect: string) => {
  const count = Math.max(1, Math.round(frameCount));
  const sheetRatio = getAnimationAspectRatioValue(aspect);
  let best = { cols: count, rows: 1, score: Number.POSITIVE_INFINITY };

  for (let rows = 1; rows <= count; rows++) {
    for (let cols = 1; cols <= count; cols++) {
      const cells = cols * rows;
      if (cells < count) continue;

      const emptyPenalty = (cells - count) * 0.85;
      const ratioPenalty = Math.abs((cols / rows) - sheetRatio) * 2;
      const shapePenalty = Math.abs(cols - rows) * 0.04;
      const score = emptyPenalty + ratioPenalty + shapePenalty;

      if (score < best.score) {
        best = { cols, rows, score };
      }
    }
  }

  return { cols: best.cols, rows: best.rows };
};

const buildAnimationKeyframeContract = (config: AnimationSequenceConfig) => {
  const frameCount = Math.max(1, config.frameCount);
  const loopRule = config.motion === 'subtle-loop'
    ? '- Loop closure: frame 1 and the final frame must be visually compatible so playback can return to frame 1 without a jump.'
    : '- Action closure: the last frame is the target state; do not force it to loop unless the action naturally loops.';

  return `
KEYFRAME PROGRESSION CONTRACT:
- The sheet contains ${frameCount} keyframes that complete one full motion cycle or one complete action pass.
- Each neighboring frame should advance the pose by one clear, readable step.
${loopRule}
- Use a locked camera, fixed scale, fixed horizon/ground line, and a stable registration anchor across every cell.
- Keep subject proportions, colors, line weight, lighting direction, and background anchors identical.
- Avoid sudden teleporting, pose skips, cropped limbs, changing character design, or inconsistent object size.
`.trim();
};

// ============================================================
// 1. Cover Image Prompt Builder
// ============================================================
export function buildCoverImagePrompt(
  content: string,
  config: CoverImageConfig,
  constants: {
    types: any[];
    palettes: any[];
    renderings: any[];
    texts: any[];
    moods: any[];
    fonts: any[];
  }
): string {
  const typeMod = getModifier(constants.types, config.type);
  const paletteMod = getModifier(constants.palettes, config.palette);
  const renderingMod = getModifier(constants.renderings, config.rendering);
  const textMod = getModifier(constants.texts, config.text);
  const moodMod = getModifier(constants.moods, config.mood);
  const fontMod = getModifier(constants.fonts, config.font);

  return `
Create an elegant cover image for the following content.

TYPE: ${config.type}
${typeMod}

COLOR PALETTE: ${config.palette}
${paletteMod}

RENDERING STYLE: ${config.rendering}
${renderingMod}

TEXT LEVEL: ${config.text}
${textMod}

MOOD: ${config.mood}
${moodMod}

TYPOGRAPHY: ${config.font}
${fontMod}

COMPOSITION PRINCIPLES:
- 40-60% whitespace breathing room
- Visual anchor centered or offset left
- Simplified silhouettes for characters, NO realistic humans

CONTENT TO VISUALIZE:
${content}

${config.title ? `TITLE (must use exact): "${config.title}"` : ''}
${config.subtitle ? `SUBTITLE: "${config.subtitle}"` : ''}
  `.trim();
}

// ============================================================
// 2. Infographic Prompt Builder
// ============================================================
export function buildInfographicPrompt(
  content: string,
  config: InfographicConfig,
  constants: {
    layouts: any[];
    styles: any[];
  }
): string {
  const layoutMod = getModifier(constants.layouts, config.layout);
  const styleMod = getModifier(constants.styles, config.style);

  return `
Create a professional infographic.

LAYOUT: ${config.layout}
${layoutMod}

VISUAL STYLE: ${config.style}
${styleMod}

CORE PRINCIPLES:
- Preserve all source data verbatim—no summarization or rephrasing
- Structure for visual communication (headlines, labels, visual elements)
- Define learning objectives before structuring content

ASPECT RATIO: ${config.aspect}

CONTENT:
${content}
  `.trim();
}

// ============================================================
// 3. XHS Images Prompt Builder
// ============================================================
export function buildXHSImagesPrompt(
  content: string,
  config: XHSImagesConfig,
  pageIndex: number,
  constants: {
    styles: any[];
    layouts: any[];
    strategies: any[];
  },
  pageType: 'cover' | 'content' | 'ending' = 'content',
  refImage?: string
): { prompt: string; refImage?: string } {
  const styleMod = getModifier(constants.styles, config.style);
  const layoutMod = getModifier(constants.layouts, config.layout);
  const strategyMod = getModifier(constants.strategies, config.strategy);

  const pageTypeDesc = pageIndex === 0 ? 'COVER (first image - establishes visual anchor)' :
    pageType === 'ending' ? 'ENDING (call to action / summary)' :
    `CONTENT PAGE ${pageIndex}`;

  return {
    prompt: `
Create a Xiaohongshu (Little Red Book) infographic image.

PAGE TYPE: ${pageTypeDesc}
STYLE: ${config.style}
${styleMod}

LAYOUT: ${config.layout}
${layoutMod}

STRATEGY: ${config.strategy}
${strategyMod}

VISUAL CONSISTENCY:
${refImage ? '- Maintain visual consistency with the reference image (same color palette, illustration style, character design)' : '- This is the FIRST image. Establish the visual anchor for the entire series.'}

CONTENT:
${content}
    `.trim(),
    refImage
  };
}

// ============================================================
// 4. Comic Prompt Builder
// ============================================================
export function buildComicPrompt(
  content: string,
  config: ComicConfig,
  constants: {
    artStyles: any[];
    tones: any[];
    layouts: any[];
    presets: any[];
  },
  charRef?: string
): { prompt: string; charRef?: string } {
  const artMod = getModifier(constants.artStyles, config.art);
  const toneMod = getModifier(constants.tones, config.tone);
  const layoutMod = getModifier(constants.layouts, config.layout);
  const presetMod = config.preset !== 'custom' ? getModifier(constants.presets, config.preset) : '';

  return {
    prompt: `
Create a single knowledge comic image containing ${config.pageCount} panels arranged in a ${config.layout} layout.

ART STYLE: ${config.art}
${artMod}

TONE: ${config.tone}
${toneMod}

LAYOUT: ${config.layout} — ${config.pageCount} panels
${layoutMod}

${presetMod ? `PRESET RULES: ${config.preset}\n${presetMod}` : ''}

CHARACTER CONSISTENCY:
${charRef ? '- Maintain character designs from the character reference sheet' : '- Establish all character designs clearly and consistently across all panels.'}

PANEL COUNT: ${config.pageCount} panels within this single image.

CONTENT:
${content}
    `.trim(),
    charRef
  };
}

// ============================================================
// 5. Article Illustrator Prompt Builder
// ============================================================
export function buildArticleIllustratorPrompt(
  content: string,
  config: ArticleIllustratorConfig,
  constants: {
    types: any[];
    styles: any[];
    densities: any[];
  }
): string {
  const typeMod = getModifier(constants.types, config.type);
  const styleMod = getModifier(constants.styles, config.style);
  const densityMod = getModifier(constants.densities, config.density);

  const densityDesc = config.density === 'minimal' ? '1-2 illustration zones' :
    config.density === 'balanced' ? '3-5 illustration zones' :
    config.density === 'per-section' ? 'one illustration per major section' :
    '6+ illustration zones, dense and rich';

  return `
Create a single article illustration image.

TYPE: ${config.type}
${typeMod}

STYLE: ${config.style}
${styleMod}

DENSITY: ${config.density} — ${densityDesc}
${densityMod}

INSTRUCTION:
This is a SINGLE image. Incorporate ${densityDesc} within this one illustration, arranged to support the article structure.

METAPHOR RULE:
Visualize the underlying concept, NOT literal image.

CONTENT TO ILLUSTRATE:
${content}
  `.trim();
}

// ============================================================
// 6. Slide Deck Prompt Builder
// ============================================================
export function buildSlideDeckPrompt(
  content: string,
  config: SlideDeckConfig,
  slideIndex: number | undefined,
  constants: {
    presets: any[];
    audiences: any[];
  }
): string {
  const presetMod = getModifier(constants.presets, config.preset);
  const audienceMod = getModifier(constants.audiences, config.audience);

  // undefined slideIndex = single mode; 0 = batch first slide (COVER)
  const slideType = slideIndex === undefined ? 'SLIDE' :
    slideIndex === 0 ? 'COVER' : `SLIDE ${slideIndex + 1}`;

  return `
Create a slide deck image.

${slideType}

STYLE PRESET: ${config.preset}
${presetMod}

AUDIENCE: ${config.audience}
${audienceMod}

DESIGN PHILOSOPHY:
- Self-explanatory without verbal commentary
- Logical flow when scrolling
- All necessary context within each slide
- Optimized for social media sharing

CONTENT:
${content}
  `.trim();
}

// ============================================================
// 7. Logo Prompt Builder
// ============================================================
export function buildLogoPrompt(
  content: string,
  config: LogoConfig,
  constants: {
    types: any[];
    styles: any[];
    palettes: any[];
    industries: any[];
    moods: any[];
  }
): string {
  const typeMod = getModifier(constants.types, config.type);
  const styleMod = getModifier(constants.styles, config.style);
  const paletteMod = getModifier(constants.palettes, config.palette);
  const industryMod = getModifier(constants.industries, config.industry);
  const moodMod = getModifier(constants.moods, config.mood);

  const sizeMap: Record<string, string> = {
    '1:1': '500×500 pixels (square)',
    '4:3': '600×450 pixels (landscape)',
    '16:9': '800×450 pixels (wide)',
    '3:4': '450×600 pixels (portrait)',
    '2:1': '800×400 pixels (banner)',
  };
  const sizeDesc = sizeMap[config.size] || sizeMap['1:1'];

  return `
Design a professional logo for the brand "${config.brandName}".
${config.slogan ? `Brand slogan: "${config.slogan}".` : ''}

LOGO TYPE: ${config.type}
${typeMod}

VISUAL STYLE: ${config.style}
${styleMod}

COLOR PALETTE: ${config.palette}
${paletteMod}

INDUSTRY: ${config.industry}
${industryMod}

MOOD: ${config.mood}
${moodMod}

OUTPUT SIZE: ${config.size} aspect ratio, ${sizeDesc}

REQUIREMENTS:
- Clean, scalable vector-style output
- The logo should work on both light and dark backgrounds
- Ensure the brand name is legible and well-integrated
- Output as a single centered logo on a clean white background
- No mockups, no background scenes — just the logo mark itself

${content ? `ADDITIONAL CONTEXT:\n${content}` : ''}
  `.trim();
}

// ============================================================
// 8. Sticker Design Prompt Builder
// ============================================================
export function buildStickerDesignPrompt(
  content: string,
  config: StickerDesignConfig,
  constants: {
    formats?: any[];
    styles: any[];
    shapes: any[];
    themes: any[];
    sizes: any[];
    textStyles?: any[];
    backgrounds: any[];
    aspects?: any[];
  }
): string {
  return buildStickerDesignProductionPrompt(content, config, constants);
}

// ============================================================
// 9. Animation Sequence Prompt Builder
// ============================================================
export function buildAnimationSequencePrompt(
  content: string,
  config: AnimationSequenceConfig,
  constants: {
    styles: any[];
    motions: any[];
    framings: any[];
    continuity: any[];
  },
  frameIndex?: number,
  refImage?: string
): { prompt: string; refImage?: string } {
  const styleMod = getModifier(constants.styles, config.style);
  const motionMod = getModifier(constants.motions, config.motion);
  const framingMod = getModifier(constants.framings, config.framing);
  const continuityMod = getModifier(constants.continuity, config.continuity);
  const grid = inferAnimationGrid(config.frameCount, config.aspect);
  const keyframeContract = buildAnimationKeyframeContract(config);
  const frameLabel = frameIndex === undefined
    ? `STORYBOARD SHEET (${config.frameCount} keyframes in one image)`
    : `KEYFRAME ${frameIndex + 1} OF ${config.frameCount}`;

  return {
    prompt: `
Create an animation sequence image.

OUTPUT MODE: ${frameLabel}
ASPECT RATIO: ${config.aspect}
KEYFRAME COUNT: ${config.frameCount}

VISUAL STYLE: ${config.style}
${styleMod}

MOTION TYPE: ${config.motion}
${motionMod}

FRAMING: ${config.framing}
${framingMod}

CONTINUITY MODE: ${config.continuity}
${continuityMod}

ANIMATION DISCIPLINE:
- Treat every generated image as a frame from the same animated shot, not a loose storyboard.
- Preserve stable character identity, costume, object geometry, palette, lighting direction, and background anchors.
- Show readable motion progression with clear silhouettes.
- Avoid random redesigns, abrupt scene changes, inconsistent face details, or unrelated props.
- If text appears, keep it minimal and consistent across frames.

${keyframeContract}

${frameIndex === undefined ? `
STORYBOARD SHEET REQUIREMENTS:
- Compose exactly ${config.frameCount} frames in a ${grid.cols} columns x ${grid.rows} rows sprite sheet.
- Every cell must have the same width and height, separated by straight full-length 1-2px grid lines.
- The separator grid lines are cutting guides only; do not draw black borders, white borders, mats, frames, or panel strokes inside any cell artwork.
- Extend the background artwork cleanly to each cell's cutting edge so every cropped frame is full-bleed with no edge stripe.
- Fill cells left-to-right, top-to-bottom; leave any unused cells blank if the grid has extra capacity.
- Do not draw frame numbers, titles, labels, captions, watermarks, timeline text, or corner badges inside the cells.
- Do not draw arrows unless the motion type explicitly needs diagram annotations; for character/action loops, show the motion through poses only.
- Keep the subject aligned to the same baseline and center registration guide in every cell so the sheet can be cut into animation frames.
- Each cell should be a clean standalone frame after cropping away the grid lines.
` : `
FRAME-SPECIFIC REQUIREMENTS:
- This is frame ${frameIndex + 1} of ${config.frameCount}; do not create a collage.
- Generate only this single frame as a full-quality standalone image.
- Position this frame within the overall motion arc at ${(frameIndex / Math.max(config.frameCount - 1, 1)).toFixed(2)} progress.
${refImage ? '- Use the previous frame reference to preserve exact visual continuity while advancing the motion.' : '- Establish the first frame clearly so later frames can inherit its design.'}
- Keep the same camera, baseline, scale, crop, and subject registration used by the whole sequence.
`}

CONTENT / ACTION TO ANIMATE:
${content}
    `.trim(),
    refImage,
  };
}

// ============================================================
// Master dispatcher
// ============================================================
export interface SkillConstants {
  coverImage?: {
    types: any[];
    palettes: any[];
    renderings: any[];
    texts: any[];
    moods: any[];
    fonts: any[];
  };
  infographic?: {
    layouts: any[];
    styles: any[];
  };
  xhsImages?: {
    styles: any[];
    layouts: any[];
    strategies: any[];
  };
  comic?: {
    artStyles: any[];
    tones: any[];
    layouts: any[];
    presets: any[];
  };
  articleIllustrator?: {
    types: any[];
    styles: any[];
    densities: any[];
  };
  slideDeck?: {
    presets: any[];
    audiences: any[];
  };
  logo?: {
    types: any[];
    styles: any[];
    palettes: any[];
    industries: any[];
    moods: any[];
  };
  stickerDesign?: {
    formats?: any[];
    styles: any[];
    shapes: any[];
    themes: any[];
    sizes: any[];
    textStyles?: any[];
    backgrounds: any[];
    aspects?: any[];
  };
  animationSequence?: {
    styles: any[];
    motions: any[];
    framings: any[];
    continuity: any[];
  };
}

export function buildSkillPrompt(
  skillType: SkillType,
  content: string,
  config: any,
  constants: SkillConstants,
  meta?: { pageIndex?: number; slideIndex?: number; refImage?: string; charRef?: string; pageType?: 'cover' | 'content' | 'ending' }
): string | { prompt: string; refImage?: string; charRef?: string } {
  switch (skillType) {
    case 'cover-image':
      return buildCoverImagePrompt(content, config.coverImage, constants.coverImage!);
    case 'infographic':
      return buildInfographicPrompt(content, config.infographic, constants.infographic!);
    case 'xhs-images':
      return buildXHSImagesPrompt(content, config.xhsImages, meta?.pageIndex ?? 0, constants.xhsImages!, meta?.pageType, meta?.refImage);
    case 'comic':
      return buildComicPrompt(content, config.comic, constants.comic!, meta?.charRef);
    case 'article-illustrator':
      return buildArticleIllustratorPrompt(content, config.articleIllustrator, constants.articleIllustrator!);
    case 'slide-deck':
      return buildSlideDeckPrompt(content, config.slideDeck, meta?.slideIndex, constants.slideDeck!);
    case 'logo':
      return buildLogoPrompt(content, config.logo, constants.logo!);
    case 'sticker-design':
      return buildStickerDesignPrompt(content, config.stickerDesign, constants.stickerDesign!);
    case 'animation-sequence':
      return buildAnimationSequencePrompt(content, config.animationSequence, constants.animationSequence!, meta?.pageIndex, meta?.refImage);
    default:
      throw new Error(`Unknown skill type: ${skillType}`);
  }
}
