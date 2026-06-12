export interface SkillOption {
  id: string;
  name: string;
  name_zh: string;
  description: string;
  promptModifier: string;
}

// ============================================================
// Logo Types
// ============================================================
export const LOGO_TYPES: SkillOption[] = [
  {
    id: 'wordmark', name: 'Wordmark', name_zh: '文字标识',
    description: 'Brand name as the logo with custom lettering',
    promptModifier: 'Design a WORDMARK logo where the brand name itself IS the logo. Focus on custom lettering with unique letterforms, precise kerning, and strong typographic personality. No icon or symbol — the text alone must carry the entire brand identity. Think Google, Coca-Cola, FedEx. The letterforms should feel ownable and distinctive.'
  },
  {
    id: 'lettermark', name: 'Lettermark', name_zh: '字母标识',
    description: 'Initials or monogram, 1-3 characters',
    promptModifier: 'Design a LETTERMARK / MONOGRAM logo using only 1-3 initials. The letters should be compact, geometric or decoratively treated, and highly readable at small sizes (down to 16px favicon). Think IBM, HBO, CNN. Emphasize clever negative space, interlocking forms, or distinctive geometric construction of the characters.'
  },
  {
    id: 'icon', name: 'Icon / Symbol', name_zh: '图标标识',
    description: 'Standalone pictorial mark, no text',
    promptModifier: 'Design a standalone PICTORIAL MARK / ICON logo with NO text whatsoever. Create a single recognizable symbol or object that must be instantly readable at 16px favicon size. Think Apple logo, Twitter bird, Target bullseye. The symbol should be simple, memorable, and work as a single-color silhouette.'
  },
  {
    id: 'combination', name: 'Combination Mark', name_zh: '组合标识',
    description: 'Icon + wordmark together as a lockup',
    promptModifier: 'Design a COMBINATION MARK logo with both an icon/symbol AND the brand name text arranged as a cohesive lockup. The icon sits to the left of or above the text. Both elements should work independently when separated. Think Adidas, Burger King, Doritos. Ensure clear visual hierarchy between mark and text.'
  },
  {
    id: 'emblem', name: 'Emblem', name_zh: '徽章标识',
    description: 'Text enclosed within a shape (badge, seal, crest)',
    promptModifier: 'Design an EMBLEM logo where text is enclosed within or integrated into a containing shape — badge, seal, crest, or shield. The text and shape form one unified, inseparable composition. Think Starbucks, Harley-Davidson, NFL. The emblem should feel authoritative, established, and work well as a stamp or badge.'
  },
  {
    id: 'mascot', name: 'Mascot', name_zh: '吉祥物',
    description: 'Character-based logo with personality',
    promptModifier: 'Design a MASCOT logo featuring an illustrated character or creature that represents the brand. The character should be friendly, approachable, and have a distinctive personality. Think KFC Colonel, Michelin Man, Mailchimp monkey. The mascot should be expressive, work at various sizes, and feel like a brand ambassador.'
  },
  {
    id: 'abstract', name: 'Abstract Mark', name_zh: '抽象标识',
    description: 'Non-representational geometric form',
    promptModifier: 'Design an ABSTRACT MARK logo — a non-representational geometric form that does not depict any real-world object. Convey brand feeling through pure form, color, and movement. Think Nike swoosh, Pepsi globe, Airbnb symbol. The shape should be unique, ownable, and evoke emotion through its geometry alone.'
  },
];

