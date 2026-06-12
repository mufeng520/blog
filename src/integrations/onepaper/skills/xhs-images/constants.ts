export interface SkillOption {
  id: string;
  name: string;
  name_zh: string;
  description: string;
  promptModifier: string;
}

export const XHS_STYLES: SkillOption[] = [
  {
    id: 'bold',
    name: 'Bold',
    name_zh: '大胆',
    description: 'High impact, attention-grabbing aesthetic.',
    promptModifier:
      'Element Combination: Canvas ratio portrait-3-4, grid single or dual; Image effects: cutout clean, stroke colored-solid or double, filter high-saturation; Typography: decorated shadow-3d or stroke-text, tags black-white or ribbon, direction horizontal or diagonal; Decorations: emphasis exclamation or star-burst or red-arrow, background solid-saturated or gradient-linear, doodles arrows-curvy or squiggles, frames none. Color Palette: Primary Vibrant red, orange, yellow (#E53E3E, #DD6B20, #F6E05E); Background Deep black, dark charcoal (#000000, #1A1A1A); Accents White, neon yellow (#FFFFFF, #F7FF00). Visual Elements: Exclamation marks, arrows, warning icons; Strong shapes, high contrast elements; Dramatic compositions; Bold geometric forms. Typography: Bold, impactful hand lettering with shadows; High contrast text treatments; Large, commanding headlines. Best Layout Pairings: sparse (Impactful statements), list (Must-know lists, rankings), comparison (Dramatic contrasts). Best For: Important tips and warnings; Must-know content; Critical announcements; Rankings and comparisons; Attention-grabbing hooks.',
  },
  {
    id: 'chalkboard',
    name: 'Chalkboard',
    name_zh: '黑板风',
    description: 'Black chalkboard background with colorful chalk drawing aesthetic.',
    promptModifier:
      'Element Combination: Canvas ratio portrait-3-4, grid single or dual or triptych; Image effects: cutout stylized, stroke none, filter none; Typography: decorated handwritten, tags none, direction horizontal or vertical; Decorations: emphasis underline or circle-mark or arrows-curvy, background chalkboard, doodles hand-drawn-lines or stars-sparkles, frames none. Color Palette: Background Chalkboard black, green-black (#1A1A1A, #1C2B1C); Primary Text Chalk white (#F5F5F5); Accent 1 Chalk yellow (#FFE566); Accent 2 Chalk pink (#FF9999); Accent 3 Chalk blue (#66B3FF); Accent 4 Chalk green (#90EE90); Accent 5 Chalk orange (#FFB366). Visual Elements: Hand-drawn chalk illustrations with sketchy, imperfect lines; Chalk dust effects around text and key elements; Doodles: stars, arrows, underlines, circles, checkmarks; Mathematical formulas and simple diagrams; Eraser smudges and chalk residue textures; Stick figures and simple icons; Connection lines with hand-drawn feel. Typography: Hand-drawn chalk lettering style; Visible chalk texture on all text; Imperfect baseline adds authenticity; White or bright colored chalk for emphasis. Style Rules - Do: Maintain authentic chalk texture on all elements; Use imperfect, hand-drawn quality throughout; Add subtle chalk dust and smudge effects; Create visual hierarchy with color variety; Include playful doodles and annotations. Style Rules - Don\'t: Use perfect geometric shapes; Create clean digital-looking lines; Add photorealistic elements; Use gradients or glossy effects. Best Layout Pairings: sparse (Educational covers), balanced (Standard lessons), dense (Detailed tutorials), list (Learning checklists), flow (Process explanations). Best For: Educational content; Tutorials and how-to\'s; Classroom themes; Teaching materials; Workshops; Informal learning sessions; Knowledge sharing.',
  },
  {
    id: 'cute',
    name: 'Cute',
    name_zh: '可爱风',
    description: 'Sweet, adorable, girly - classic Xiaohongshu aesthetic.',
    promptModifier:
      'Element Combination: Canvas ratio portrait-3-4, grid single or dual or quad; Image effects: cutout soft, stroke white-solid or colored-solid, filter clear-glow or cream-skin; Typography: decorated bubble or highlight, tags pill or bubble, direction horizontal; Decorations: emphasis star-burst or hearts, background solid-pastel or gradient-linear, doodles hearts or stars-sparkles or flowers, frames polaroid or tape-corners. Color Palette: Primary Pink, peach, mint, lavender (#FED7E2, #FEEBC8, #C6F6D5, #E9D8FD); Background Cream, soft pink (#FFFAF0, #FFF5F7); Accents Hot pink, coral (#FF69B4, #FF6B6B). Visual Elements: Hearts, stars, sparkles, cute faces; Ribbon decorations, sticker-style; Cute stickers, emoji icons; Soft, rounded shapes. Typography: Rounded, bubbly hand lettering; Soft shadows, playful decorations; Pink/pastel color accents on text. Best Layout Pairings: sparse (Covers, emotional impact), balanced (Standard cute content), list (Checklists, cute rankings), comparison (Before/after transformations). Best For: Lifestyle content; Beauty and skincare; Fashion and style; Daily tips and hacks; Personal shares.',
  },
  {
    id: 'fresh',
    name: 'Fresh',
    name_zh: '清新',
    description: 'Clean, refreshing, natural aesthetic.',
    promptModifier:
      'Element Combination: Canvas ratio portrait-3-4, grid single or triptych; Image effects: cutout soft, stroke white-solid or none, filter clear-glow or cool-tone; Typography: decorated none or highlight, tags pill or white-black, direction horizontal; Decorations: emphasis checkmark or circle-mark, background solid-white or solid-pastel, doodles leaves or clouds or bubbles, frames rounded-rect or none. Color Palette: Primary Mint green, sky blue, light yellow (#9AE6B4, #90CDF4, #FAF089); Background Pure white, soft mint (#FFFFFF, #F0FFF4); Accents Leaf green, water blue (#48BB78, #4299E1). Visual Elements: Plant leaves, clouds, water drops; Simple geometric shapes; Breathing room, open composition; Natural, organic elements. Typography: Clean, light hand lettering with breathing room; Airy spacing; Fresh color accents. Best Layout Pairings: sparse (Clean covers), balanced (Standard fresh content), flow (Organic processes). Best For: Health and wellness; Minimalist lifestyle; Self-care content; Nature-related topics; Clean living tips.',
  },
  {
    id: 'minimal',
    name: 'Minimal',
    name_zh: '极简',
    description: 'Ultra-clean, sophisticated aesthetic.',
    promptModifier:
      'Element Combination: Canvas ratio portrait-3-4, grid single; Image effects: cutout clean, stroke none or white-solid, filter none or muted-tones; Typography: decorated none, tags white-black or pill, direction horizontal; Decorations: emphasis underline or circle-mark, background solid-white or solid-pastel, doodles hand-drawn-lines, frames none or rounded-rect. Color Palette: Primary Black, white (#000000, #FFFFFF); Background Off-white, pure white (#FAFAFA, #FFFFFF); Accents Single color (content-derived) Blue, green, or coral. Visual Elements: Single focal point, thin lines; Maximum whitespace; Simple, clean decorations; Restrained visual elements. Typography: Clean, simple hand lettering; Minimal weight variations; Elegant spacing. Best Layout Pairings: sparse (Elegant statements), balanced (Professional content), dense (Clean knowledge cards). Best For: Professional content; Serious topics; Elegant presentations; High-end products; Business content.',
  },
  {
    id: 'notion',
    name: 'Notion',
    name_zh: 'Notion风',
    description: 'Minimalist hand-drawn line art, intellectual aesthetic.',
    promptModifier:
      'Element Combination: Canvas ratio portrait-3-4, grid single or dual; Image effects: cutout clean, stroke none or white-solid, filter none or muted-tones; Typography: decorated none or handwritten, tags black-white or pill, direction horizontal; Decorations: emphasis circle-mark or underline, background solid-white or paper-texture, doodles hand-drawn-lines or arrows-curvy, frames none or rounded-rect. Color Palette: Primary Black, dark gray (#1A1A1A, #4A4A4A); Background Pure white, off-white (#FFFFFF, #FAFAFA); Accents Pastel blue, pastel yellow, pastel pink (#A8D4F0, #F9E79F, #FADBD8). Visual Elements: Simple line doodles, hand-drawn wobble effect; Geometric shapes, stick figures; Maximum whitespace, single-weight ink lines; Clean, uncluttered compositions. Typography: Clean hand-drawn lettering; Simple sans-serif labels; Minimal decoration on text. Best Layout Pairings: sparse (Concept covers), balanced (Standard explanations), dense (Knowledge cards, cheat sheets), list (Productivity tips, tool lists), comparison (Data comparisons), flow (Process diagrams). Best For: Knowledge sharing; Concept explanations; SaaS content; Productivity tips; Tech tutorials; Professional content.',
  },
  {
    id: 'pop',
    name: 'Pop',
    name_zh: '波普',
    description: 'Vibrant, energetic, eye-catching aesthetic.',
    promptModifier:
      'Element Combination: Canvas ratio portrait-3-4, grid single or quad; Image effects: cutout stylized, stroke colored-solid or double, filter high-saturation; Typography: decorated stroke-text or shadow-3d, tags bubble or ribbon, direction horizontal or curved; Decorations: emphasis star-burst or exclamation, background solid-saturated or dots, doodles stars-sparkles or confetti or squiggles, frames none. Color Palette: Primary Bright red, yellow, blue, green (#F56565, #ECC94B, #4299E1, #48BB78); Background White, light gray (#FFFFFF, #F7FAFC); Accents Neon pink, electric purple (#FF69B4, #9F7AEA). Visual Elements: Bold shapes, speech bubbles; Comic-style effects, starburst; Dynamic, energetic compositions; High-energy decorations. Typography: Dynamic, energetic hand lettering with outlines; Bold color combinations; Playful, expressive forms. Best Layout Pairings: sparse (Exciting announcements), balanced (Fun tutorials), list (Fun facts lists), comparison (Dynamic comparisons). Best For: Exciting announcements; Fun facts; Engaging tutorials; Entertainment content; Youth-oriented content.',
  },
  {
    id: 'retro',
    name: 'Retro',
    name_zh: '复古',
    description: 'Vintage, nostalgic, trendy aesthetic.',
    promptModifier:
      'Element Combination: Canvas ratio portrait-3-4, grid single or dual; Image effects: cutout stylized, stroke dashed or double, filter film-grain or muted-tones; Typography: decorated brush or handwritten, tags stamp or ribbon, direction horizontal; Decorations: emphasis star-burst or numbering, background paper-texture or dots, doodles stars-sparkles or squiggles, frames polaroid or film-strip or stamp-border. Color Palette: Primary Muted orange, dusty pink, faded teal (#E07A4D, #D4A5A5, #6B9999); Background Aged paper, sepia tones (#F5E6D3, #E8DCC8); Accents Faded red, vintage gold (#C55A5A, #B8860B). Visual Elements: Halftone dots, vintage badges; Classic icons, tape effects; Aged texture overlays; Nostalgic decorative elements. Typography: Vintage-style hand lettering; Classic feel with imperfections; Aged texture on text. Best Layout Pairings: sparse (Vintage covers), balanced (Classic content), list (Classic rankings), comparison (Then vs now), flow (Historical timelines). Best For: Throwback content; Classic tips; Timeless advice; Vintage aesthetics; Nostalgic shares.',
  },
  {
    id: 'study-notes',
    name: 'Study Notes',
    name_zh: '学霸笔记',
    description: 'Realistic handwritten photo aesthetic - student notes style, dense and messy but readable.',
    promptModifier:
      'Element Combination: Canvas ratio portrait-3-4, grid single; Image effects: cutout none, stroke none, filter natural-photo; Typography: decorated none, tags none, direction horizontal; Decorations: emphasis circle-mark or underline or checkmark or cross or star-simple, background lined-paper-white, doodles arrows-simple or margin-notes or corrections or explanatory-diagrams, frames none. Color Palette (Three-Color Annotation System): Primary Blue ballpoint, Black ink (#1E3A5F, #1A1A1A); Highlights Yellow highlighter (#FFFF00 50% opacity); Accents Red pen (circles, underlines) (#CC0000); Background White lined paper (#FFFFFF). Visual Elements: Realistic photo perspective: top-down view of study desk; Hand holding blue ballpoint pen, actively underlining; Extremely dense handwritten content, filling entire page; Red pen annotations: circles, underlines, stars, boxes; Yellow highlighter marking key terms; Correction marks, cramped notes squeezed into margins; Simple hand-drawn symbols: arrow, star, checkmark, cross, exclamation; Varying pen pressure creating lighter and darker strokes. Typography: Authentic student handwriting; Messy but readable, clear structure maintained; Varying font sizes (large titles, small body, tiny margin notes); CJK optimized. Content Structure - Top Section: Core topic (circled multiple times in red); First section title + 3-4 key points; Arrow connections, red underlines. Middle Section: Second section title (red pen box); Numbered steps 1-2-3; Specific methods and supplementary notes. Bottom Section: Third section title (red star); Time points / key metrics; Key quotes / core tips (tiny corner notes). Best Layout Pairings: dense (Best fit - knowledge notes, summaries), list (Step checklists, rankings), mindmap (Mind map notes), flow (Process flows), quadrant (Quadrant analysis). Best For: Study guides, exam notes; Knowledge organization, framework summaries; Tutorial summaries, quick notes; "Top student notes" style content; Knowledge sharing requiring authentic feel. Style Rules - DO: Keep content extremely dense; Use simple symbols (arrow, star, checkmark, cross, exclamation); Annotate key points with red pen; Include correction marks; Squeeze tiny notes into margins. Style Rules - DON\'T: Use complex emojis; Leave too much whitespace; Make neat, tidy layouts; Add colorful decorations; Include cartoon elements.',
  },
  {
    id: 'warm',
    name: 'Warm',
    name_zh: '温暖',
    description: 'Cozy, friendly, approachable aesthetic.',
    promptModifier:
      'Element Combination: Canvas ratio portrait-3-4, grid single or dual; Image effects: cutout soft, stroke white-solid or glow, filter warm-tone or cream-skin; Typography: decorated highlight or handwritten, tags ribbon or bubble, direction horizontal; Decorations: emphasis star-burst or hearts, background solid-pastel or gradient-radial, doodles clouds or stars-sparkles, frames polaroid or tape-corners. Color Palette: Primary Warm orange, golden yellow, terracotta (#ED8936, #F6AD55, #C05621); Background Cream, soft peach (#FFFAF0, #FED7AA); Accents Deep brown, soft red (#744210, #E57373). Visual Elements: Sun rays, coffee cups, cozy items; Warm lighting effects; Friendly, inviting decorations; Soft, comfortable shapes. Typography: Friendly, rounded hand lettering; Warm color accents; Comfortable, approachable feel. Best Layout Pairings: sparse (Emotional covers), balanced (Personal stories), comparison (Before/after stories). Best For: Personal stories; Life lessons; Emotional content; Comfort and lifestyle; Heartfelt shares.',
  },
];

