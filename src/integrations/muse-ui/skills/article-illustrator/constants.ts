export interface SkillOption {
  id: string;
  name: string;
  name_zh: string;
  description: string;
  promptModifier: string;
}

export const ARTICLE_TYPES: SkillOption[] = [
  {
    id: "infographic",
    name: "Infographic",
    name_zh: "信息图",
    description: "Data, metrics, technical content",
    promptModifier: `Infographic type - Best for data, metrics, and technical content. Visualizes information through charts, diagrams, and structured data presentations. Use when the content involves numbers, statistics, comparisons, or technical concepts that benefit from visual summarization.

Key characteristics:
- Structured data visualization
- Charts, graphs, and diagrams
- Clear visual hierarchy for information
- Icon-based representations
- Quantitative focus
- Best paired with: vector-illustration, notion, blueprint, editorial styles`,
  },
  {
    id: "scene",
    name: "Scene",
    name_zh: "场景图",
    description: "Narratives, emotional content",
    promptModifier: `Scene type - Best for narratives and emotional content. Creates atmospheric illustrations that capture moments, stories, and feelings. Use when the content tells a story, describes an experience, or evokes emotions.

Key characteristics:
- Atmospheric and emotional
- Character or subject-focused
- Environmental storytelling
- Mood-driven composition
- Narrative focus
- Best paired with: warm, watercolor, elegant styles`,
  },
  {
    id: "flowchart",
    name: "Flowchart",
    name_zh: "流程图",
    description: "Processes, workflows",
    promptModifier: `Flowchart type - Best for processes and workflows. Visualizes steps, sequences, and decision paths. Use when the content describes how something works, step-by-step procedures, or logical flows.

Key characteristics:
- Step-by-step progression
- Clear directional flow
- Decision points and branches
- Process visualization
- Sequential focus
- Best paired with: vector-illustration, notion, blueprint styles`,
  },
  {
    id: "comparison",
    name: "Comparison",
    name_zh: "对比图",
    description: "Side-by-side, options",
    promptModifier: `Comparison type - Best for side-by-side comparisons and options. Visualizes differences, pros/cons, and alternatives. Use when the content compares two or more things, presents options, or highlights contrasts.

Key characteristics:
- Side-by-side layout
- Clear visual separation
- Highlighted differences
- Balanced presentation
- Contrast focus
- Best paired with: vector-illustration, notion, elegant styles`,
  },
  {
    id: "framework",
    name: "Framework",
    name_zh: "框架图",
    description: "Models, architecture",
    promptModifier: `Framework type - Best for models, architecture, and systems. Visualizes structures, hierarchies, and relationships. Use when the content presents a model, framework, architecture, or organizational structure.

Key characteristics:
- Hierarchical structure
- Component relationships
- System visualization
- Modular representation
- Structural focus
- Best paired with: blueprint, vector-illustration, notion styles`,
  },
  {
    id: "timeline",
    name: "Timeline",
    name_zh: "时间线",
    description: "History, evolution",
    promptModifier: `Timeline type - Best for history and evolution. Visualizes chronological sequences, progressions, and developments over time. Use when the content describes historical events, product evolution, or step-by-step development.

Key characteristics:
- Chronological progression
- Milestone markers
- Temporal relationships
- Historical context
- Evolution focus
- Best paired with: elegant, warm, editorial styles`,
  },
];