// ============================================================
// Visual Styles
// ============================================================
export const LOGO_STYLES: SkillOption[] = [
  {
    id: 'flat', name: 'Flat / Minimal', name_zh: '扁平',
    description: 'Clean flat design, solid color fills',
    promptModifier: 'VISUAL STYLE: Clean flat design. No gradients, no shadows, no textures, no 3D effects. Use solid color fills only with uniform stroke weights. Maximum clarity at all reproduction sizes. Modern, digital-native aesthetic with crisp edges and precise geometry.'
  },
  {
    id: 'gradient', name: 'Gradient', name_zh: '渐变',
    description: 'Modern gradient color transitions',
    promptModifier: 'VISUAL STYLE: Modern gradient design. Smooth, vibrant color transitions within shapes creating depth and dimension without 3D modeling. Think Instagram, Firefox logo aesthetic. Use 2-3 color gradient stops, soft blends, and a contemporary tech-forward feel.'
  },
  {
    id: '3d', name: '3D / Dimensional', name_zh: '立体',
    description: 'Three-dimensional with lighting and depth',
    promptModifier: 'VISUAL STYLE: Three-dimensional rendering with realistic lighting, soft shadows, and volumetric depth. Glossy or matte material surfaces. Clear light source direction creating highlights and shadows. The logo should feel like a physical object with weight and presence.'
  },
  {
    id: 'line-art', name: 'Line Art', name_zh: '线条',
    description: 'Outlines only, no fills',
    promptModifier: 'VISUAL STYLE: Pure line art — single-weight or variable-weight outlines only, NO color fills. Clean continuous strokes that work in any single color. Elegant, refined, architectural quality. The design should be equally effective in black on white or white on black.'
  },
  {
    id: 'geometric', name: 'Geometric', name_zh: '几何',
    description: 'Built from precise geometric primitives',
    promptModifier: 'VISUAL STYLE: Geometric construction from precise primitives — circles, triangles, squares, golden ratio spirals. Mathematical precision with grid-based alignment. Clean intersections, perfect tangent points, and visible construction logic. The underlying geometry should feel intentional and harmonious.'
  },
  {
    id: 'hand-drawn', name: 'Hand-Drawn', name_zh: '手绘',
    description: 'Organic, artisanal hand quality',
    promptModifier: 'VISUAL STYLE: Hand-drawn, organic quality with visible human touch. Slightly imperfect strokes, natural texture, variable line weight with slight wobble. Personal, artisanal, craft feel. The logo should look like it was drawn by a skilled illustrator, not generated by software.'
  },
  {
    id: 'vintage', name: 'Vintage / Retro', name_zh: '复古',
    description: 'Aged aesthetic with classic typography',
    promptModifier: 'VISUAL STYLE: Vintage/retro aesthetic with aged textures, distressed edges, halftone dot patterns, and worn patina. Classic typography with decorative serifs or slab serifs. Nostalgic, established, heritage feel. Muted or sepia-shifted color tones. Think old-school badge, letterpress, or engraving quality.'
  },
  {
    id: 'pixel', name: 'Pixel Art', name_zh: '像素',
    description: 'Deliberately pixelated grid-aligned design',
    promptModifier: 'VISUAL STYLE: Pixel art — deliberately pixelated, grid-aligned design with visible square pixels. Limited color palette (8-16 colors max). Retro gaming aesthetic with 8-bit or 16-bit feel. Each pixel is intentionally placed. Clean pixel edges, no anti-aliasing.'
  },
];

