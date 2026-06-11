export interface SkillOption {
  id: string;
  name: string;
  name_zh: string;
  description: string;
  promptModifier: string;
}

export const COVER_TYPES: SkillOption[] = [
  {
    id: 'hero',
    name: 'Hero',
    name_zh: '主视觉',
    description: 'Large visual impact, title overlay. Best for product launch, brand promotion, major announcements.',
    promptModifier:
      'Large focal visual (60-70% area), title overlay on visual, dramatic composition.',
  },
  {
    id: 'conceptual',
    name: 'Conceptual',
    name_zh: '概念化',
    description: 'Concept visualization, abstract core ideas. Best for technical articles, methodology, architecture design.',
    promptModifier:
      'Abstract shapes representing core concepts, information hierarchy, clean zones.',
  },
  {
    id: 'typography',
    name: 'Typography',
    name_zh: '排版主导',
    description: 'Text-focused layout, prominent title. Best for opinion pieces, quotes, insights.',
    promptModifier:
      'Title as primary element (40%+ area), minimal supporting visuals, strong hierarchy.',
  },
  {
    id: 'metaphor',
    name: 'Metaphor',
    name_zh: '隐喻',
    description: 'Visual metaphor, concrete expressing abstract. Best for philosophy, growth, personal development.',
    promptModifier:
      'Concrete object/scene representing abstract idea, symbolic elements, emotional resonance.',
  },
  {
    id: 'scene',
    name: 'Scene',
    name_zh: '场景',
    description: 'Atmospheric scene, narrative feel. Best for stories, travel, lifestyle.',
    promptModifier:
      'Atmospheric environment, narrative elements, mood-setting lighting and colors.',
  },
  {
    id: 'minimal',
    name: 'Minimal',
    name_zh: '极简',
    description: 'Minimalist composition, generous whitespace. Best for zen, focus, core concepts.',
    promptModifier:
      'Single focal element, generous whitespace (60%+), essential shapes only.',
  },
];

