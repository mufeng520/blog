import type { StickerDesignConfig } from '../../types';

// ============================================================
// Sticker Design Prompt Builder — Production Quality
// ============================================================

interface StickerConstants {
  styles: Array<{ id: string; promptModifier: string }>;
  shapes: Array<{ id: string; promptModifier: string }>;
  themes: Array<{ id: string; promptModifier: string }>;
  sizes: Array<{ id: string; promptModifier: string }>;
  backgrounds: Array<{ id: string; promptModifier: string }>;
}

export function buildStickerDesignPrompt(
  content: string,
  config: StickerDesignConfig,
  constants: StickerConstants
): string {
  const styleMod = getModifier(constants.styles, config.style);
  const shapeMod = getModifier(constants.shapes, config.shape);
  const themeMod = getModifier(constants.themes, config.theme);
  const sizeMod = getModifier(constants.sizes, config.size);
  const bgMod = getModifier(constants.backgrounds, config.background);

  const isSheet = config.size === 'sheet';

  // Build style-specific border instruction
  const borderInstruction = getBorderInstruction(config.style);

  // Build shape-specific composition instruction
  const compositionInstruction = getCompositionInstruction(config.shape, isSheet);

  return `
You are a professional sticker designer. Create a ${isSheet ? 'sticker sheet' : 'single die-cut sticker'} with the following EXACT specifications. Follow every rule precisely.

═══════════════════════════════════════════════════════════════
1. SUBJECT & CONTENT
═══════════════════════════════════════════════════════════════
${content || 'A cute, eye-catching design suitable for sticker merchandise'}
${config.subjectName ? `\nCharacter/Subject Name: "${config.subjectName}"` : ''}
${config.expression ? `\nExpression / Mood: ${config.expression}` : ''}

═══════════════════════════════════════════════════════════════
2. ART STYLE (MANDATORY)
═══════════════════════════════════════════════════════════════
${styleMod}

${borderInstruction}

═══════════════════════════════════════════════════════════════
3. SHAPE & COMPOSITION
═══════════════════════════════════════════════════════════════
${shapeMod}

${compositionInstruction}

═══════════════════════════════════════════════════════════════
4. THEME DIRECTION
═══════════════════════════════════════════════════════════════
${themeMod}

═══════════════════════════════════════════════════════════════
5. SIZE FORMAT
═══════════════════════════════════════════════════════════════
${sizeMod}

═══════════════════════════════════════════════════════════════
6. BACKGROUND TREATMENT
═══════════════════════════════════════════════════════════════
${bgMod}

═══════════════════════════════════════════════════════════════
7. UNIVERSAL STICKER REQUIREMENTS (STRICT — DO NOT IGNORE)
═══════════════════════════════════════════════════════════════
${isSheet ? getSheetRequirements() : getSingleStickerRequirements()}

═══════════════════════════════════════════════════════════════
8. NEGATIVE CONSTRAINTS (DO NOT INCLUDE THESE)
═══════════════════════════════════════════════════════════════
- NO complex scene backgrounds (no landscapes, rooms, environments)
- NO photographic realistic human faces (stylized/illustrated only)
- NO text overlapping the main subject
- NO drop shadows that look like they're floating in space
- NO gradients inside the sticker body unless the style explicitly requires them
- NO watermarks, signatures, or artist credits
- NO mockups, product packaging, or presentation cards (unless Chrome Badge style)
- NO blurry edges or anti-aliasing artifacts

═══════════════════════════════════════════════════════════════
9. OUTPUT FORMAT
═══════════════════════════════════════════════════════════════
- Center the sticker in the frame with generous margin on all sides
- High contrast between sticker and background for easy isolation
- Clean, crisp edges suitable for die-cutting
- Vibrant, well-separated colors
- Print-ready quality (300 DPI equivalent detail level)
`.trim();
}

// ─── Helpers ─────────────────────────────────────────────────

function getModifier(arr: { id: string; promptModifier?: string }[] | undefined, id: string): string {
  return arr?.find(o => o.id === id)?.promptModifier ?? '';
}

function getBorderInstruction(style: string): string {
  const borders: Record<string, string> = {
    flat: 'BORDER: Thick white die-cut border (4-6px), clean and even all around. The border must be solid white, no gaps.',
    chibi: 'BORDER: Soft white border (3-4px) with rounded edges matching the cute aesthetic. Optional tiny sparkles or stars floating just outside the border.',
    'puffy-3d': 'BORDER: Soft rounded "inflated" edge with subtle highlight along the top rim. No sharp corners — everything should look soft and squishy.',
    'enamel-pin': 'BORDER: Raised metallic gold or silver outline (2-3px), polished and reflective. The metal border should feel like jewelry.',
    'chrome-badge': 'BORDER: Mirror-like chrome edge with gradient reflections. Embossed beveled rim. Premium automotive finish feel.',
    'die-cut': 'BORDER: Bold black outline (2-3px) around the entire design. Street art aesthetic — the outline should feel hand-drawn and energetic.',
    vintage: 'BORDER: Slightly irregular worn edge with subtle distress marks. Optional thin cream/off-white border (2px) with slight fading.',
  };
  return borders[style] || borders['flat'];
}

function getCompositionInstruction(shape: string, isSheet: boolean): string {
  if (isSheet) {
    return `COMPOSITION: Each individual sticker follows its own shape. Arrange all stickers in a clean grid layout with equal spacing (gap = 20-30px). All stickers must be aligned to a visual grid, not randomly scattered.`;
  }

  const compositions: Record<string, string> = {
    custom: 'COMPOSITION: The design follows its natural silhouette. The border hugs the contour with consistent 2-3mm margin. No forced geometric boundaries.',
    circle: 'COMPOSITION: Design perfectly centered within a circular boundary. The subject should fill 75-85% of the circle diameter. No elements touching the edge.',
    square: 'COMPOSITION: Design fills the square efficiently with 10% padding from edges. Center-weighted composition.',
    rounded: 'COMPOSITION: Design centered with comfortable padding. Rounded corners should feel intentional, not accidental.',
    star: 'COMPOSITION: Subject adapted to fit within star points. The center of the star is the visual focal point. Avoid putting critical details in the sharp points.',
    heart: 'COMPOSITION: Subject centered in the heart shape. The two lobes of the heart should frame the subject symmetrically. Romantic/whimsical energy.',
  };
  return compositions[shape] || compositions['custom'];
}

function getSingleStickerRequirements(): string {
  return `
- Self-contained design with clear focal point
- Readable details at intended physical size
- Professional print-ready quality
- Consistent lighting direction (top-left or top-center)
- Subtle ground shadow ONLY if background is white/colored (not transparent)
- The sticker should look like it could be peeled off and applied to a laptop`;
}

function getSheetRequirements(): string {
  return `
STICKER SHEET LAYOUT (CRITICAL):
- Include exactly 6-12 individual stickers
- Arrange in a clean grid: 2 columns × 3-6 rows OR 3 columns × 2-4 rows
- Equal spacing between all stickers (20-30px gap)
- ALL stickers must share the EXACT same art style and color palette
- Vary subjects within the theme: different poses, expressions, or related items
- Include subtle cut lines (dashed or dotted) between stickers
- Add a small margin (15-20px) around the entire sheet edge
- Each sticker should feel like part of a cohesive collection/set
- Do NOT overlap stickers
- Do NOT make stickers different sizes (uniform size within the sheet)`;
}
