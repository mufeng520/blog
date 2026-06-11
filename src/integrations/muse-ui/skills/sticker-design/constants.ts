export interface SkillOption {
  id: string;
  name: string;
  name_zh: string;
  description: string;
  promptModifier: string;
}

// --- Sticker Style ---
export type StickerStyle = 'flat' | 'chibi' | 'puffy-3d' | 'enamel-pin' | 'chrome-badge' | 'die-cut' | 'vintage';

export const STICKER_STYLES: SkillOption[] = [
  {
    id: 'flat',
    name: 'Flat Illustration',
    name_zh: '扁平插画',
    description: 'Minimalist flat design with thick white borders, clean vector-like aesthetic. Best for modern branding, app icons, and clean visual communication.',
    promptModifier:
      'Style: Minimalist flat illustration with thick white die-cut borders (3-5px), clean vector-like aesthetic, solid color fills with no gradients, simple geometric shapes, modern and approachable. The sticker should have a distinct thick white outline separating it from the background.',
  },
  {
    id: 'chibi',
    name: 'Chibi / Kawaii',
    name_zh: 'Q版萌系',
    description: 'Cute chibi characters with oversized heads, big expressive eyes, and adorable proportions. Best for character merchandise, fan art, and cute branding.',
    promptModifier:
      'Style: Chibi / Kawaii aesthetic with oversized head (1:2 head-to-body ratio), large expressive sparkling eyes, tiny nose and mouth, rounded soft features, pastel or vibrant color palette, cute and approachable character design. Include blush marks and small star/sparkle decorations.',
  },
  {
    id: 'puffy-3d',
    name: 'Puffy 3D',
    name_zh: '立体膨胀',
    description: 'Three-dimensional puffy stickers with soft inflated appearance, glossy highlights, and tactile plastic feel. Best for premium sticker sheets and collectible designs.',
    promptModifier:
      'Style: 3D puffy sticker with soft inflated appearance, glossy epoxy dome highlights, rounded edges with soft shadows underneath, tactile plastic/resin feel, subtle inner glow, premium collectible quality. The design should look like it has physical depth and dimension.',
  },
  {
    id: 'enamel-pin',
    name: 'Enamel Pin',
    name_zh: '珐琅别针',
    description: 'Hard enamel pin style with metallic outlines, glossy filled colors, and jewelry-like finish. Best for premium merchandise and fashion accessories.',
    promptModifier:
      'Style: Hard enamel pin aesthetic with raised metallic gold/silver outlines, glossy smooth color fills, jewelry-like polished finish, small clutch back visible, collectible pin design. Colors should be vibrant and separated by clean metal lines.',
  },
  {
    id: 'chrome-badge',
    name: 'Chrome Badge',
    name_zh: '镀铬徽章',
    description: 'Futuristic chrome metallic badge with mirror-like reflections, embossed details, and premium automotive finish. Best for tech branding and futuristic designs.',
    promptModifier:
      'Style: Chrome metallic badge with mirror-like reflective surface, embossed 3D details, futuristic automotive finish, soft gradient reflections, premium quality feel, attached to a vertical product card with Euro slot punch hole at top.',
  },
  {
    id: 'die-cut',
    name: 'Die-Cut Vinyl',
    name_zh: '模切 vinyl',
    description: 'Classic die-cut vinyl sticker with bold outlines, street art influence, and graffiti-like energy. Best for outdoor branding, laptop stickers, and urban culture.',
    promptModifier:
      'Style: Classic die-cut vinyl sticker with bold black outlines (2-3px), street art and graffiti influence, vibrant saturated colors, slightly weathered texture, urban culture aesthetic, sticker peel effect visible at one corner.',
  },
  {
    id: 'vintage',
    name: 'Vintage Retro',
    name_zh: '复古怀旧',
    description: 'Nostalgic vintage sticker with distressed textures, retro color palettes, and aged paper feel. Best for retro branding, travel souvenirs, and nostalgic collections.',
    promptModifier:
      'Style: Vintage retro sticker with distressed worn edges, faded retro color palette (mustard, teal, burnt orange), subtle paper texture, halftone dot patterns, aged and nostalgic feel, like a well-loved travel souvenir from the 1970s-80s.',
  },
];

// --- Sticker Shape ---
export type StickerShape = 'custom' | 'circle' | 'square' | 'rounded' | 'star' | 'heart';

export const STICKER_SHAPES: SkillOption[] = [
  {
    id: 'custom',
    name: 'Custom Shape',
    name_zh: '自定义形状',
    description: 'Follows the natural contour of the design element.',
    promptModifier: 'Shape: Die-cut following the natural contour of the design element with 2-3mm white border margin.',
  },
  {
    id: 'circle',
    name: 'Circle',
    name_zh: '圆形',
    description: 'Perfect circular sticker format.',
    promptModifier: 'Shape: Perfect circle format, design centered within circular boundary, content may extend slightly beyond for dynamic effect.',
  },
  {
    id: 'square',
    name: 'Square',
    name_zh: '方形',
    description: 'Clean square sticker with sharp corners.',
    promptModifier: 'Shape: Clean square format with sharp corners, design fills the square area efficiently.',
  },
  {
    id: 'rounded',
    name: 'Rounded Rectangle',
    name_zh: '圆角矩形',
    description: 'Soft rounded corners for friendly appearance.',
    promptModifier: 'Shape: Rounded rectangle with 8-12px corner radius, friendly and modern appearance.',
  },
  {
    id: 'star',
    name: 'Star',
    name_zh: '星形',
    description: 'Star-shaped sticker for special highlights.',
    promptModifier: 'Shape: Star-shaped format, design adapted to fit within star boundaries, eye-catching and special.',
  },
  {
    id: 'heart',
    name: 'Heart',
    name_zh: '心形',
    description: 'Heart-shaped sticker for love and affection themes.',
    promptModifier: 'Shape: Heart-shaped format, design centered within heart boundaries, romantic and affectionate.',
  },
];