export const COVER_PALETTES: SkillOption[] = [
  {
    id: 'warm',
    name: 'Warm',
    name_zh: '暖色',
    description: 'Friendly, approachable, human-centered.',
    promptModifier:
      'Color Palette: Primary 1 Warm Orange #ED8936, Primary 2 Golden Yellow #F6AD55, Primary 3 Terracotta #C05621, Background Cream #FFFAF0, Background Alt Soft Peach #FED7AA, Accent 1 Deep Brown #744210, Accent 2 Soft Red #E53E3E. Decorative Hints: Sun rays, warm lighting effects; Rounded shapes, organic curves; Hearts, smiling faces, friendly icons; Warm gradient overlays. Best For: Personal growth, lifestyle, education, human stories, emotion, community.',
  },
  {
    id: 'elegant',
    name: 'Elegant',
    name_zh: '优雅',
    description: 'Sophisticated, refined, understated luxury.',
    promptModifier:
      'Color Palette: Primary 1 Soft Coral #E8A598, Primary 2 Muted Teal #5B8A8A, Primary 3 Dusty Rose #D4A5A5, Background Warm Cream #F5F0E6, Background Alt Soft Beige #F0EBE0, Accent 1 Gold #C9A962, Accent 2 Copper #B87333. Decorative Hints: Delicate ornamental details; Subtle gradients and soft transitions; Refined geometric patterns; Balanced, symmetrical compositions. Best For: Business, professional, thought leadership, luxury, corporate communications.',
  },
  {
    id: 'cool',
    name: 'Cool',
    name_zh: '冷色',
    description: 'Technical, professional, precise.',
    promptModifier:
      'Color Palette: Primary 1 Engineering Blue #2563EB, Primary 2 Navy Blue #1E3A5F, Primary 3 Cyan #06B6D4, Background Light Gray #F8F9FA, Background Alt Blueprint Off-White #FAF8F5, Accent 1 Amber #F59E0B, Accent 2 Light Blue #BFDBFE. Decorative Hints: Grid lines and alignment guides; Dimension indicators and measurements; Technical schematics and diagrams; Geometric precision elements. Best For: Architecture, system design, API, technical documentation, engineering, data analysis.',
  },
  {
    id: 'dark',
    name: 'Dark',
    name_zh: '暗色',
    description: 'Cinematic, premium, atmospheric.',
    promptModifier:
      'Color Palette: Primary 1 Electric Purple #8B5CF6, Primary 2 Cyan Blue #06B6D4, Primary 3 Magenta Pink #EC4899, Background Deep Purple-Black #0A0A0A, Background Alt Rich Navy #1A1A2E, Accent 1 Amber #F59E0B, Accent 2 Pure White #FFFFFF. Decorative Hints: Glowing accent elements and neon highlights; Atmospheric fog or particle effects; Silhouettes with backlit edges; Subtle gradient backgrounds. Best For: Entertainment, premium brands, cinematic storytelling, dark mode, gaming, night themes.',
  },
  {
    id: 'earth',
    name: 'Earth',
    name_zh: '大地',
    description: 'Natural, organic, grounded.',
    promptModifier:
      'Color Palette: Primary 1 Forest Green #276749, Primary 2 Sage #9AE6B4, Primary 3 Earth Brown #744210, Background Sand Beige #F5E6D3, Background Alt Sky Blue #E0F2FE, Accent 1 Sunset Orange #ED8936, Accent 2 Water Blue #63B3ED. Decorative Hints: Leaves, trees, mountains, natural forms; Sun, clouds, organic flowing lines; Botanical illustrations; Earthy textures and natural patterns. Best For: Nature, wellness, eco, organic, travel, sustainability, outdoor topics, slow living.',
  },
  {
    id: 'vivid',
    name: 'Vivid',
    name_zh: '鲜艳',
    description: 'Energetic, bold, attention-grabbing.',
    promptModifier:
      'Color Palette: Primary 1 Bright Red #EF4444, Primary 2 Neon Green #22C55E, Primary 3 Electric Blue #3B82F6, Background Light Blue #EFF6FF, Background Alt Soft Lavender #F5F3FF, Accent 1 Bright Orange #FB923C, Accent 2 Vivid Yellow #FACC15. Decorative Hints: Dynamic diagonal lines and angles; Bold geometric shapes and color blocks; Dramatic lighting effects; High-energy visual compositions. Best For: Product launch, gaming, promotion, event, marketing, announcements, brand showcases.',
  },
  {
    id: 'pastel',
    name: 'Pastel',
    name_zh: '柔和',
    description: 'Gentle, whimsical, soft.',
    promptModifier:
      'Color Palette: Primary 1 Soft Pink #FFB6C1, Primary 2 Mint #98D8C8, Primary 3 Lavender #C8A2C8, Background White #FFFFFF, Background Alt Light Cream #FFF8E7, Accent 1 Butter Yellow #FFFACD, Accent 2 Sky Blue #BEE3F8. Decorative Hints: Cute rounded proportions; Stars, sparkles, flowers, decorative flourishes; Soft shadows and gentle highlights; Storybook-style elements. Best For: Fantasy, children, gentle content, creative, whimsical, casual, beginner guides.',
  },
  {
    id: 'mono',
    name: 'Mono',
    name_zh: '单色',
    description: 'Clean, focused, essential.',
    promptModifier:
      'Color Palette: Primary 1 Pure Black #000000, Primary 2 Near Black #1F1F1F, Primary 3 Dark Gray #374151, Background White #FFFFFF, Background Alt Off-White #FAFAFA, Accent 1 Content-derived single color, Accent 2 Medium Gray #9CA3AF. Decorative Hints: Maximum negative space; Thin lines and minimal strokes; Single focal point emphasis; Stark contrast between elements. Best For: Zen, focus, essential concepts, pure, simple, minimalist philosophy, clean design.',
  },
  {
    id: 'retro',
    name: 'Retro',
    name_zh: '复古',
    description: 'Nostalgic, vintage, classic.',
    promptModifier:
      'Color Palette: Primary 1 Coral Red #E07A5F, Primary 2 Mint Green #81B29A, Primary 3 Mustard Yellow #F2CC8F, Primary 4 Dark Maroon #5D3A3A, Background Cream Off-White #F5F0E6, Background Alt Aged Paper #F5E6D3, Accent 1 Burnt Orange #D4764A, Accent 2 Rock Blue #577590, Accent 3 Vintage Gold #C9A227, Accent 4 Faded Teal #2F7373. Decorative Hints: Halftone dots and vintage badges; Aged textures with subtle paper grain; Sunburst/radiating lines for energy; Pill-shaped clouds, small dots and stars; Classic icons and retro motifs. Best For: History, vintage, retro, classic, exploration, retrospectives, throwback content, creative proposals, educational.',
  },
];