export const ARTICLE_STYLES: SkillOption[] = [
  {
    id: "vector-illustration",
    name: "Vector Illustration",
    name_zh: "矢量插画",
    description: "Clean flat vector art with bold shapes. Best for knowledge articles, tutorials, tech content",
    promptModifier: `Clean flat vector art with bold shapes. Best for knowledge articles, tutorials, tech content.

Style characteristics:
- Clean flat vector shapes, bold geometric forms
- Vibrant but harmonious color palette
- Clear visual hierarchy with icons and labels
- Modern, professional, highly readable
- Perfect for knowledge articles and tutorials

When combined with infographic:
- Clean flat vector shapes, bold geometric forms
- Vibrant but harmonious color palette
- Clear visual hierarchy with icons and labels
- Modern, professional, highly readable
- Perfect for knowledge articles and tutorials

When combined with flowchart:
- Bold arrows and connectors
- Distinct step containers with icons
- Clean progression flow
- High contrast for readability

When combined with comparison:
- Split layout with clear visual separation
- Bold iconography for each side
- Color-coded distinctions
- Easy at-a-glance comparison

When combined with framework:
- Geometric node representations
- Clear hierarchical structure
- Bold connecting lines
- Modern system diagram aesthetic`,
  },
  {
    id: "notion",
    name: "Notion",
    name_zh: "Notion 风格",
    description: "Minimalist hand-drawn line art. Best for knowledge sharing, SaaS, productivity",
    promptModifier: `Minimalist hand-drawn line art. Best for knowledge sharing, SaaS, productivity.

Style characteristics:
- Hand-drawn feel, approachable
- Soft icons, rounded elements
- Neutral palette, clean backgrounds
- Perfect for SaaS/productivity

When combined with infographic:
- Hand-drawn feel, approachable
- Soft icons, rounded elements
- Neutral palette, clean backgrounds
- Perfect for SaaS/productivity

When combined with flowchart:
- Clear step indicators
- Simple arrow connections
- Minimal decoration
- Focus on process clarity

When combined with comparison:
- Split layout with clear visual separation
- Bold iconography for each side
- Color-coded distinctions
- Easy at-a-glance comparison

When combined with framework:
- Geometric node representations
- Clear hierarchical structure
- Bold connecting lines
- Modern system diagram aesthetic`,
  },
  {
    id: "warm",
    name: "Warm",
    name_zh: "温暖风格",
    description: "Friendly, approachable. Best for personal growth, lifestyle, education",
    promptModifier: `Friendly, approachable. Best for personal growth, lifestyle, education.

Style characteristics:
- Golden hour lighting, cozy atmosphere
- Soft gradients, natural textures
- Inviting, personal feeling
- Great for storytelling

When combined with scene:
- Golden hour lighting, cozy atmosphere
- Soft gradients, natural textures
- Inviting, personal feeling
- Great for storytelling

When combined with timeline:
- Friendly progression
- Organic flow
- Personal journey feel
- Growth narratives`,
  },
  {
    id: "minimal",
    name: "Minimal",
    name_zh: "极简风格",
    description: "Ultra-clean, zen-like. Best for philosophy, minimalism, core concepts",
    promptModifier: `Ultra-clean, zen-like. Best for philosophy, minimalism, core concepts.

Style characteristics:
- Ultra-clean compositions
- Maximum whitespace
- Essential elements only
- Zen-like simplicity
- Focus on core message`,
  },
  {
    id: "blueprint",
    name: "Blueprint",
    name_zh: "蓝图风格",
    description: "Technical schematics. Best for architecture, system design, engineering",
    promptModifier: `Technical schematics. Best for architecture, system design, engineering.

Style characteristics:
- Technical precision, schematic lines
- Grid-based layout, clear zones
- Monospace labels, data-focused
- Blue/white color scheme

When combined with infographic:
- Technical precision, schematic lines
- Grid-based layout, clear zones
- Monospace labels, data-focused
- Blue/white color scheme

When combined with flowchart:
- Technical precision
- Detailed connection points
- Engineering aesthetic
- For complex systems

When combined with framework:
- Precise node connections
- Hierarchical clarity
- System architecture feel
- Technical frameworks`,
  },
  {
    id: "watercolor",
    name: "Watercolor",
    name_zh: "水彩风格",
    description: "Soft artistic with natural warmth. Best for lifestyle, travel, creative",
    promptModifier: `Soft artistic with natural warmth. Best for lifestyle, travel, creative.

Style characteristics:
- Artistic, painterly effect
- Soft edges, color bleeding
- Dreamy, creative mood
- Best for lifestyle/travel

When combined with scene:
- Artistic, painterly effect
- Soft edges, color bleeding
- Dreamy, creative mood
- Best for lifestyle/travel

When combined with timeline:
- Artistic progression
- Soft color transitions
- Creative timeline presentation`,
  },
  {
    id: "elegant",
    name: "Elegant",
    name_zh: "优雅风格",
    description: "Refined, sophisticated. Best for business, thought leadership",
    promptModifier: `Refined, sophisticated. Best for business, thought leadership.

Style characteristics:
- Refined, sophisticated aesthetic
- Professional appearance
- Business-appropriate
- Thought leadership quality

When combined with comparison:
- Refined dividers
- Balanced typography
- Professional appearance
- Business comparisons

When combined with timeline:
- Sophisticated markers
- Refined typography
- Historical gravitas
- Professional presentations

When combined with framework:
- Professional structure
- Business-appropriate styling
- Clean hierarchical presentation`,
  },
  {
    id: "editorial",
    name: "Editorial",
    name_zh: "编辑风格",
    description: "Magazine-style infographic. Best for tech explainers, journalism",
    promptModifier: `Magazine-style infographic. Best for tech explainers, journalism.

Style characteristics:
- Magazine-quality polish
- Clear visual narrative flow
- Structured multi-section layouts
- Callout boxes for key insights
- Visual metaphors for complex ideas

When combined with infographic:
- Magazine-quality polish
- Clear visual narrative flow
- Structured multi-section layouts
- Callout boxes for key insights
- Visual metaphors for complex ideas`,
  },
  {
    id: "scientific",
    name: "Scientific",
    name_zh: "科学风格",
    description: "Academic precise diagrams. Best for biology, chemistry, technical research",
    promptModifier: `Academic precise diagrams. Best for biology, chemistry, technical research.

Style characteristics:
- Academic precision
- Proper labeling and clear visual flow
- Educational clarity with professional polish
- Textbook quality illustrations
- Academic journal figures aesthetic

When combined with infographic:
- Precise data representation
- Academic labeling standards
- Technical accuracy
- Research-quality visuals`,
  },
  {
    id: "chalkboard",
    name: "Chalkboard",
    name_zh: "黑板风格",
    description: "Classroom chalk drawing style. Best for education, teaching, explanations",
    promptModifier: `Classroom chalk drawing style. Best for education, teaching, explanations.

Style characteristics:
- Chalkboard black or dark green background
- Hand-drawn chalk texture on all elements
- Colorful chalk accents for visual hierarchy
- Educational, approachable aesthetic
- Nostalgic classroom feel`,
  },
  {
    id: "fantasy-animation",
    name: "Fantasy Animation",
    name_zh: "幻想动画",
    description: "Ghibli/Disney-inspired hand-drawn. Best for storybook, magical, emotional",
    promptModifier: `Ghibli/Disney-inspired hand-drawn. Best for storybook, magical, emotional.

Style characteristics:
- Charming hand-drawn animation aesthetic
- Soft, painterly textures with warm, inviting colors
- Friendly characters, magical elements, storybook layouts
- Enchanting, nostalgic, and emotionally engaging`,
  },
  {
    id: "flat",
    name: "Flat",
    name_zh: "扁平风格",
    description: "Modern bold geometric shapes. Best for modern digital, contemporary",
    promptModifier: `Modern bold geometric shapes. Best for modern digital, contemporary.

Style characteristics:
- Modern bold geometric shapes
- Contemporary digital aesthetic
- Clean, current visual language
- Bold color blocks`,
  },
  {
    id: "flat-doodle",
    name: "Flat Doodle",
    name_zh: "扁平涂鸦",
    description: "Cute flat with bold outlines. Best for cute, friendly, approachable",
    promptModifier: `Cute flat with bold outlines. Best for cute, friendly, approachable.

Style characteristics:
- Cute flat design with bold outlines
- Friendly, approachable aesthetic
- Playful and casual
- Youth-oriented visual language`,
  },
  {
    id: "intuition-machine",
    name: "Intuition Machine",
    name_zh: "直觉机器",
    description: "Technical briefing with aged paper. Best for technical briefings, academic",
    promptModifier: `Technical briefing with aged paper. Best for technical briefings, academic.

Style characteristics:
- Academic/technical briefing presentation style
- Clean 2D or isometric technical illustrations
- Multiple explanatory text boxes containing article content
- Split layouts with visuals on left/center and text on right/bottom
- Information-dense but organized with clear visual hierarchy
- Vintage blueprint aesthetic with modern clarity`,
  },
  {
    id: "nature",
    name: "Nature",
    name_zh: "自然风格",
    description: "Organic earthy illustration. Best for environmental, wellness",
    promptModifier: `Organic earthy illustration. Best for environmental, wellness.

Style characteristics:
- Organic earthy illustration
- Natural textures and colors
- Environmental themes
- Wellness-oriented aesthetic`,
  },
  {
    id: "pixel-art",
    name: "Pixel Art",
    name_zh: "像素艺术",
    description: "Retro 8-bit gaming aesthetic. Best for gaming, retro tech",
    promptModifier: `Retro 8-bit gaming aesthetic. Best for gaming, retro tech.

Style characteristics:
- Retro 8-bit pixel art aesthetic
- Chunky pixels, limited color palettes
- Nostalgic gaming references
- Fun, playful retro tech aesthetic`,
  },
  {
    id: "playful",
    name: "Playful",
    name_zh: " playful",
    description: "Whimsical pastel doodles. Best for fun, casual, educational",
    promptModifier: `Whimsical pastel doodles. Best for fun, casual, educational.

Style characteristics:
- Whimsical pastel doodles
- Fun and casual aesthetic
- Educational but playful
- Lighthearted visual language`,
  },
  {
    id: "retro",
    name: "Retro",
    name_zh: "复古风格",
    description: "80s/90s neon geometric. Best for 80s/90s nostalgic, bold",
    promptModifier: `80s/90s neon geometric. Best for 80s/90s nostalgic, bold.

Style characteristics:
- 80s/90s neon geometric aesthetic
- Bold, nostalgic visual language
- Retro tech vibes
- Vibrant neon colors`,
  },
  {
    id: "sketch",
    name: "Sketch",
    name_zh: "素描风格",
    description: "Raw pencil notebook style. Best for brainstorming, creative exploration",
    promptModifier: `Raw pencil notebook style. Best for brainstorming, creative exploration.

Style characteristics:
- Raw pencil notebook style
- Sketchy, exploratory feel
- Brainstorming aesthetic
- Creative and informal`,
  },
  {
    id: "sketch-notes",
    name: "Sketch Notes",
    name_zh: "手绘笔记",
    description: "Soft hand-drawn warm notes. Best for educational, warm notes",
    promptModifier: `Soft hand-drawn warm notes. Best for educational, warm notes.

Style characteristics:
- Soft hand-drawn illustration style
- Fresh, refined minimalist editorial aesthetic
- Emphasis on precision, clarity and intelligent elegance
- Warmth, approachability and friendliness`,
  },
  {
    id: "vintage",
    name: "Vintage",
    name_zh: " vintage",
    description: "Aged parchment historical. Best for historical, heritage",
    promptModifier: `Aged parchment historical. Best for historical, heritage.

Style characteristics:
- Aged parchment historical aesthetic
- Vintage document styling
- Historical gravitas
- Heritage and tradition`,
  },
];

