import type { StickerDesignConfig, StickerFormat, StickerTextStyle } from '../../types';

interface StickerConstants {
  formats?: Array<{ id: string; promptModifier: string }>;
  styles: Array<{ id: string; promptModifier: string }>;
  shapes: Array<{ id: string; promptModifier: string }>;
  themes: Array<{ id: string; promptModifier: string }>;
  sizes: Array<{ id: string; promptModifier: string }>;
  textStyles?: Array<{ id: string; promptModifier: string }>;
  backgrounds: Array<{ id: string; promptModifier: string }>;
  aspects?: Array<{ id: string; promptModifier: string }>;
}

export function buildStickerDesignPrompt(
  content: string,
  config: StickerDesignConfig,
  constants: StickerConstants,
): string {
  const format = getFormat(config);
  const textStyle = config.textStyle || 'none';
  const isSheet = format === 'sheet';
  const isThreeViews = format === 'three-views';
  const sheetCount = clampSheetCount(config.sheetCount);
  const text = config.text?.trim();
  const whiteBorder = config.whiteBorder ?? true;
  const facialFeatures = config.facialFeatures ?? true;

  const formatMod = getModifier(constants.formats, format);
  const styleMod = getModifier(constants.styles, config.style);
  const shapeMod = getModifier(constants.shapes, config.shape);
  const themeMod = getModifier(constants.themes, config.theme);
  const sizeMod = getModifier(constants.sizes, isSheet ? 'sheet' : config.size);
  const textStyleMod = getModifier(constants.textStyles, textStyle);
  const bgMod = getModifier(constants.backgrounds, config.background);
  const aspectMod = getModifier(constants.aspects, config.aspect);

  return `
Create a polished OnePaper sticker-mode image. The result should feel like a finished visual asset, not a UI mockup or app screen.

SUBJECT
${content || 'A cute, memorable sticker concept suitable for merchandise, emoji packs, or visual notes.'}
${config.subjectName ? `Subject name: "${config.subjectName}"` : ''}
${config.expression ? `Expression or action: ${config.expression}` : ''}

OUTPUT FORMAT
${formatMod}
${isSheet ? getSheetRequirements(sheetCount) : ''}
${isThreeViews ? getThreeViewRequirements() : ''}

VISUAL STYLE
${styleMod}
${whiteBorder ? getBorderInstruction(config.style) : 'Border: Do not force a white sticker border. Use a clean silhouette or style-appropriate outline only if it improves readability.'}

SUBJECT TYPE
${themeMod}
${facialFeatures ? '- If the subject can have a face, include clear expressive facial features.' : '- Avoid adding facial features unless the subject explicitly requires them.'}

CUT SHAPE AND COMPOSITION
${shapeMod}
${getCompositionInstruction(config.shape, format)}

SIZE AND CANVAS
${sizeMod}
${aspectMod || `Canvas: ${config.aspect} composition.`}

TEXT TREATMENT
${textStyleMod || 'Text: Do not add forced lettering unless requested.'}
${text ? `Exact text to include: "${text}"` : ''}
${text && textStyle !== 'none' ? getTextRequirements(textStyle) : ''}

BACKGROUND
${bgMod}

STRICT QUALITY RULES
- Keep the sticker subject isolated, readable, and centered with generous margins.
- Use crisp edges suitable for die-cutting and high-resolution export.
- Avoid complex scene backgrounds, UI frames, watermarks, signatures, and product mockups.
- Avoid photographic realism for human faces; use stylized illustration instead.
- Preserve one consistent art direction, palette, lighting logic, and line style.
- Make every visual decision support the selected sticker mode rather than a standalone app interface.
`.trim();
}

function getFormat(config: StickerDesignConfig): StickerFormat {
  if (config.format) return config.format;
  return config.size === 'sheet' ? 'sheet' : 'single';
}

function getModifier(arr: { id: string; promptModifier?: string }[] | undefined, id: string): string {
  return arr?.find(o => o.id === id)?.promptModifier ?? '';
}

function clampSheetCount(count: number | undefined): number {
  if (!Number.isFinite(count)) return 6;
  return Math.max(2, Math.min(12, Math.round(count || 6)));
}

function getBorderInstruction(style: string): string {
  const borders: Record<string, string> = {
    flat: 'Border: Add a thick, even white die-cut outline around the entire subject.',
    chibi: 'Border: Add a soft rounded white outline that reinforces the cute character silhouette.',
    'puffy-3d': 'Border: Add a soft inflated rim with a subtle highlight; keep everything rounded and tactile.',
    'enamel-pin': 'Border: Use a raised metallic outline instead of plain white when it fits the enamel-pin finish.',
    'chrome-badge': 'Border: Use a beveled chrome edge with reflective highlights.',
    'die-cut': 'Border: Use a bold energetic outline around the entire die-cut silhouette.',
    vintage: 'Border: Use a slightly worn cream or off-white sticker edge with tasteful distressing.',
  };
  return borders[style] || borders.flat;
}

function getCompositionInstruction(shape: string, format: StickerFormat): string {
  if (format === 'sheet') {
    return 'Composition: Each mini sticker may follow its own natural silhouette. Arrange all items on a clean visual grid with equal spacing.';
  }

  if (format === 'three-views') {
    return 'Composition: Place the three views side by side with equal visual weight. Do not crop any view. Keep the same scale and proportions.';
  }

  const compositions: Record<string, string> = {
    custom: 'Composition: Follow the natural silhouette of the subject with a consistent cut margin.',
    circle: 'Composition: Center the subject inside a circular boundary and keep critical details away from the edge.',
    square: 'Composition: Fill the square efficiently with balanced padding on all sides.',
    rounded: 'Composition: Use a friendly rounded rectangle boundary with comfortable internal spacing.',
    star: 'Composition: Adapt the subject to the star shape, keeping important details in the center.',
    heart: 'Composition: Center the subject inside the heart shape with a playful or affectionate feeling.',
  };
  return compositions[shape] || compositions.custom;
}

function getSheetRequirements(sheetCount: number): string {
  return `
- Include exactly ${sheetCount} individual stickers.
- Use a stable grid or loose-grid sheet layout; do not randomly scatter items.
- Keep all mini stickers in the same visual family.
- Vary poses, expressions, related objects, or micro-scenes so the sheet feels useful.
- Leave visible space between stickers and avoid overlaps.
- Include subtle cut-line logic only if it improves the sticker-sheet presentation.`.trim();
}

function getThreeViewRequirements(): string {
  return `
- Include exactly three views: front, side, and back.
- Treat this as a design reference sheet for the same sticker subject.
- Keep colors, materials, expression language, and silhouette consistent.
- Labeling is optional; if labels are added, keep them small and clean.`.trim();
}

function getTextRequirements(textStyle: StickerTextStyle): string {
  if (textStyle === 'headline') {
    return `
- Make the text a major visual element.
- Preserve spelling exactly.
- Ensure the lettering is readable at sticker size.
- Integrate the lettering with the sticker silhouette and border.`.trim();
  }

  return `
- Preserve spelling exactly.
- Keep the caption fully inside the sticker-safe area.
- Make the caption readable without overpowering the subject.`.trim();
}