export const COVER_RENDERINGS: SkillOption[] = [
  {
    id: 'flat-vector',
    name: 'Flat Vector',
    name_zh: '扁平矢量',
    description: 'Clean, modern, geometric illustration.',
    promptModifier:
      'Flat design with clean outlines, uniform fills, and no texture or depth. Think modern app icons, infographic illustrations, and vector-based editorial art. Lines: Clean outlines with uniform stroke weight; Closed shapes (coloring-book style); Rounded line endings, avoid sharp corners; Consistent stroke width throughout. Texture: None: smooth, flat color fills only; No gradients, shadows, or noise; Solid color blocks. Depth: Flat: no shadows, no perspective; 2D layering with overlap for depth illusion; Optional 2.5D isometric layering (front/back occlusion, no atmospheric perspective); No 3D effects or bevels. Element Vocabulary: Geometric icons and simple shapes; Bold outlined objects with clean fills; Geometric simplification: complex objects to basic shapes (trees to lollipop/triangle, buildings to rectangles); "Toy model" aesthetic: cute, rounded proportions; Decorative: dots, lines, sunbursts, pill-shaped clouds, small stars; Isolated elements on clean backgrounds. Typography Approach: Clean sans-serif or bold geometric lettering; Strong readability, consistent weight; Easily scalable at any size.',
  },
  {
    id: 'hand-drawn',
    name: 'Hand Drawn',
    name_zh: '手绘',
    description: 'Sketchy, organic, personal.',
    promptModifier:
      'Hand-drawn illustration with visible imperfections, organic line quality, and personal touch. Feels like a skilled artist\'s sketchbook or whiteboard drawing. Lines: Sketchy, organic, slightly imperfect strokes; Variable line weight (thicker at pressure points); Wavy connectors and arrows; Natural hand tremor visible. Texture: Paper grain and subtle surface texture; Pencil/pen/marker texture on strokes; Casual fills with visible brush direction. Depth: Minimal: light hand-drawn shadows or hatching; No realistic depth or perspective; Simple layering with overlap. Element Vocabulary: Doodles, organic shapes, hand-lettered labels; Conceptual icons with sketchy quality; Connection lines with hand-drawn wavy feel; Stars, arrows, underlines, circles, checkmarks; Stick figures and simple characters. Typography Approach: Hand-lettered or marker-style text; Bouncy baselines, organic feel; Variable sizes for emphasis hierarchy.',
  },
  {
    id: 'painterly',
    name: 'Painterly',
    name_zh: '绘画风',
    description: 'Soft, artistic, expressive.',
    promptModifier:
      'Watercolor or paint-style illustration with visible brush strokes, color bleeds, and artistic texture. Feels like a hand-painted art piece. Lines: Soft brush strokes with variable opacity; No hard outlines; edges defined by color transitions; Organic flowing strokes with natural blending. Texture: Visible paint or watercolor wash textures; Color bleeds and wet-on-wet effects; Paper texture showing through transparent areas; Brush stroke patterns visible. Depth: Soft edges with natural color blending; Atmospheric depth through color fading; Layered washes creating depth illusion. Element Vocabulary: Watercolor washes as backgrounds; Natural elements: leaves, flowers, organic forms; Soft gradients and color transitions; Splatter and drip effects as accents; Botanical and environmental motifs. Typography Approach: Elegant brush script or handwritten style; Organic letterforms with brush texture; Integrated with paint environment.',
  },
  {
    id: 'digital',
    name: 'Digital',
    name_zh: '数字风',
    description: 'Polished, precise, modern.',
    promptModifier:
      'Clean digital illustration with polished finish, precise edges, and subtle modern effects. Feels like a professional UI mockup or corporate illustration. Lines: Clean, precise, computer-perfect edges; Consistent stroke weights; Sharp corners where appropriate; Anti-aliased smooth rendering. Texture: Smooth surfaces with no visible texture; Subtle gradients permitted (soft, controlled); Frosted glass and blur effects; Clean shadows with consistent direction. Depth: Subtle gradients and soft drop shadows; Layered card-based layouts; Light 3D effects (subtle, not realistic); Material Design-inspired elevation. Element Vocabulary: Polished icons and UI components; Data visualizations: charts, graphs, metrics; Card layouts and structured grids; Tag chips, progress bars, status indicators; Clean geometric shapes. Typography Approach: System UI or modern sans-serif (Inter, SF Pro style); Clean, functional, high readability; Structured hierarchy with consistent spacing.',
  },
  {
    id: 'pixel',
    name: 'Pixel',
    name_zh: '像素风',
    description: 'Retro 8-bit, nostalgic, chunky.',
    promptModifier:
      'Pixel art aesthetic with visible pixel grid, limited color palette, and nostalgic gaming feel. Emulates classic 8-bit and 16-bit era graphics. Lines: Pixel grid alignment, no anti-aliasing; Staircase edges on diagonals; Single-pixel or double-pixel outlines; Blocky, angular forms. Texture: Dithering patterns for gradients; No smooth transitions; Cross-hatching with pixel precision; Limited 16-32 color palette per scene. Depth: None: flat pixel planes only; Parallax layering (foreground/background); No perspective or 3D effects. Element Vocabulary: 8-bit sprites and chunky shapes; Simple iconography: stars, hearts, arrows; Text bubbles with pixel borders; Progress bars with chunky segments; Retro gaming UI elements. Typography Approach: Pixelated bitmap font style; Chunky blocky letterforms; Fixed-width or monospace feel; All-caps for headers.',
  },
  {
    id: 'chalk',
    name: 'Chalk',
    name_zh: '粉笔',
    description: 'Educational, authentic, classroom.',
    promptModifier:
      'Chalk on blackboard aesthetic with imperfect strokes, dust effects, and authentic classroom feel. Nostalgic educational warmth. Lines: Imperfect chalk strokes with variable pressure; Visible chalk texture and grain; Slightly wobbly, hand-drawn quality; Thick strokes for emphasis, thin for details. Texture: Chalk dust effects around text and elements; Board surface (dark, slightly worn); Eraser smudges and residue; Grainy chalk quality on all elements. Depth: None: flat chalk drawings on board surface; Layering through erasure and redrawing; No shadows or perspective. Element Vocabulary: Chalk doodles: stars, arrows, underlines; Mathematical formulas and diagrams; Stick figures and simple icons; Connection lines with chalk feel; Checkmarks, circles, boxes for lists; Wooden frame border optional. Typography Approach: Hand-drawn chalk lettering; Imperfect baseline, authentic classroom feel; White or bright colored chalk for emphasis; Variable sizing for hierarchy.',
  },
];