export const XHS_LAYOUTS: SkillOption[] = [
  {
    id: 'sparse',
    name: 'Sparse',
    name_zh: '稀疏',
    description: 'Minimal information, maximum impact (1-2 points).',
    promptModifier:
      'Sparse Layout: Info Density Low, Whitespace 60-70%, Points/Image 1-2. Best For: Covers, quotes, impactful statements. Visual Balance: Single focal point centered; Breathing room on all sides; Symmetrical composition.',
  },
  {
    id: 'balanced',
    name: 'Balanced',
    name_zh: '平衡',
    description: 'Standard content layout (3-4 points).',
    promptModifier:
      'Balanced Layout: Info Density Medium, Whitespace 40-50%, Points/Image 3-4. Best For: Standard content, tutorials. Visual Balance: Top-weighted title; Evenly distributed content below; Clear visual hierarchy.',
  },
  {
    id: 'dense',
    name: 'Dense',
    name_zh: '密集',
    description: 'High information density, knowledge card style (5-8 points).',
    promptModifier:
      'Dense Layout: Info Density High, Whitespace 20-30%, Points/Image 5-8. Best For: Knowledge cards, cheat sheets. Visual Balance: Organized grid structure; Clear section boundaries; Compact but readable spacing.',
  },
  {
    id: 'list',
    name: 'List',
    name_zh: '列表',
    description: 'Enumeration and ranking format (4-7 items).',
    promptModifier:
      'List Layout: Structure Vertical enumeration, Items 4-7. Best For: Rankings, checklists, step guides. Visual Balance: Left-aligned items; Clear number/bullet hierarchy; Consistent item format.',
  },
  {
    id: 'comparison',
    name: 'Comparison',
    name_zh: '对比',
    description: 'Side-by-side contrast layout.',
    promptModifier:
      'Comparison Layout: Structure Left vs Right, Items 2 sections. Best For: Before/after, pros/cons. Visual Balance: Symmetrical left/right; Clear visual contrast; Divider between sections.',
  },
  {
    id: 'flow',
    name: 'Flow',
    name_zh: '流程',
    description: 'Process and timeline layout (3-6 steps).',
    promptModifier:
      'Flow Layout: Structure Connected nodes, Items 3-6 steps. Best For: Processes, timelines, workflows. Visual Balance: Directional flow (top to bottom or left to right); Connected nodes with arrows; Clear progression indicators.',
  },
  {
    id: 'mindmap',
    name: 'Mindmap',
    name_zh: '思维导图',
    description: 'Center radial mind map layout (4-8 branches).',
    promptModifier:
      'Mindmap Layout: Structure Center radial, Items 4-8 branches. Best For: Concept maps, brainstorming, topic overview. Visual Balance: Central topic node; Radial branches outward; Hierarchical sub-branches; Organic curved connections.',
  },
  {
    id: 'quadrant',
    name: 'Quadrant',
    name_zh: '四象限',
    description: 'Four-quadrant / circular section layout.',
    promptModifier:
      'Quadrant Layout: Structure 4-section grid, Items 4 sections. Best For: SWOT analysis, priority matrix, classification. Visual Balance: 4-section grid (2x2); Clear axis labels; Each quadrant with distinct content; Optional circular variant for cycles.',
  },
];