// ============================================================
// Color Palettes
// ============================================================
export const LOGO_PALETTES: SkillOption[] = [
  {
    id: 'monochrome', name: 'Monochrome', name_zh: '单色',
    description: 'Single color + black/white only',
    promptModifier: 'COLOR SCHEME: Monochrome — use only pure black #000000 on white background, or a single brand color on white. Maximum versatility across all media. Stark, authoritative, timeless. The logo must work perfectly in single-color reproduction.'
  },
  {
    id: 'dual-tone', name: 'Dual Tone', name_zh: '双色',
    description: 'Primary + one accent color',
    promptModifier: 'COLOR SCHEME: Dual tone — exactly two colors plus white. One primary brand color and one accent color with strong contrast between them. Clean, focused, memorable. The two colors should create clear visual hierarchy.'
  },
  {
    id: 'colorful', name: 'Colorful', name_zh: '多彩',
    description: '3-5 distinct vibrant colors',
    promptModifier: 'COLOR SCHEME: Colorful — use 3-5 distinct, vibrant colors. Each color clearly distinguishable from the others. Playful, inclusive, dynamic energy. Think Google, Slack, NBC peacock. Colors should be balanced and harmonious while remaining diverse.'
  },
  {
    id: 'gradient-colors', name: 'Gradient Colors', name_zh: '渐变色',
    description: 'Smooth transitions between 2-3 colors',
    promptModifier: 'COLOR SCHEME: Gradient colors — smooth transitions between 2-3 vibrant colors. Modern, fluid, digital-native feel. The gradient should create depth and movement. Think Instagram pink-to-orange, Firefox blue-to-yellow.'
  },
  {
    id: 'earth-tones', name: 'Earth Tones', name_zh: '大地色',
    description: 'Warm browns, olive, terracotta',
    promptModifier: 'COLOR SCHEME: Earth tones — warm browns #8B6914, olive greens #6B7B3A, terracotta #C05621, sand #D4A574, forest #2D5016. Natural, organic, grounded, sustainable. Evokes nature, craft, and authenticity.'
  },
  {
    id: 'pastel', name: 'Pastel', name_zh: '柔和色',
    description: 'Soft, desaturated gentle colors',
    promptModifier: 'COLOR SCHEME: Pastel — soft, desaturated colors. Light pink #FFB6C1, mint #98D8C8, lavender #C8A2C8, butter yellow #FFFACD, sky blue #BEE3F8. Gentle, approachable, friendly. The palette should feel calming and inviting.'
  },
  {
    id: 'bold-contrast', name: 'Bold Contrast', name_zh: '高对比',
    description: 'High-saturation with strong contrast',
    promptModifier: 'COLOR SCHEME: Bold contrast — high-saturation primary colors with maximum contrast. Red #EF4444, blue #3B82F6, yellow #FACC15, black #000000. Energetic, attention-grabbing, confident. Colors should pop and demand attention.'
  },
];

// ============================================================
// Industry Context
// ============================================================
export const LOGO_INDUSTRIES: SkillOption[] = [
  {
    id: 'tech', name: 'Tech', name_zh: '科技',
    description: 'Technology, internet, SaaS',
    promptModifier: 'INDUSTRY CONTEXT: Technology / Internet / SaaS. The logo should convey innovation, precision, and forward-thinking. Clean geometric forms, modern typography, digital-native aesthetic. Think Silicon Valley startup or established tech company.'
  },
  {
    id: 'food', name: 'Food & Beverage', name_zh: '餐饮',
    description: 'Restaurant, food, drinks',
    promptModifier: 'INDUSTRY CONTEXT: Food & Beverage / Restaurant. The logo should evoke appetite, warmth, and hospitality. Consider organic shapes, warm colors, and imagery that suggests freshness, quality ingredients, or culinary craft.'
  },
  {
    id: 'fashion', name: 'Fashion', name_zh: '时尚',
    description: 'Clothing, beauty, luxury',
    promptModifier: 'INDUSTRY CONTEXT: Fashion / Beauty / Luxury. The logo should exude elegance, sophistication, and premium quality. Refined typography, generous spacing, and restrained design. Think high-end boutique or luxury brand with timeless appeal.'
  },
  {
    id: 'sports', name: 'Sports', name_zh: '运动',
    description: 'Athletics, fitness, outdoor',
    promptModifier: 'INDUSTRY CONTEXT: Sports / Fitness / Outdoor. The logo should convey energy, movement, strength, and dynamism. Bold forms, angular shapes, and a sense of motion. Think athletic brand with competitive spirit and physical vitality.'
  },
  {
    id: 'education', name: 'Education', name_zh: '教育',
    description: 'School, training, knowledge',
    promptModifier: 'INDUSTRY CONTEXT: Education / Learning / Knowledge. The logo should convey wisdom, growth, trust, and accessibility. Consider book motifs, growth symbols, or enlightenment imagery. Approachable yet authoritative.'
  },
  {
    id: 'health', name: 'Health', name_zh: '健康',
    description: 'Medical, wellness, healthcare',
    promptModifier: 'INDUSTRY CONTEXT: Health / Medical / Wellness. The logo should convey trust, care, cleanliness, and professionalism. Clean lines, calming colors, and symbols of health or protection. Must feel reliable and reassuring.'
  },
  {
    id: 'finance', name: 'Finance', name_zh: '金融',
    description: 'Banking, investment, insurance',
    promptModifier: 'INDUSTRY CONTEXT: Finance / Banking / Investment. The logo should convey stability, trust, security, and professionalism. Strong geometric forms, balanced composition, and conservative elegance. Must feel established and dependable.'
  },
  {
    id: 'creative', name: 'Creative', name_zh: '创意',
    description: 'Design, art, film, music',
    promptModifier: 'INDUSTRY CONTEXT: Creative / Design / Art / Entertainment. The logo should convey creativity, originality, and artistic flair. Unexpected forms, playful elements, or expressive typography. Think design studio or creative agency with bold taste.'
  },
  {
    id: 'eco', name: 'Eco / Green', name_zh: '环保',
    description: 'Sustainability, nature, organic',
    promptModifier: 'INDUSTRY CONTEXT: Eco / Sustainability / Nature. The logo should convey environmental consciousness, natural harmony, and organic growth. Leaf motifs, earth tones, flowing organic shapes. Think sustainable brand with genuine environmental commitment.'
  },
  {
    id: 'general', name: 'General', name_zh: '通用',
    description: 'No specific industry context',
    promptModifier: 'INDUSTRY CONTEXT: General purpose — no specific industry constraints. Focus on creating a versatile, memorable mark that works across contexts. Prioritize clarity, balance, and timeless design principles.'
  },
];