export const COVER_TEXTS: SkillOption[] = [
  {
    id: 'none',
    name: 'None',
    name_zh: '无文字',
    description: 'Pure visual cover with no text elements.',
    promptModifier:
      'Pure visual cover with no text elements. Use Cases: Photography-focused covers; Abstract art pieces; Visual-only social sharing; When title added externally. Composition: Full visual area available; No reserved text zones; Emphasis on visual metaphor.',
  },
  {
    id: 'title-only',
    name: 'Title Only',
    name_zh: '仅标题',
    description: 'Single headline, maximum impact.',
    promptModifier:
      'Single headline, maximum impact. Use Cases: Most article covers (default); Clear single message; Strong brand recognition. Composition: Title: prominent placement; Reserved zone: top or bottom 15%; Visual supports title message. Title Guidelines: Use exact title from source content or user-provided title; Do NOT invent or modify titles; Match content language.',
  },
  {
    id: 'title-subtitle',
    name: 'Title + Subtitle',
    name_zh: '标题+副标题',
    description: 'Title with supporting context.',
    promptModifier:
      'Title with supporting context. Use Cases: Technical articles needing clarification; Series with episode/part info; Content with dual messages. Composition: Title: primary element; Subtitle: secondary element; Reserved zone: 25%; Clear hierarchy between title/subtitle. Title Guidelines: Use exact title from source content or user-provided title; Do NOT invent or modify titles. Subtitle Guidelines: Clarify or contextualize title; Can include series name, author, date; Smaller, less prominent than title.',
  },
  {
    id: 'text-rich',
    name: 'Text Rich',
    name_zh: '丰富文字',
    description: 'Information-dense cover with multiple text elements.',
    promptModifier:
      'Information-dense cover with multiple text elements. Use Cases: Infographic-style covers; Event announcements with details; Promotional material with features; Content with multiple key points. Composition: Title: primary focus; Subtitle: supporting info; Tags: 2-4 keyword labels; Reserved zone: 40%; Clear visual hierarchy. Title Guidelines: Use exact title from source content or user-provided title; Do NOT invent or modify titles. Tag Guidelines: 2-4 tags maximum; Short keywords (1-2 words each); Positioned as badges/labels; Can highlight: category, date, author, key features.',
  },
];