export const ARTICLE_DENSITIES: SkillOption[] = [
  {
    id: "minimal",
    name: "Minimal",
    name_zh: "极简",
    description: "1-2 illustrations",
    promptModifier: `Minimal density - Generate 1-2 illustrations total. Only the most essential visuals. Use when the article is short or the concepts are simple and don't require extensive visual support.`,
  },
  {
    id: "balanced",
    name: "Balanced",
    name_zh: "平衡",
    description: "3-5 illustrations",
    promptModifier: `Balanced density - Generate 3-5 illustrations. A moderate number of visuals that support key points without overwhelming the article. Good for medium-length articles with several important concepts.`,
  },
  {
    id: "per-section",
    name: "Per Section",
    name_zh: "每节一图",
    description: "One illustration per major section (Recommended)",
    promptModifier: `Per-section density - Generate one illustration per major section. Ensures every significant section of the article has visual support. Recommended default for most articles.`,
  },
  {
    id: "rich",
    name: "Rich",
    name_zh: "丰富",
    description: "6+ illustrations",
    promptModifier: `Rich density - Generate 6 or more illustrations. Maximum visual support for complex, long-form content. Use when the article covers many distinct concepts or when visual explanation is critical to understanding.`,
  },
];

export interface TypeStyleCompatibility {
  type: string;
  highlyRecommended: string[];
  compatible: string[];
  notRecommended: string[];
}