export const XHS_STRATEGIES: SkillOption[] = [
  {
    id: 'story-driven',
    name: 'Story-Driven',
    name_zh: '故事驱动型',
    description: 'Personal experience as main thread, emotional resonance first.',
    promptModifier:
      'Strategy A: Story-Driven. Concept: Personal experience as main thread, emotional resonance first. Features: Start from pain point, show before/after change, strong authenticity. Best for: Reviews, personal shares, transformation stories. Structure: Hook → Problem → Discovery → Experience → Conclusion.',
  },
  {
    id: 'info-dense',
    name: 'Information-Dense',
    name_zh: '信息密集型',
    description: 'Value-first, efficient information delivery.',
    promptModifier:
      'Strategy B: Information-Dense. Concept: Value-first, efficient information delivery. Features: Clear structure, explicit points, professional credibility. Best for: Tutorials, comparisons, product reviews, checklists. Structure: Core conclusion → Info card → Pros/Cons → Recommendation.',
  },
  {
    id: 'visual-first',
    name: 'Visual-First',
    name_zh: '视觉优先型',
    description: 'Visual impact as core, minimal text.',
    promptModifier:
      'Strategy C: Visual-First. Concept: Visual impact as core, minimal text. Features: Large images, atmospheric, instant appeal. Best for: High-aesthetic products, lifestyle, mood-based content. Structure: Hero image → Detail shots → Lifestyle scene → CTA.',
  },
];