export const COVER_MOODS: SkillOption[] = [
  {
    id: 'subtle',
    name: 'Subtle',
    name_zh: '柔和',
    description: 'Calm, understated visual presence.',
    promptModifier:
      'Calm, understated visual presence. Characteristics: Low contrast between elements; Muted, desaturated colors; Light visual weight; Gentle, refined aesthetic; Soft edges and transitions. Use Cases: Thought leadership content; Professional/corporate communications; Meditation, wellness topics; Academic or scholarly articles; Luxury brand aesthetics. Color Guidance: Pastels, earth tones, neutrals; Low saturation (30-50%); Soft gradients; Minimal color variety (2-3 colors).',
  },
  {
    id: 'balanced',
    name: 'Balanced',
    name_zh: '平衡',
    description: 'Versatile, harmonious visual presence.',
    promptModifier:
      'Versatile, harmonious visual presence. Characteristics: Medium contrast; Natural saturation levels; Balanced visual weight; Clear but not aggressive; Standard aesthetic approach. Use Cases: General articles (default); Most blog content; Educational material; Product documentation; News and updates. Color Guidance: Standard saturation (50-70%); Complementary color schemes; Clear foreground/background separation; Moderate color variety (3-4 colors).',
  },
  {
    id: 'bold',
    name: 'Bold',
    name_zh: '大胆',
    description: 'Dynamic, high-impact visual presence.',
    promptModifier:
      'Dynamic, high-impact visual presence. Characteristics: High contrast between elements; Vivid, saturated colors; Heavy visual weight; Energetic, attention-grabbing; Sharp edges and strong shapes. Use Cases: Product launches; Promotional announcements; Event marketing; Call-to-action content; Entertainment/gaming topics. Color Guidance: High saturation (70-100%); Vibrant, primary colors; Strong contrast ratios; Dynamic color combinations (4+ colors).',
  },
];

export const COVER_FONTS: SkillOption[] = [
  {
    id: 'clean',
    name: 'Clean',
    name_zh: '简洁',
    description: 'Modern, universal typography with neutral character.',
    promptModifier:
      'Modern, universal typography with neutral character. Characteristics: Geometric sans-serif letterforms; Sharp, uniform line weight; Clean edges, no flourishes; High readability at all sizes; Minimal personality, maximum clarity. Use Cases: Technical documentation; Professional/corporate content; Minimal design approaches; Data-driven articles; Modern brand aesthetics. Prompt Hints: Use clean geometric sans-serif typography; Modern, minimal letterforms; Sharp edges, uniform stroke weight; High contrast against background.',
  },
  {
    id: 'handwritten',
    name: 'Handwritten',
    name_zh: '手写',
    description: 'Warm, organic typography with personal character.',
    promptModifier:
      'Warm, organic typography with personal character. Characteristics: Hand-lettered or brush style; Organic, varied line weight; Natural imperfections; Approachable, human feel; Casual yet intentional. Use Cases: Personal stories; Lifestyle content; Wellness and self-improvement; Creative tutorials; Friendly brand voices. Prompt Hints: Use warm hand-lettered typography with organic brush strokes; Friendly, personal feel; Natural variation in stroke weight; Approachable, human character.',
  },
  {
    id: 'serif',
    name: 'Serif',
    name_zh: '衬线',
    description: 'Classic, elegant typography with editorial authority.',
    promptModifier:
      'Classic, elegant typography with editorial authority. Characteristics: Traditional serif letterforms; Refined, structured strokes; Elegant proportions; Timeless sophistication; Formal, trustworthy feel. Use Cases: Editorial content; Academic articles; Luxury brand content; Historical topics; Literary pieces. Prompt Hints: Use elegant serif typography with refined letterforms; Classic, editorial character; Structured, proportional spacing; Authoritative, sophisticated feel.',
  },
  {
    id: 'display',
    name: 'Display',
    name_zh: '展示',
    description: 'Bold, decorative typography for maximum impact.',
    promptModifier:
      'Bold, decorative typography for maximum impact. Characteristics: Heavy, expressive letterforms; Decorative elements; Strong visual presence; Playful or dramatic character; Designed for headlines. Use Cases: Announcements; Entertainment content; Promotional materials; Event marketing; Gaming topics. Prompt Hints: Use bold decorative display typography; Heavy, expressive headlines; Strong visual impact; Attention-grabbing character.',
  },
];