// --- Sticker Theme ---
export type StickerTheme = 'character' | 'emoji' | 'text-quote' | 'object' | 'animal' | 'food' | 'nature';

export const STICKER_THEMES: SkillOption[] = [
  {
    id: 'character',
    name: 'Character',
    name_zh: '角色',
    description: 'A specific character or persona as the sticker subject.',
    promptModifier: 'Theme: Character-focused design. The sticker features a distinct character with personality, expression, and recognizable features.',
  },
  {
    id: 'emoji',
    name: 'Emoji / Expression',
    name_zh: '表情符号',
    description: 'Emotional expressions, reactions, and mood indicators.',
    promptModifier: 'Theme: Emoji/expression design. Focus on conveying a specific emotion or reaction through facial expression and body language. Multiple expressions in a set.',
  },
  {
    id: 'text-quote',
    name: 'Text / Quote',
    name_zh: '文字语录',
    description: 'Typography-based sticker with quotes, slogans, or words.',
    promptModifier: 'Theme: Typography-focused design. Bold text, quotes, slogans, or words as the primary visual element with decorative supporting graphics.',
  },
  {
    id: 'object',
    name: 'Object / Item',
    name_zh: '物品物件',
    description: 'Everyday objects, tools, or items as sticker subjects.',
    promptModifier: 'Theme: Object/item design. A specific everyday object, tool, or item rendered in an appealing and stylized way.',
  },
  {
    id: 'animal',
    name: 'Animal',
    name_zh: '动物',
    description: 'Cute or stylized animals as sticker subjects.',
    promptModifier: 'Theme: Animal design. A cute, stylized, or anthropomorphized animal as the main subject.',
  },
  {
    id: 'food',
    name: 'Food',
    name_zh: '食物',
    description: 'Appetizing food illustrations and cute food characters.',
    promptModifier: 'Theme: Food design. Appetizing food illustration or cute food character (kawaii food with faces).',
  },
  {
    id: 'nature',
    name: 'Nature',
    name_zh: '自然',
    description: 'Plants, flowers, celestial elements, and natural motifs.',
    promptModifier: 'Theme: Nature design. Plants, flowers, celestial elements (moon, stars, clouds), or other natural motifs.',
  },
];

// --- Sticker Size ---
export type StickerSize = 'small' | 'medium' | 'large' | 'sheet';

export const STICKER_SIZES: SkillOption[] = [
  {
    id: 'small',
    name: 'Small (1-2 inches)',
    name_zh: '小型 (2.5-5cm)',
    description: 'Compact size for subtle placement, phone cases, notebooks.',
    promptModifier: 'Size: Small sticker (1-2 inches / 2.5-5cm). Compact design with clear readability at small scale, minimal fine details.',
  },
  {
    id: 'medium',
    name: 'Medium (2-3 inches)',
    name_zh: '中型 (5-7.5cm)',
    description: 'Standard size for laptops, water bottles, and general use.',
    promptModifier: 'Size: Medium sticker (2-3 inches / 5-7.5cm). Standard size with balanced detail level, suitable for most applications.',
  },
  {
    id: 'large',
    name: 'Large (3-4 inches)',
    name_zh: '大型 (7.5-10cm)',
    description: 'Statement size for prominent display on vehicles, walls, etc.',
    promptModifier: 'Size: Large sticker (3-4 inches / 7.5-10cm). Statement size with rich details, suitable for prominent display.',
  },
  {
    id: 'sheet',
    name: 'Sticker Sheet',
    name_zh: '贴纸集合',
    description: 'Multiple related stickers arranged on a single sheet.',
    promptModifier: 'Format: Sticker sheet with multiple related stickers arranged aesthetically on a single page. Include 6-12 individual stickers with consistent style, varying poses/expressions/items. Include cut lines between stickers.',
  },
];

// --- Background Type ---
export type StickerBackground = 'transparent' | 'white' | 'colored' | 'pattern';

export const STICKER_BACKGROUNDS: SkillOption[] = [
  {
    id: 'transparent',
    name: 'Transparent',
    name_zh: '透明背景',
    description: 'Clean transparent background for versatile use.',
    promptModifier: 'Background: Transparent (PNG-style), sticker isolated on transparent background with no backdrop elements.',
  },
  {
    id: 'white',
    name: 'White',
    name_zh: '白色背景',
    description: 'Clean white background for product photography look.',
    promptModifier: 'Background: Clean solid white background, product photography style, soft shadow underneath the sticker.',
  },
  {
    id: 'colored',
    name: 'Colored',
    name_zh: '彩色背景',
    description: 'Solid colored background matching the design palette.',
    promptModifier: 'Background: Solid colored background that complements the sticker color palette, harmonious and intentional color choice.',
  },
  {
    id: 'pattern',
    name: 'Patterned',
    name_zh: '图案背景',
    description: 'Decorative pattern background for presentation.',
    promptModifier: 'Background: Decorative pattern background (dots, stripes, or subtle geometric pattern) for presentation purposes, not part of the sticker itself.',
  },
];