export const TYPE_STYLE_COMPATIBILITY: TypeStyleCompatibility[] = [
  {
    type: "infographic",
    highlyRecommended: ["vector-illustration", "notion", "blueprint", "editorial", "scientific"],
    compatible: ["warm", "watercolor", "elegant"],
    notRecommended: ["minimal"],
  },
  {
    type: "scene",
    highlyRecommended: ["warm", "watercolor"],
    compatible: ["vector-illustration", "notion", "elegant", "editorial"],
    notRecommended: ["blueprint", "scientific"],
  },
  {
    type: "flowchart",
    highlyRecommended: ["vector-illustration", "notion", "blueprint"],
    compatible: ["warm", "elegant", "editorial", "scientific"],
    notRecommended: ["watercolor"],
  },
  {
    type: "comparison",
    highlyRecommended: ["vector-illustration", "notion", "elegant", "editorial"],
    compatible: ["blueprint", "watercolor", "scientific"],
    notRecommended: [],
  },
  {
    type: "framework",
    highlyRecommended: ["blueprint", "vector-illustration", "notion", "scientific"],
    compatible: ["elegant", "editorial"],
    notRecommended: ["watercolor"],
  },
  {
    type: "timeline",
    highlyRecommended: ["elegant", "warm", "editorial"],
    compatible: ["vector-illustration", "notion", "blueprint", "watercolor", "scientific"],
    notRecommended: [],
  },
];