// ============================================================
// Mood / Personality
// ============================================================
export const LOGO_MOODS: SkillOption[] = [
  {
    id: 'playful', name: 'Playful', name_zh: '活泼',
    description: 'Fun, youthful, approachable',
    promptModifier: 'MOOD: Playful — fun, youthful, and approachable. Rounded forms, bouncy proportions, and a sense of joy. The logo should make people smile and feel welcome. Avoid anything stiff or corporate.'
  },
  {
    id: 'professional', name: 'Professional', name_zh: '专业',
    description: 'Reliable, trustworthy, established',
    promptModifier: 'MOOD: Professional — reliable, trustworthy, and established. Clean proportions, balanced composition, and restrained design choices. The logo should inspire confidence and convey competence without being cold or impersonal.'
  },
  {
    id: 'elegant', name: 'Elegant', name_zh: '优雅',
    description: 'Refined, sophisticated, premium',
    promptModifier: 'MOOD: Elegant — refined, sophisticated, and premium. Thin strokes, generous whitespace, and luxurious proportions. The logo should feel like it belongs on high-end packaging or a premium brand. Understated rather than loud.'
  },
  {
    id: 'bold', name: 'Bold', name_zh: '大胆',
    description: 'Strong, impactful, attention-grabbing',
    promptModifier: 'MOOD: Bold — strong, impactful, and attention-grabbing. Heavy weights, sharp angles, and commanding presence. The logo should dominate its space and make a strong first impression. Confident and unapologetic.'
  },
  {
    id: 'minimal', name: 'Minimal', name_zh: '极简',
    description: 'Restrained, essential, clean',
    promptModifier: 'MOOD: Minimal — restrained to the absolute essentials. Maximum whitespace, fewest possible elements, and ruthless simplicity. Every line and shape must earn its place. The logo should feel effortless and inevitable.'
  },
  {
    id: 'friendly', name: 'Friendly', name_zh: '友好',
    description: 'Warm, welcoming, approachable',
    promptModifier: 'MOOD: Friendly — warm, welcoming, and approachable. Soft edges, open forms, and inviting proportions. The logo should feel like a warm handshake — genuine, comfortable, and trustworthy without being overly casual.'
  },
];
