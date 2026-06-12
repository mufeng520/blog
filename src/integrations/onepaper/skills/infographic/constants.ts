export interface SkillOption {
  id: string;
  name: string;
  name_zh: string;
  description: string;
  promptModifier: string;
}

export const INFOGRAPHIC_LAYOUTS: SkillOption[] = [
  {
    id: 'bento-grid',
    name: 'Bento Grid',
    name_zh: '便当网格',
    description: 'Modular grid layout with varied cell sizes, like a bento box. Best for multiple topic overview, feature highlights, dashboard summaries.',
    promptModifier:
      'Grid of rectangular cells with mixed cell sizes (1x1, 2x1, 1x2, 2x2). No strict symmetry required. Hero cell for main point with supporting cells around it. Clear cell boundaries, varied cell backgrounds, icons or illustrations per cell. Consistent padding/margins. Visual hierarchy through size. Main title at top, cell titles within each cell, brief content per cell, minimal text maximum visual.',
  },
  {
    id: 'binary-comparison',
    name: 'Binary Comparison',
    name_zh: '二元对比',
    description: 'Side-by-side comparison of two items, states, or concepts. Best for before/after, product comparisons, pros and cons.',
    promptModifier:
      'Vertical divider splitting image in half. Left side: Item A / Before / Pro. Right side: Item B / After / Con. Mirrored layout for easy comparison. Clear visual distinction between sides. Strong vertical dividing line or gradient, contrasting colors per side, matching element positions for comparison, VS symbol or divider decoration, transformation arrow for before-after. Main title centered at top, side labels (A/B, Before/After), corresponding points aligned horizontally, summary at bottom if needed.',
  },
  {
    id: 'bridge',
    name: 'Bridge',
    name_zh: '桥梁',
    description: 'Gap-crossing structure connecting problem to solution or current to future state. Best for problem-to-solution journeys, gap analysis.',
    promptModifier:
      'Left side: current state/problem. Right side: desired state/solution. Bridge element spanning the gap. Gap representing challenge/obstacle. Bridge elements as steps/methods. Two distinct platforms/sides, visible gap or chasm, bridge structure with supports, icons representing each side, stepping stones or bridge planks. Title at top, left label (From/Problem/Current), right label (To/Solution/Future), bridge elements labeled, gap description below.',
  },
  {
    id: 'circular-flow',
    name: 'Circular Flow',
    name_zh: '循环流程',
    description: 'Cyclic process showing continuous or recurring steps. Best for recurring processes, feedback loops, lifecycle stages.',
    promptModifier:
      'Circular arrangement with steps around the circle. Arrows showing direction. No clear start/end (continuous). Center can hold main concept. Circle or ring shape, directional arrows, step nodes evenly spaced, icons per step, optional center element. Title at top, step labels at each node, brief descriptions near nodes, center concept if applicable, cycle name.',
  },
  {
    id: 'comic-strip',
    name: 'Comic Strip',
    name_zh: '连环漫画',
    description: 'Sequential narrative panels telling a story or explaining a concept. Best for storytelling explanations, user journey narratives.',
    promptModifier:
      'Multiple panels in sequence. Left-to-right, top-to-bottom reading. Characters or subjects in scenes. Speech/thought bubbles. Panel borders clearly defined. Panel frames, speech and thought bubbles, sound effects (optional), characters with expressions, scene backgrounds. Title at top, dialogue in speech bubbles, narration in caption boxes, sound effects integrated, panel numbers if needed.',
  },
  {
    id: 'comparison-matrix',
    name: 'Comparison Matrix',
    name_zh: '对比矩阵',
    description: 'Grid-based multi-factor comparison across multiple items. Best for product feature comparisons, tool evaluations.',
    promptModifier:
      'Table/grid layout. Rows: items being compared. Columns: comparison criteria. Cells: scores, checks, or values. Header row and column clearly marked. Clear grid lines or cell boundaries, checkmarks/X marks or scores in cells, color coding for quick scanning, icons for criteria categories, highlight for recommended option. Title at top, item names in first column, criteria in header row, brief values in cells, legend if using symbols.',
  },
  {
    id: 'dashboard',
    name: 'Dashboard',
    name_zh: '仪表盘',
    description: 'Multi-metric display with charts, numbers, and KPI indicators. Best for KPI summaries, performance metrics, analytics overviews.',
    promptModifier:
      'Multiple data widgets with charts, graphs, numbers. Grid or modular layout. Key metrics prominent. Status indicators. Chart types (bar, line, pie, gauge), big numbers for KPIs, trend arrows (up/down), color-coded status (green/red), clean data visualization. Title at top, widget titles above each section, metric labels and values, units clearly shown, time period indicated.',
  },
  {
    id: 'dense-modules',
    name: 'Dense Modules',
    name_zh: '高密度模块',
    description: 'High-density modular layout with 6-7 typed information modules packed with concrete data. Best for product selection guides, buying guides, data-rich content.',
    promptModifier:
      '6-7 distinct modules per image, each serving a specific information function. Every module contains concrete data: brand names, numbers, percentages, parameters. Minimal whitespace—compact spacing prioritized over breathing room. Smaller text acceptable to maximize information density. Each module identified by coordinate label or section marker (e.g., MOD-1, SEC-A). Module archetypes: Brand/Selection Array (Grid of options with recommendations; 4-8 items with icons, names, brief descriptions; highlight best choice); Specification Scale (Quality/measurement gauge; 3-5 levels with precise numerical increments, quality indicators emoji faces checkmarks); Deep Dive/Detail (Technical breakdown of key item; Zoom-in callouts, internal components, cross-section or exploded view); Scenario Comparison (Side-by-side use cases; 3-6 scenarios with specific recommendations and data per scenario); Identification Tips (How-to checklist; 3-5 inspection methods: look/test/check/ask format); Warning/Pitfall Zone (Critical mistakes to avoid; 3-5 pitfalls with consequences, 1-2 correct approaches; high visual contrast); Quick Reference (Compact summary; Dense table, one-line summaries, decision flowchart, or key takeaways). Variants: Coordinate-labeled (Precision and systematicity; Each module has alphanumeric coordinate A-01 B-05 C-12, ruler/axis markers); Grid-cell (Order and structure; Modules in strict rectangular cells divided by thick lines, Swiss grid feel); Free-flowing (Organic density; Magazine-style layout with dotted frames, varying module sizes, connected by arrows). Module boundary markers (thick lines, dotted frames, or coordinate grids), quality indicators per module (emoji faces, checkmarks, crosses, crowns), data callout boxes with highlighted numbers, comparison arrows and progression indicators, warning/alert visual markers for pitfall modules, metadata in corners (page numbers, timestamps, small barcodes). Main title at top prominent and impactful, subtitle with module count, module headers inside colored badges or labeled frames, body text compact multiple columns within modules, numbers highlighted with accent colors slightly larger than body text. Every corner should contain useful information or metadata. No decorative-only empty space. Text size may be reduced to fit more content—information over font size. Each module must have specific data points, not generic descriptions. Dense but organized.',
  },
  {
    id: 'funnel',
    name: 'Funnel',
    name_zh: '漏斗',
    description: 'Narrowing stages showing conversion, filtering, or refinement process. Best for sales/marketing funnels, conversion processes.',
    promptModifier:
      'Wide top (input/start), narrow bottom (output/result). Horizontal layers for stages. Progressive narrowing. 3-6 stages typically. Funnel shape clearly defined, distinct colors per stage, width indicates volume/quantity, stage icons or symbols, numbers/percentages per stage. Title at top, stage names inside or beside, metrics/numbers per stage, input label at top, output label at bottom.',
  },
  {
    id: 'hierarchical-layers',
    name: 'Hierarchical Layers',
    name_zh: '层级结构',
    description: 'Nested layers showing levels of importance, influence, or proximity. Best for Maslow-style hierarchies, priority levels, organizational structures.',
    promptModifier:
      'Multiple layers from core to periphery. Core/top: most important/central. Outer/bottom: decreasing importance. 3-7 levels typically. Clear boundaries between levels. Distinct color per level, icons or illustrations per tier, size indicates importance/quantity, labels inside or beside layers, decorative apex/center element. Title at top or side, level names inside each tier, brief descriptions outside, quantities or percentages if relevant, legend for color meanings.',
  },
  {
    id: 'hub-spoke',
    name: 'Hub and Spoke',
    name_zh: '中心辐射',
    description: 'Central concept with radiating connections to related items. Best for central theme with components, product features, ecosystem mapping.',
    promptModifier:
      'Central hub (main concept). Spokes radiating outward. Nodes at spoke ends (related concepts). Even or weighted distribution. Optional secondary connections. Prominent central hub, clear spoke lines, consistent node styling, icons representing each spoke item, optional grouping colors. Title at top, core concept in center hub, spoke item labels at nodes, brief descriptions near nodes, connection labels on spokes if needed.',
  },
  {
    id: 'iceberg',
    name: 'Iceberg',
    name_zh: '冰山',
    description: 'Surface vs hidden depths, visible vs underlying factors. Best for surface vs root causes, visible vs invisible work.',
    promptModifier:
      'Waterline dividing visible/hidden. Tip above water (obvious/surface). Larger mass below (hidden/deep). Proportional to emphasize hidden depth. Optional layers within underwater section. Clear water/surface line, above: smaller brighter, below: larger darker/deeper, wave or water texture, gradient showing depth. Title at top, surface items above waterline, hidden items below larger, waterline label optional, depth indicators for layers.',
  },
  {
    id: 'isometric-map',
    name: 'Isometric Map',
    name_zh: '等距地图',
    description: '3D-style spatial layout showing locations, relationships, or journey through space. Best for office/campus layouts, city/ecosystem maps.',
    promptModifier:
      'Isometric 3D perspective. Locations as buildings/landmarks. Paths connecting locations. Spatial relationships visible. Bird\'s eye view angle. Consistent isometric angle (30°), 3D buildings or objects, pathways and roads, labels floating above, mini scenes at locations. Title at top corner, location labels above objects, path labels along routes, legend for symbols, scale indicator if relevant.',
  },
  {
    id: 'jigsaw',
    name: 'Jigsaw',
    name_zh: '拼图',
    description: 'Interlocking puzzle pieces showing how parts fit together. Best for component relationships, team/skill fit, integration concepts.',
    promptModifier:
      'Puzzle pieces that interlock. Each piece represents a component. Connections show relationships. Can be assembled or exploded view. Missing piece highlights gaps. Classic puzzle piece shapes, distinct colors per piece, interlocking edges visible, icons or labels per piece, optional missing piece. Title at top, piece labels inside or beside, connection descriptions, missing piece explanation, assembly context.',
  },
  {
    id: 'linear-progression',
    name: 'Linear Progression',
    name_zh: '线性进程',
    description: 'Sequential progression showing steps, timeline, or chronological events. Best for step-by-step tutorials, historical timelines, project milestones.',
    promptModifier:
      'Linear arrangement (horizontal or vertical). Nodes/markers at key points. Connecting line or path between nodes. Clear start and end points. Directional flow indicators. Variants: Timeline (Chronological events dates; Time markers period labels); Process (Action steps numbered sequence; Step numbers action icons). Numbered steps or date markers, arrows or connectors showing direction, icons representing each step/event, consistent node spacing, progress indicators optional. Title at top, step/event titles at each node, brief descriptions below nodes, dates or numbers clearly visible.',
  },
  {
    id: 'periodic-table',
    name: 'Periodic Table',
    name_zh: '周期表',
    description: 'Grid of categorized elements with consistent cell formatting. Best for categorized collections, tool/resource catalogs, skill matrices.',
    promptModifier:
      'Rectangular grid. Each cell is one element. Color-coded categories. Consistent cell format. Optional grouping gaps. Uniform cell sizes, category colors, symbol/abbreviation prominent, small icon per cell, category legend. Title at top, cell: symbol name brief info, category names in legend, optional row/column headers, footnotes for special cases.',
  },
  {
    id: 'story-mountain',
    name: 'Story Mountain',
    name_zh: '故事山',
    description: 'Plot structure visualization showing rising action, climax, and resolution. Best for narrative structures, project lifecycles, emotional journeys.',
    promptModifier:
      'Mountain/arc shape. Rising slope (build-up). Peak (climax). Falling slope (resolution). Start and end at base level. Mountain or arc curve, points along the path, climax visually emphasized, slope steepness meaningful, base camps or milestones. Title at top, stage labels along path, climax prominently labeled, brief descriptions at points, start/end clearly marked.',
  },
  {
    id: 'structural-breakdown',
    name: 'Structural Breakdown',
    name_zh: '结构拆解',
    description: 'Internal structure visualization with labeled parts or layers. Best for product part breakdowns, anatomy explanations, system components.',
    promptModifier:
      'Central subject (object, system, body). Parts or layers clearly shown. Labels with callout lines. Exploded or cutaway view. Optional zoomed detail sections. Variants: Exploded (Parts separated outward; Component relationships); Cross-section (Sliced/cutaway view; Internal layers composition). Main subject clearly rendered, callout lines with dots/arrows, label boxes at endpoints, numbered parts optionally, layer boundaries or separation. Title at top, part/layer labels at callouts, brief descriptions in boxes, legend for numbered systems, depth/thickness if relevant.',
  },
  {
    id: 'tree-branching',
    name: 'Tree Branching',
    name_zh: '树形分支',
    description: 'Hierarchical structure branching from root to leaves, showing categories and subcategories. Best for taxonomies, decision trees, organizational charts.',
    promptModifier:
      'Root/trunk at top or left. Branches splitting into sub-branches. Leaves as terminal nodes. Clear parent-child relationships. Balanced or organic branching. Connecting lines showing relationships, nodes at branch points, icons or labels at each node, color coding by branch, visual weight decreasing toward leaves. Title at top, root concept prominently labeled, branch and leaf labels, optional descriptions at key nodes, legend for categories.',
  },
  {
    id: 'venn-diagram',
    name: 'Venn Diagram',
    name_zh: '维恩图',
    description: 'Overlapping circles showing relationships, commonalities, and differences. Best for concept relationships, skill overlaps, market segments.',
    promptModifier:
      '2-3 overlapping circles. Each circle is a category/concept. Overlaps show shared elements. Center shows common to all. Unique areas for exclusives. Translucent circle fills, clear overlap regions, distinct colors per circle, icons in regions, boundary labels. Title at top, circle labels outside or on edge, items in appropriate regions, overlap region labels, legend if needed.',
  },
  {
    id: 'winding-roadmap',
    name: 'Winding Roadmap',
    name_zh: '蜿蜒路线图',
    description: 'Curved path showing journey with milestones and checkpoints. Best for project roadmaps, career paths, customer journeys.',
    promptModifier:
      'S-curve or winding path. Milestones along the path. Start and destination points. Side elements (obstacles, helpers). Progress indicators. Curving road or river, milestone markers/flags, scene elements along path, vehicle/character on journey, destination landmark. Title at top, milestone labels at each point, path section names, destination description, optional timeline indicators.',
  },
];