export const COVER_STYLE_PRESETS: SkillOption[] = [
  { id: 'elegant', name: 'Elegant', name_zh: '优雅', description: 'elegant palette + hand-drawn rendering', promptModifier: 'palette: elegant, rendering: hand-drawn' },
  { id: 'blueprint', name: 'Blueprint', name_zh: '蓝图', description: 'cool palette + digital rendering', promptModifier: 'palette: cool, rendering: digital' },
  { id: 'chalkboard', name: 'Chalkboard', name_zh: '黑板', description: 'dark palette + chalk rendering', promptModifier: 'palette: dark, rendering: chalk' },
  { id: 'dark-atmospheric', name: 'Dark Atmospheric', name_zh: '暗色氛围', description: 'dark palette + digital rendering', promptModifier: 'palette: dark, rendering: digital' },
  { id: 'editorial-infographic', name: 'Editorial Infographic', name_zh: '编辑信息图', description: 'cool palette + digital rendering', promptModifier: 'palette: cool, rendering: digital' },
  { id: 'fantasy-animation', name: 'Fantasy Animation', name_zh: '幻想动画', description: 'pastel palette + painterly rendering', promptModifier: 'palette: pastel, rendering: painterly' },
  { id: 'flat-doodle', name: 'Flat Doodle', name_zh: '扁平涂鸦', description: 'pastel palette + flat-vector rendering', promptModifier: 'palette: pastel, rendering: flat-vector' },
  { id: 'intuition-machine', name: 'Intuition Machine', name_zh: '直觉机器', description: 'retro palette + digital rendering', promptModifier: 'palette: retro, rendering: digital' },
  { id: 'minimal', name: 'Minimal', name_zh: '极简', description: 'mono palette + flat-vector rendering', promptModifier: 'palette: mono, rendering: flat-vector' },
  { id: 'nature', name: 'Nature', name_zh: '自然', description: 'earth palette + hand-drawn rendering', promptModifier: 'palette: earth, rendering: hand-drawn' },
  { id: 'notion', name: 'Notion', name_zh: 'Notion风', description: 'mono palette + digital rendering', promptModifier: 'palette: mono, rendering: digital' },
  { id: 'pixel-art', name: 'Pixel Art', name_zh: '像素艺术', description: 'vivid palette + pixel rendering', promptModifier: 'palette: vivid, rendering: pixel' },
  { id: 'playful', name: 'Playful', name_zh: '趣味', description: 'pastel palette + hand-drawn rendering', promptModifier: 'palette: pastel, rendering: hand-drawn' },
  { id: 'retro', name: 'Retro', name_zh: '复古', description: 'retro palette + digital rendering', promptModifier: 'palette: retro, rendering: digital' },
  { id: 'sketch-notes', name: 'Sketch Notes', name_zh: '笔记涂鸦', description: 'warm palette + hand-drawn rendering', promptModifier: 'palette: warm, rendering: hand-drawn' },
  { id: 'vector-illustration', name: 'Vector Illustration', name_zh: '矢量插画', description: 'retro palette + flat-vector rendering', promptModifier: 'palette: retro, rendering: flat-vector' },
  { id: 'vintage', name: 'Vintage', name_zh: '复古风', description: 'retro palette + hand-drawn rendering', promptModifier: 'palette: retro, rendering: hand-drawn' },
  { id: 'warm', name: 'Warm', name_zh: '温暖', description: 'warm palette + hand-drawn rendering', promptModifier: 'palette: warm, rendering: hand-drawn' },
  { id: 'warm-flat', name: 'Warm Flat', name_zh: '温暖扁平', description: 'warm palette + flat-vector rendering', promptModifier: 'palette: warm, rendering: flat-vector' },
  { id: 'watercolor', name: 'Watercolor', name_zh: '水彩', description: 'earth palette + painterly rendering', promptModifier: 'palette: earth, rendering: painterly' },
];

export const COVER_ASPECTS: SkillOption[] = [
  { id: '16:9', name: '16:9', name_zh: '16:9', description: 'Widescreen', promptModifier: 'aspect ratio 16:9' },
  { id: '2.35:1', name: '2.35:1', name_zh: '2.35:1', description: 'Cinematic', promptModifier: 'aspect ratio 2.35:1' },
  { id: '4:3', name: '4:3', name_zh: '4:3', description: 'Standard', promptModifier: 'aspect ratio 4:3' },
  { id: '3:2', name: '3:2', name_zh: '3:2', description: 'Photo', promptModifier: 'aspect ratio 3:2' },
  { id: '1:1', name: '1:1', name_zh: '1:1', description: 'Square', promptModifier: 'aspect ratio 1:1' },
  { id: '3:4', name: '3:4', name_zh: '3:4', description: 'Portrait', promptModifier: 'aspect ratio 3:4' },
];