export const INFOGRAPHIC_STYLES: SkillOption[] = [
  {
    id: 'aged-academia',
    name: 'Aged Academia',
    name_zh: '古典学术',
    description: 'Historical scientific illustration with aged paper aesthetic. Best for scientific education, biology topics, historical explanations.',
    promptModifier:
      'Historical scientific illustration with aged paper aesthetic. Color palette: Primary sepia brown (#704214), aged ink, muted earth tones. Background: Parchment (#F4E4BC), yellowed paper texture. Accents: Faded red annotations, iron gall ink spots. Variants: Notebook (Personal sketches inventions; Cursive notes margin annotations); Specimen (Scientific classification; Numbered diagrams Latin labels). Aged paper texture overlay, detailed cross-hatching and line work, scientific illustration precision, study notes and annotations, specimen plate or sketch aesthetic, numbered diagram elements. Typography: handwritten cursive or serif fonts, scientific annotations, small caps for labels, italics for scientific names. Best for scientific education, biology topics, historical explanations, inventions, nature documentation.',
  },
  {
    id: 'bold-graphic',
    name: 'Bold Graphic',
    name_zh: ' bold 图形',
    description: 'High-contrast comic style with bold outlines and dramatic visuals. Best for attention-grabbing content, dramatic narratives, pop culture.',
    promptModifier:
      'High-contrast comic style with bold outlines and dramatic visuals. Color palette: Bold primaries - red, yellow, blue, black. Background: White, halftone patterns, dramatic shadows. Accents: Spot colors, neon highlights. Variants: Graphic-novel (Dramatic narratives; Action lines hatching panels); Pop-art (High-energy impact; Halftone dots Warhol repetition). Bold black outlines, high contrast compositions, halftone dot patterns, comic panel borders optional, action lines and motion, speech bubbles and sound effects. Typography: comic book lettering, impact fonts for emphasis, POW/BANG effects for pop-art, caption boxes for narrative. Best for attention-grabbing content, dramatic narratives, pop culture, marketing, high-energy presentations.',
  },
  {
    id: 'chalkboard',
    name: 'Chalkboard',
    name_zh: '黑板风',
    description: 'Black chalkboard background with colorful chalk drawing style. Best for educational content, tutorials, classroom themes.',
    promptModifier:
      'Black chalkboard background with colorful chalk drawing style. Classic classroom chalkboard aesthetic with hand-drawn chalk illustrations. Nostalgic educational feel with imperfect, sketchy lines that capture the warmth of traditional teaching. Colorful chalk creates visual hierarchy while maintaining the authentic chalkboard experience. Background: Chalkboard Black (#1A1A1A) or Dark Green-Black (#1C2B1C). Texture: Realistic chalkboard texture with subtle scratches, dust particles, and faint eraser marks. Typography: Hand-drawn chalk lettering style with visible chalk texture. Imperfect baseline adds authenticity. White or bright colored chalk for emphasis. Color palette: Background Chalkboard Black #1A1A1A, Alt Background Green-Black #1C2B1C, Primary Text Chalk White #F5F5F5, Accent 1 Chalk Yellow #FFE566, Accent 2 Chalk Pink #FF9999, Accent 3 Chalk Blue #66B3FF, Accent 4 Chalk Green #90EE90, Accent 5 Chalk Orange #FFB366. Visual elements: hand-drawn chalk illustrations with sketchy imperfect lines, chalk dust effects around text and key elements, doodles: stars, arrows, underlines, circles, checkmarks, mathematical formulas and simple diagrams, eraser smudges and chalk residue textures, wooden frame border optional, stick figures and simple icons, connection lines with hand-drawn feel. Style rules: maintain authentic chalk texture on all elements, use imperfect hand-drawn quality throughout, add subtle chalk dust and smudge effects, create visual hierarchy with color variety, include playful doodles and annotations. Do not use perfect geometric shapes, create clean digital-looking lines, add photorealistic elements, or use gradients or glossy effects. Best for educational content, tutorials, classroom themes, teaching materials, workshops, informal learning sessions, knowledge sharing.',
  },
  {
    id: 'claymation',
    name: 'Claymation',
    name_zh: '黏土动画',
    description: '3D clay figure aesthetic with stop-motion charm. Best for playful explanations, children\'s content, stop-motion narratives.',
    promptModifier:
      '3D clay figure aesthetic with stop-motion charm. Color palette: Saturated clay colors - bright but slightly muted. Background: Neutral studio backdrop, soft gradients. Accents: Complementary clay colors, shiny highlights. Clay/plasticine texture on all objects, fingerprint marks and imperfections, rounded sculpted forms, soft shadows, stop-motion staging, miniature set aesthetic. Typography: extruded clay letters, dimensional rounded text, playful and chunky, embedded in clay scenes. Best for playful explanations, children\'s content, stop-motion narratives, friendly processes.',
  },
  {
    id: 'corporate-memphis',
    name: 'Corporate Memphis',
    name_zh: '孟菲斯商务',
    description: 'Flat vector people with vibrant geometric fills. Best for business presentations, tech products, marketing materials.',
    promptModifier:
      'Flat vector people with vibrant geometric fills. Color palette: Bright saturated - purple, orange, teal, yellow. Background: White or light pastels. Accents: Gradient fills, geometric patterns. Flat vector illustration, disproportionate human figures, abstract body shapes, floating geometric elements, no outlines solid fills, plant and object accents. Typography: clean sans-serif, bold headings, professional but friendly, minimal decoration. Best for business presentations, tech products, marketing materials, corporate training.',
  },
  {
    id: 'craft-handmade',
    name: 'Craft Handmade',
    name_zh: '手工 crafts',
    description: 'Hand-drawn and paper craft aesthetic with warm, organic feel. Best for educational content, friendly infographics, children\'s content.',
    promptModifier:
      'Hand-drawn and paper craft aesthetic with warm, organic feel. Color palette: Warm pastels, soft saturated colors, craft paper tones. Background: Light cream (#FFF8F0), textured paper (#F5F0E6). Accents: Bold highlights, construction paper colors. Variants: Hand-drawn (Cartoon illustration; Simple icons slightly imperfect lines); Paper-cutout (Layered paper craft; Drop shadows torn edges texture). Hand-drawn or cut-paper quality, organic slightly imperfect shapes, layered depth with shadows (paper variant), simple cartoon elements and icons, character illustrations (people, personalities in cartoon form), ample whitespace clean composition, keywords and core concepts highlighted. Strictly hand-drawn—no realistic or photographic elements. All imagery must maintain cartoon/illustrated aesthetic. Replace real photos or realistic figures with hand-drawn equivalents. Maintain consistent line weight and illustration style throughout. Typography: hand-drawn or casual font style, clear readable labels, keywords emphasized with larger/bolder text, cut-out letter style for paper variant. Best for educational content, general explanations, friendly infographics, children\'s content, playful hierarchies.',
  },
  {
    id: 'cyberpunk-neon',
    name: 'Cyberpunk Neon',
    name_zh: '赛博朋克霓虹',
    description: 'Neon glow on dark backgrounds, futuristic aesthetic. Best for tech futures, gaming content, digital culture.',
    promptModifier:
      'Neon glow on dark backgrounds, futuristic aesthetic. Color palette: Neon pink (#FF00FF), cyan (#00FFFF), electric blue. Background: Deep black (#0A0A0A), dark purple gradients. Accents: Neon glow effects, chrome reflections. Glowing neon outlines, dark atmospheric backgrounds, digital glitch effects, circuit patterns, holographic elements, rain and reflections. Typography: glowing neon text, digital/tech fonts, flickering effects, outlined glow letters. Best for tech futures, gaming content, digital culture, futuristic concepts, night aesthetics.',
  },
  {
    id: 'ikea-manual',
    name: 'IKEA Manual',
    name_zh: '宜家说明书',
    description: 'Minimal line art assembly instruction style. Best for step-by-step instructions, assembly guides, how-to content.',
    promptModifier:
      'Minimal line art assembly instruction style. Color palette: Black lines, minimal fills. Background: White or cream paper. Accents: Red for warnings, blue for highlights. Simple line drawings, numbered step sequences, arrow indicators, exploded assembly views, wordless communication, stick figures for scale. Typography: minimal text, step numbers prominent, universal symbols, simple sans-serif when needed. Best for step-by-step instructions, assembly guides, how-to content, universal communication.',
  },
  {
    id: 'kawaii',
    name: 'Kawaii',
    name_zh: '可爱风',
    description: 'Japanese cute style with big eyes and pastel colors. Best for cute tutorials, children\'s education, lifestyle content.',
    promptModifier:
      'Japanese cute style with big eyes and pastel colors. Color palette: Soft pastels - pink (#FFB6C1), mint (#98D8C8), lavender (#E6E6FA). Background: Light pink or cream, sparkle overlays. Accents: Bright pops, star and heart shapes. Big sparkly eyes on characters, rounded soft shapes, blushing cheeks, sparkles and stars scattered, cute animal characters, chibi proportions. Typography: rounded bubbly fonts, cute decorations on letters, hearts and stars in text, soft friendly appearance. Best for cute tutorials, children\'s education, lifestyle content, character-driven explanations.',
  },
  {
    id: 'knolling',
    name: 'Knolling',
    name_zh: '平铺排列',
    description: 'Organized flat-lay with top-down arrangement. Best for product collections, tool inventories, gear layouts.',
    promptModifier:
      'Organized flat-lay with top-down arrangement. Color palette: Object\'s natural colors. Background: Solid color - black, white, or colored surface. Accents: Shadows, subtle highlights. Top-down camera angle, objects arranged at 90° angles, equal spacing between items, clean organization, symmetry and order, no overlapping items. Typography: clean labels, positioned outside objects, connecting lines to items, minimal catalog-style. Best for product collections, tool inventories, gear layouts, organized overviews.',
  },
  {
    id: 'lego-brick',
    name: 'Lego Brick',
    name_zh: '乐高积木',
    description: 'Toy brick construction with playful aesthetic. Best for building concepts, modular systems, playful education.',
    promptModifier:
      'Toy brick construction with playful aesthetic. Color palette: Classic LEGO colors - red, blue, yellow, green, white. Background: Light gray baseplate or white. Accents: Bright primary pops, shiny studs. Visible brick studs, modular construction, minifigure characters, building instruction style, stackable elements, plastic sheen. Typography: blocky bold fonts, LEGO instruction style, step numbers, playful appearance. Best for building concepts, modular systems, playful education, children\'s content.',
  },
  {
    id: 'morandi-journal',
    name: 'Morandi Journal',
    name_zh: '莫兰迪手账',
    description: 'Hand-drawn doodle illustration with warm Morandi color tones and cozy bullet journal aesthetic. Best for product selection guides, lifestyle content, Xiaohongshu-style posts.',
    promptModifier:
      'Hand-drawn doodle illustration with warm Morandi color tones and cozy bullet journal aesthetic. Color palette: Background warm cream/beige with subtle paper texture (#F5F0E6). Primary muted teal/sage green (#7BA3A8) for headers and frames. Secondary warm terracotta/orange (#D4956A) for highlights and numbers. Line art dark charcoal brown (#4A4540). Soft highlights pale yellow (#F5E6C8). Visual elements: hand-drawn doodle illustrations with organic slightly imperfect ink lines, washi tape strip decorations (diagonal stripes pattern, beige and brown), rounded card containers for brand/option items, hand-drawn rulers scales and progress bars with emoji quality indicators, smiley/frowny faces as quality markers, dotted line frames around sections, connecting arrows and dotted lines between modules, corner decorations: tiny houses, stars, sparkles, clouds, wavy line dividers between sections, callout bubbles for tips, magnifying glass icons for identification tips, thumbs up/down icons (hand-drawn style). Variants: Cozy journal (Maximum warmth; More washi tape stickers decorative doodles); Clean sketch (Readability; Cleaner lines less decoration more structured). Typography: main title bold hand-lettered calligraphy style with decorative flourishes, module headers clean handwritten text in white on dark teal rounded badge (#6B9080), body text neat handwritten print style easy to read, numbers highlighted in terracotta (#D4956A) slightly larger than body. Style enforcement: all imagery must maintain hand-drawn/doodle aesthetic—no digital precision, organic slightly imperfect shapes throughout, sketch-like quality with visible line weight variations, warm and cozy journal feel not clinical or corporate. Avoid flat vector icons or emoji, clean geometric shapes, stock illustration style, strict grid layout, pure white background, digital/corporate look. Best for product selection guides, lifestyle content, educational overviews, consumer-facing comparison content, Xiaohongshu-style posts.',
  },
  {
    id: 'origami',
    name: 'Origami',
    name_zh: '折纸',
    description: 'Folded paper forms with geometric precision. Best for geometric concepts, transformation topics, Japanese themes.',
    promptModifier:
      'Folded paper forms with geometric precision. Color palette: Solid origami paper colors - red, blue, green, gold. Background: White or soft gray, subtle shadows. Accents: Paper fold highlights, crisp shadows. Geometric folded shapes, visible fold lines, cast shadows showing depth, paper texture, angular faceted forms, low-poly aesthetic. Typography: clean geometric fonts, angular letterforms, folded paper text effect, minimal precise labels. Best for geometric concepts, transformation topics, Japanese themes, abstract representations.',
  },
  {
    id: 'pixel-art',
    name: 'Pixel Art',
    name_zh: '像素艺术',
    description: 'Retro 8-bit gaming aesthetic. Best for gaming topics, nostalgia content, developer audiences.',
    promptModifier:
      'Retro 8-bit gaming aesthetic. Color palette: Limited palette - NES/SNES colors. Background: Black or dark blue, scanlines optional. Accents: Bright pixel highlights, CRT glow. Visible pixel grid, limited color count per sprite, 8-bit or 16-bit style, retro game UI elements, pixel-perfect edges, dithering for gradients. Typography: pixel fonts, blocky letterforms, game UI style text, score/stat display style. Best for gaming topics, nostalgia content, developer audiences, retro tech themes.',
  },
  {
    id: 'pop-laboratory',
    name: 'Pop Laboratory',
    name_zh: '波普实验室',
    description: 'Lab manual precision meets pop art color impact—coordinate systems, technical diagrams, and fluorescent accents on blueprint grid. Best for technical product guides, specification comparisons, engineering-adjacent content.',
    promptModifier:
      'Lab manual precision meets pop art color impact—coordinate systems, technical diagrams, and fluorescent accents on blueprint grid. Color palette: Background professional grayish-white with faint blueprint grid texture (#F2F2F2). Primary muted teal/sage green (#B8D8BE) for major functional blocks and data zones. High-alert accent vibrant fluorescent pink (#E91E63) strictly for warnings, critical data, or winner highlights. Marker highlights vivid lemon yellow (#FFF200) as translucent highlighter effect for keywords. Line art ultra-fine charcoal brown (#2D2926) for technical grids, coordinates, and hairlines. Visual elements: coordinate-style labels on every module (e.g., R-20, G-02, SEC-08), technical diagrams: exploded views, cross-sections with anchor points, architectural skeletal lines, vertical/horizontal rulers with precise markers (0.5mm, 1.8mm, 45°), marker-over-print effect: color blocks slightly offset from text, postmodern print feel, cross-hair targets, mathematical symbols (Σ, Δ, ∞), directional arrows (X/Y axis), microscopic detail annotations alongside macroscopic bold headers, corner metadata: tiny barcodes, timestamps, technical parameters, high contrast between massive bold headers and tiny 8pt-style annotations. Typography: headers bold brutalist characters high visual impact, body professional sans-serif or crisp technical print, numbers large highlighted with yellow or blue to stand out, annotations ultra-crisp small technical labels. Style enforcement: strictly systematic color usage only teal, pink, yellow, charcoal—no rainbow palette, sufficient fine grid lines and coordinate annotations throughout, maintain tension between large impactful headers and small precise parameters, lab manual aesthetic: mix of microscopic details and macroscopic data. Avoid cute or cartoonish doodles, soft pastels or generic textures, empty white space, flat vector stock icons, organic or hand-drawn imperfections. Best for technical product guides, specification comparisons, precision-focused data visualization, engineering-adjacent content.',
  },
  {
    id: 'retro-pop-grid',
    name: 'Retro Pop Grid',
    name_zh: '复古波普网格',
    description: '1970s retro pop art with strict Swiss international grid, thick black outlines, and flat color blocks. Best for trendy product guides, design-conscious content, bold social media posts.',
    promptModifier:
      '1970s retro pop art with strict Swiss international grid, thick black outlines, and flat color blocks. Color palette: Background warm vintage cream/beige (#F5F0E6). Flat accents: salmon pink, sky blue, mustard yellow, mint green—all muted retro tones. Contrast blocks: solid pure black (#000000) and solid pure white (#FFFFFF) used strategically for extreme contrast. Line art and outlines: solid thick black. Visual elements: uniform thick black outlines on all illustrations, text boxes, and grid dividers, pure 2D flat vector aesthetic with subtle screen print texture, strict Swiss international grid: poster divided into square and rectangular cells by thick black lines, black-background cells with white text for warnings or key categories (inverted contrast), geometric fill patterns in empty cells: checkerboards, diagonal lines, dots, flat abstract symbols, warning signs, keyholes, stars, arrows, vintage comic-style smiley/frowny faces for quality indicators, colored cells used for breathing room—some with minimal/no content. Typography: headers bold brutalist or retro thick display fonts high legibility, body clean sans-serif structured typographic alignment, decorative English text acceptable for stylistic labels (WARNING, INFO, BEST), all content text in specified language. Style enforcement: absolutely no gradients, shading, drop shadows, or 3D effects, everything anchored in grid cells—no floating or unorganized elements, maintain 1970s retro pop art and underground comic illustration feel, visual density balanced with rhythmic grid—some cells intentionally sparse for contrast. Avoid 3D rendering, realistic details, gradients, soft shadows, soft thin or sketch-like pencil lines, free-flowing unorganized or floating layouts (everything must be grid-anchored), pure white background canvas, organic or hand-drawn imperfections. Best for trendy product guides, design-conscious content, visually striking comparisons, content targeting design-savvy audiences, bold social media posts.',
  },
  {
    id: 'storybook-watercolor',
    name: 'Storybook Watercolor',
    name_zh: '童话水彩',
    description: 'Soft hand-painted illustration with whimsical charm. Best for storytelling, emotional journeys, nature topics, children\'s education.',
    promptModifier:
      'Soft hand-painted illustration with whimsical charm. Color palette: Soft watercolor washes - muted blues, greens, warm earth. Background: Watercolor paper texture, white or cream. Accents: Deeper pigment pools, splatter effects. Visible brushstrokes, soft color bleeds and gradients, white space as design element, delicate line work over washes, natural organic shapes, dreamy atmospheric quality. Typography: elegant hand-lettering, watercolor-style text, flowing organic letterforms, integrated with illustrations. Best for storytelling, emotional journeys, nature topics, children\'s education, artistic presentations.',
  },
  {
    id: 'subway-map',
    name: 'Subway Map',
    name_zh: '地铁线路图',
    description: 'Transit diagram style with colored lines and stations. Best for journey maps, process flows, network diagrams.',
    promptModifier:
      'Transit diagram style with colored lines and stations. Color palette: Transit line colors - red, blue, green, yellow, orange. Background: White or light gray. Accents: Station dots, interchange markers. Colored route lines, 45° and 90° angles only, station circle markers, interchange symbols, simplified geography, line thickness hierarchy. Typography: clean sans-serif, station name labels, line number/name badges, horizontal or angled text. Best for journey maps, process flows, network diagrams, route explanations.',
  },
  {
    id: 'technical-schematic',
    name: 'Technical Schematic',
    name_zh: '技术示意图',
    description: 'Technical diagrams with engineering precision and clean geometry. Best for technical architecture, system diagrams, engineering specs.',
    promptModifier:
      'Technical diagrams with engineering precision and clean geometry. Color palette: Blues (#2563EB), teals, grays, white lines. Background: Deep blue (#1E3A5F), white, or light gray with grid. Accents: Amber highlights (#F59E0B), cyan callouts. Variants: Blueprint (Engineering schematics; White on blue measurements grid); Isometric (3D spatial representation; 30° angle blocks clean fills). Geometric precision throughout, grid pattern or isometric angle, dimension lines and measurements, technical symbols and annotations, clean vector shapes, consistent stroke weights. Typography: technical stencil or clean sans-serif, all-caps labels, measurement annotations, floating labels for isometric. Best for technical architecture, system diagrams, engineering specs, product breakdowns, data visualization.',
  },
  {
    id: 'ui-wireframe',
    name: 'UI Wireframe',
    name_zh: 'UI 线框图',
    description: 'Grayscale interface mockup style. Best for product designs, UI explanations, app concepts, user flow diagrams.',
    promptModifier:
      'Grayscale interface mockup style. Color palette: Grays - light (#E5E5E5), medium (#9CA3AF), dark (#374151). Background: White (#FFFFFF), light gray. Accents: Blue for interactive (#3B82F6), red for emphasis. Wireframe boxes and placeholders, X marks for image placeholders, simple line icons, grid-based layout, annotation callouts, redline specifications. Typography: system fonts, placeholder Lorem ipsum, UI label style, sans-serif throughout. Best for product designs, UI explanations, app concepts, user flow diagrams.',
  },
];
