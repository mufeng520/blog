export interface SkillOption {
  id: string;
  name: string;
  name_zh: string;
  description: string;
  promptModifier: string;
}

export const COMIC_ART_STYLES: SkillOption[] = [
  {
    id: "ligne-claire",
    name: "Ligne Claire",
    name_zh: "清线画风",
    description: "Uniform lines, flat colors, European comic tradition (Tintin, Logicomix)",
    promptModifier: `Classic European comic style originating from Hergé's Tintin. Characterized by clean, uniform outlines and flat color fills without gradients. Creates a timeless, accessible aesthetic suitable for educational and narrative content.

Line Work:
- Uniform, clean outlines with consistent weight (2px)
- No hatching or cross-hatching for shading
- Sharp, precise edges on all elements
- Black ink outlines on all figures and objects
- Shadows indicated through flat color areas, not line techniques

Character Design:
- Slightly stylized/cartoonish characters with realistic proportions
- Distinctive, recognizable facial features
- Expressive faces with clear emotions
- Period-appropriate clothing with attention to detail
- Consistent character appearance across panels
- 6-7 head height proportions

Background Treatment:
- Detailed, realistic backgrounds with architectural accuracy
- Period-specific props and technology
- Clear spatial depth and perspective
- Environmental storytelling through details
- Contrast between simplified characters and detailed backgrounds

Color Approach:
- Flat colors without gradients (true to Ligne Claire tradition)
- Limited palette per page for cohesion
- Colors support narrative mood
- Consistent lighting logic within scenes

Default Color Palette:
- Primary Blue: Clean blue #3182CE
- Primary Red: Classic red #E53E3E
- Primary Yellow: Warm yellow #ECC94B
- Skin: Warm tan #F7CFAE
- Background Light: Light cream #FFFAF0
- Background Sky: Sky blue #BEE3F8

Quality Markers:
- Clean, uniform line weight throughout
- Flat colors without gradients
- Detailed backgrounds, stylized characters
- Clear panel borders and reading flow
- Hand-drawn text style
- Proper perspective in environments`,
  },
  {
    id: "manga",
    name: "Manga",
    name_zh: "日漫画风",
    description: "Anime/manga aesthetics with expressive characters",
    promptModifier: `Japanese manga art style characterized by large expressive eyes, dynamic poses, and visual emotion indicators. Versatile style that works across genres from educational to romantic to action.

Line Work:
- Clean, smooth lines (1.5-2px)
- Expressive weight variation for emphasis
- Smooth curves, dynamic strokes
- Speed lines and motion effects available
- Screen tone effects for atmosphere

Character Design:
- Anime/manga proportions: larger eyes, expressive faces
- 5-7 head height proportions (varies by sub-style)
- Clear emotional indicators (!, ?, sweat drops, sparkles)
- Dynamic poses and gestures
- Detailed hair with individual strands
- Fashionable clothing with natural folds

Eye Styles:
- Standard: Medium-large, 2-3 highlights
- Educational: Friendly, approachable eyes
- Dramatic: Intense, detailed irises
- Cute: Very large, sparkly eyes

Background Treatment:
- Simplified during dialogue/explanation
- Detailed for establishing shots
- Screen tone gradients for mood
- Abstract backgrounds for emotional moments
- Technical diagrams styled as displays

Color Approach:
- Clean, bright anime colors
- Soft gradients on skin
- Vibrant palette options
- Light and shadow with soft transitions
- Color coding for character identification

Default Color Palette:
- Primary Blue: Bright blue #4299E1
- Primary Orange: Warm orange #ED8936
- Primary Green: Soft green #68D391
- Skin: Anime warm #FEEBC8
- Background: Clean white #FFFFFF
- Highlight: Golden #FFD700

Visual Elements:
- Speech bubbles: rounded (normal), spiky (excitement)
- Sound effects integrated visually
- Emotion symbols (sweat drops, anger marks, hearts)
- Speed lines and motion blur
- Sparkle and glow effects

Quality Markers:
- Expressive character faces
- Clean, consistent line work
- Dynamic poses and compositions
- Appropriate use of manga conventions
- Readable panel flow
- Consistent character designs`,
  },
  {
    id: "realistic",
    name: "Realistic",
    name_zh: "写实画风",
    description: "Digital painting with realistic proportions and lighting",
    promptModifier: `Full-color realistic manga style using digital painting techniques. Features anatomically accurate characters, rich gradients, and detailed environmental rendering. Sophisticated aesthetic for mature audiences.

Line Work:
- Clean, precise outlines with clear contours
- Uniform line weight for character definition
- No excessive hatching - rely on color for depth
- Smooth curves and realistic anatomical lines
- Ligne Claire influence: clean but not simplified

Character Design:
- Realistic human proportions (7-8 head heights)
- Anatomically accurate features and expressions
- Detailed facial structure without exaggeration
- Natural poses and body language
- Consistent appearance across panels
- Subtle expressions rather than manga-style

Rendering Style:
- Full-color digital painting with rich gradients
- Soft shadow transitions on skin and fabric
- Realistic material textures (glass, liquid, fabric, wood)
- Detailed hair with natural shine and volume
- Environmental lighting affects all elements
- NOT flat cel-shading - smooth color blending

Background Treatment:
- Highly detailed, realistic environments
- Accurate perspective and spatial depth
- Atmospheric lighting (warm indoor, cool outdoor)
- Professional settings rendered with precision
- Props and objects with realistic textures

Color Approach:
- Rich gradients for depth and volume
- Realistic lighting with warm/cool contrast
- Material-specific rendering
- Subtle color temperature shifts
- Professional, sophisticated palette

Default Color Palette:
- Skin Light: Natural warm #F5D6C6
- Skin Shadow: Warm shadow #E8C4B0
- Environment: Warm wood #8B7355
- Environment Cool: Cool stone #9CA3AF
- Accent: Wine red #722F37
- Accent Gold: Gold #D4AF37
- Light Warm: Amber #FFB347
- Light Cool: Cool blue #B0C4DE

Quality Markers:
- Anatomically accurate proportions
- Smooth color gradients (not flat fills)
- Realistic material textures
- Detailed, atmospheric backgrounds
- Natural lighting with soft shadows
- Expressive but subtle expressions
- Professional aesthetic
- Clean speech bubbles`,
  },
  {
    id: "ink-brush",
    name: "Ink Brush",
    name_zh: "水墨画风",
    description: "Chinese ink brush aesthetics with dynamic strokes",
    promptModifier: `Traditional Chinese ink brush painting style adapted for comics. Combines calligraphic brush strokes with ink wash effects. Creates atmospheric, artistic visuals rooted in East Asian aesthetics.

Line Work:
- 2-3px dynamic brush strokes with varying weight
- Ink wash effects, traditional Chinese brush feel
- Bold, confident strokes with sharp edges
- Flowing lines for fabric and hair
- Pressure-sensitive stroke variation

Character Design:
- Realistic human proportions (7.5-8 head heights)
- Defined features with ink brush definition
- Dynamic poses capturing movement
- Flowing hair and clothing in motion
- Traditional attire options (robes, hanfu)
- Intense, expressive faces

Brush Techniques:
- Bold strokes: Character outlines
- Fine lines: Details, hair
- Ink wash: Atmosphere, shadows
- Dry brush: Texture, aging
- Splatter: Impact, drama

Background Treatment:
- Dramatic landscapes: mountains, waterfalls, temples
- Ink wash atmospheric effects
- Misty, layered depth
- Traditional architecture elements
- High contrast silhouettes
- Negative space as design element

Color Approach:
- Ink gradients as primary
- Limited accent colors
- Traditional Chinese palette
- Atmospheric color washes
- High contrast compositions

Default Color Palette:
- Primary: Deep black ink #1A1A1A
- Accent: Crimson red #8B0000
- Accent: Imperial gold #D4AF37
- Skin: Natural tan #D4A574
- Background: Misty gray #9CA3AF
- Background: Earth tone #8B7355
- Wash: Ink gradient #2D3748

Visual Elements:
- Calligraphic text integration
- Seal stamps (optional)
- Ink splatter effects
- Flowing fabric trails
- Atmospheric mist
- Mountain silhouettes

Quality Markers:
- Dynamic brush stroke quality
- Authentic ink wash atmosphere
- High contrast compositions
- Flowing movement in fabric/hair
- Traditional aesthetic elements
- Atmospheric depth`,
  },
  {
    id: "chalk",
    name: "Chalk",
    name_zh: "粉笔画风",
    description: "Chalkboard aesthetic with hand-drawn warmth",
    promptModifier: `Classic classroom chalkboard aesthetic with hand-drawn chalk illustrations. Nostalgic educational feel with imperfect, sketchy lines that capture the warmth of traditional teaching.

Line Work:
- Sketchy, imperfect hand-drawn lines
- Chalk texture on all strokes
- Varying line weight from chalk pressure
- Soft edges, no sharp digital lines
- Visible chalk dust effects

Character Design:
- Simplified, friendly character designs
- Stick figures to semi-detailed range
- Expressive through simple gestures
- Approachable, non-intimidating
- Educational presenter style

Background:
- Chalkboard Black (#1A1A1A) or Dark Green-Black (#1C2B1C)
- Realistic chalkboard texture
- Subtle scratches and dust particles
- Faint eraser marks for authenticity
- Wooden frame border optional

Typography:
- Hand-drawn chalk lettering style
- Visible chalk texture on text
- Imperfect baseline adds authenticity
- White or bright colored chalk for emphasis

Visual Elements:
- Hand-drawn chalk illustrations
- Chalk dust effects around elements
- Doodles: stars, arrows, underlines, circles
- Mathematical formulas and diagrams
- Eraser smudges and chalk residue
- Stick figures and simple icons
- Connection lines with hand-drawn feel

Default Color Palette:
- Background: Chalkboard Black #1A1A1A
- Alt Background: Green-Black #1C2B1C
- Primary Text: Chalk White #F5F5F5
- Accent 1: Chalk Yellow #FFE566
- Accent 2: Chalk Pink #FF9999
- Accent 3: Chalk Blue #66B3FF
- Accent 4: Chalk Green #90EE90
- Accent 5: Chalk Orange #FFB366

Style Rules:
- DO: Maintain authentic chalk texture on all elements; Use imperfect, hand-drawn quality throughout; Add subtle chalk dust and smudge effects; Create visual hierarchy with color variety; Include playful doodles and annotations
- DON'T: Use perfect geometric shapes; Create clean digital-looking lines; Add photorealistic elements; Use gradients or glossy effects

Quality Markers:
- Authentic chalk texture throughout
- Imperfect, hand-drawn quality
- Readable despite sketchy style
- Nostalgic classroom feel
- Effective color hierarchy
- Playful educational aesthetic`,
  },
];

export const COMIC_TONES: SkillOption[] = [
  {
    id: "neutral",
    name: "Neutral",
    name_zh: "中性基调",
    description: "Balanced, rational, educational",
    promptModifier: `Default balanced tone suitable for educational and informative content. Neither overly emotional nor cold - creates accessible, professional atmosphere.

Mood Characteristics:
- Balanced emotional register
- Clear, rational presentation
- Educational focus
- Professional but approachable
- Objective storytelling

Color Modifiers (when applied to any art style):
- Saturation: Standard (no shift)
- Contrast: Balanced
- Temperature: Neutral
- Brightness: Slightly bright

Lighting:
- Even, clear lighting
- Minimal dramatic shadows
- Consistent across panels
- Natural light sources
- No extreme contrast

Emotional Range:
- Joy: Moderate smile
- Concern: Thoughtful expression
- Surprise: Mild widening of eyes
- Frustration: Slight frown

Composition:
- Balanced panel layouts
- Clear focal points
- Readable hierarchies
- Standard framing
- Functional compositions

Best For: Educational content, technical tutorials, informative biographies, documentary style, professional topics

Usage Notes: Neutral is the default tone. Combine with any art style for baseline professional output. Most versatile tone option.`,
  },
  {
    id: "warm",
    name: "Warm",
    name_zh: "温馨基调",
    description: "Nostalgic, personal, comforting",
    promptModifier: `Warm, inviting atmosphere for personal stories and nostalgic content. Creates emotional connection through cozy aesthetics and comforting visuals.

Mood Characteristics:
- Nostalgic feeling
- Personal, intimate atmosphere
- Comforting and healing
- Memory and reflection
- Gentle emotional warmth

Color Modifiers (when applied to any art style):
- Saturation: Slightly reduced
- Contrast: Softer
- Temperature: Warm shift (+15%)
- Brightness: Soft, golden

Color Temperature (shift palette toward warm tones):
- Cool blue → Soft teal
- Pure white → Cream
- Gray → Warm gray
- Black → Soft charcoal

Accent Colors:
- Golden yellow (#D69E2E)
- Soft orange (#DD6B20)
- Warm brown (#8B6F47)
- Sunset tones

Lighting:
- Golden hour lighting
- Soft, diffused light
- Warm indoor glow
- Candle/lamp warmth
- Gentle shadows

Emotional Range:
- Joy: Genuine warm smile
- Sadness: Gentle melancholy
- Love: Soft, tender expressions
- Memory: Distant, reflective gaze

Composition:
- Intimate framing
- Cozy environments
- Soft focus backgrounds
- Welcoming spaces
- Personal moments highlighted

Visual Elements:
- Warm light rays
- Soft edges
- Nostalgic props (old photos, keepsakes)
- Comfort objects (blankets, tea cups)
- Nature elements (autumn leaves, sunset)

Best For: Personal stories, childhood memories, mentorship narratives, family histories, gentle biographies, healing journeys

Combination Notes: Works especially well with ligne-claire (nostalgic European comics), realistic (touching human stories), manga (slice-of-life warmth), chalk (nostalgic education)`,
  },
  {
    id: "dramatic",
    name: "Dramatic",
    name_zh: "戏剧基调",
    description: "High contrast, intense, powerful",
    promptModifier: `High-impact dramatic tone for pivotal moments, conflicts, and breakthroughs. Uses strong contrast and intense compositions to create emotional power.

Mood Characteristics:
- Tension and intensity
- Pivotal moments
- Conflict and resolution
- Breakthrough discoveries
- Emotional climaxes

Color Modifiers (when applied to any art style):
- Saturation: High (vibrant or deep)
- Contrast: Maximum
- Temperature: Varies for effect
- Brightness: Strong highlights, deep shadows

Contrast Approach:
- Sharp light/dark divisions
- Minimal mid-tones
- Stark compositions
- Silhouette potential
- Rim lighting effects

Accent Colors:
- Deep navy (#1A365D)
- Crimson (#9B2C2C)
- Stark white
- Heavy blacks
- Limited palette per scene

Lighting:
- Dramatic single-source
- High contrast shadows
- Rim lighting on characters
- Spotlight effects
- Chiaroscuro influence

Emotional Range:
- Anger: Intense, defined features
- Determination: Strong, focused gaze
- Shock: Wide eyes, stark lighting
- Triumph: Powerful, elevated pose

Composition:
- Angular, dynamic layouts
- Dramatic camera angles
- Low/high viewpoints
- Diagonal compositions
- Negative space for impact

Visual Elements:
- Speed lines for tension
- Impact effects
- Dramatic backgrounds (storms, fire)
- Silhouettes
- Light burst effects
- Environmental drama

Best For: Pivotal discoveries, conflict scenes, climactic moments, breakthrough realizations, emotional confrontations, historical turning points

Combination Notes: Works especially well with realistic (powerful drama), ink-brush (martial arts climax), ligne-claire (historical pivots), manga (shonen battles). Avoid with chalk (style mismatch).`,
  },
  {
    id: "romantic",
    name: "Romantic",
    name_zh: "浪漫基调",
    description: "Soft, beautiful, emotionally delicate",
    promptModifier: `Soft, dreamy atmosphere for romantic and emotionally delicate content. Features decorative elements, sparkles, and beautiful compositions that emphasize feeling and beauty.

Mood Characteristics:
- Romance and love
- Beauty and elegance
- Emotional delicacy
- Dreams and hopes
- Youth and idealism

Color Modifiers (when applied to any art style):
- Saturation: Soft pastels
- Contrast: Low, gentle
- Temperature: Slightly warm pink
- Brightness: Soft, glowing

Color Palette:
- Primary: Soft pink #FFB6C1
- Secondary: Lavender #E6E6FA
- Accent: Rose #FF69B4
- Highlight: Pearl white #FFFAF0
- Gold: Gold sparkle #FFD700
- Skin: Porcelain #FFF5EE
- Blush: Soft blush #FFE4E1
- Background: Soft cream #FFF8DC

Lighting:
- Soft, diffused light
- Glowing effects
- Backlighting halos
- Sparkle highlights
- Dreamy atmospheres

Decorative Elements (essential decorations to add to compositions):
- Flower petals: Floating, framing
- Sparkles: Emotional highlights
- Bubbles: Dreamy moments
- Feathers: Gentle floating
- Stars: Night scenes, wonder
- Hearts: Love emphasis
- Light halos: Character highlights

Emotional Range:
- Love: Soft gaze, blush
- Longing: Distant, beautiful sadness
- Joy: Radiant smile, sparkles
- Shyness: Downcast eyes, blush

Composition:
- Elegant, flowing layouts
- Soft focus backgrounds
- Characters framed by decorations
- Beautiful angles (3/4 profiles)
- Screen tone gradients

Best For: Romance stories, coming-of-age, friendship narratives, emotional drama, school life, beautiful moments

Combination Notes: Works especially well with manga (classic shoujo style). Avoid with realistic, ink-brush, ligne-claire, chalk (style mismatch).`,
  },
  {
    id: "energetic",
    name: "Energetic",
    name_zh: "活力基调",
    description: "Bright, dynamic, exciting",
    promptModifier: `High-energy atmosphere for exciting, discovery-filled content. Bright colors, dynamic compositions, and movement create engaging visuals for younger audiences.

Mood Characteristics:
- Excitement and wonder
- Discovery and learning
- Energy and enthusiasm
- Movement and action
- Youthful spirit

Color Modifiers (when applied to any art style):
- Saturation: High (vibrant)
- Contrast: Medium-high
- Temperature: Variable, punchy
- Brightness: Bright, clean

Color Palette:
- Primary Red: Bright red #F56565
- Primary Yellow: Sunny yellow #F6E05E
- Primary Blue: Sky blue #63B3ED
- Accent 1: Magenta #D53F8C
- Accent 2: Lime green #68D391
- Background: Clean white #FFFFFF
- Background Alt: Bright pastels (various)

Lighting:
- Bright, clear lighting
- Clean shadows
- High energy
- Spotlight effects for emphasis
- Dynamic light sources

Dynamic Elements (energy effects to add to compositions):
- Speed lines: Motion, excitement
- Sparkles: Discoveries
- Burst effects: Aha moments
- Motion blur: Fast action
- Star bursts: Emphasis
- Sweat drops: Effort/surprise

Emotional Range:
- Excitement: Wide eyes, big smile
- Surprise: Dramatic reaction
- Determination: Intense focus
- Wonder: Sparkling eyes

Composition:
- Dynamic angles
- Action-oriented layouts
- Movement emphasis
- Clean, punchy designs
- Energy flows

Visual Style:
- Expressive, animated characters
- Wide eyes, big reactions
- Dynamic poses
- Motion and action focus
- Simplified backgrounds for energy

Best For: Science explanations, "Aha" moments, young audience content, discovery narratives, learning adventures, action tutorials

Combination Notes: Works especially well with manga (shonen energy), chalk (fun education). Avoid with realistic, ink-brush (style mismatch).`,
  },
  {
    id: "vintage",
    name: "Vintage",
    name_zh: "复古基调",
    description: "Historical, aged, period authenticity",
    promptModifier: `Historical atmosphere with aged paper effects and period-appropriate aesthetics. Creates sense of time, authenticity, and historical distance.

Mood Characteristics:
- Historical authenticity
- Period distance
- Archival quality
- Time and memory
- Classical elegance

Color Modifiers (when applied to any art style):
- Saturation: Reduced, muted
- Contrast: Medium, aged
- Temperature: Sepia shift
- Brightness: Slightly faded

Color Palette:
- Primary: Sepia brown #8B7355
- Background: Aged paper #F5E6D3
- Accent 1: Faded teal #6B8E8E
- Accent 2: Muted burgundy #7B3F3F
- Ink: Aged black #3D3D3D
- Yellowed: Paper yellow #F5DEB3

Visual Effects (aging effects to apply subtly):
- Paper aging: Background texture
- Faded edges: Vignette effect
- Dust specks: Subtle overlay
- Yellowing: Color shift
- Wear marks: Corner/edge details

Period Elements:
- Historical typography
- Period-accurate details
- Archival presentation
- Classical compositions
- Formal framing

Lighting:
- Natural, period-appropriate
- Oil lamp/candle warmth
- Soft, diffused light
- Indoor historical lighting
- Photographic quality

Emotional Range:
- Dignity: Formal, composed
- Sorrow: Restrained, elegant
- Pride: Classical posture
- Wisdom: Aged grace

Composition:
- Classical framing
- Formal compositions
- Period-appropriate staging
- Documentary style
- Historical accuracy priority

Best For: Pre-1950s stories, classical science history, historical biographies, period pieces, documentary comics, archival narratives

Combination Notes: Works especially well with realistic (period drama), ligne-claire (historical adventure), ink-brush (classical Asian stories). Avoid with manga, chalk (style mismatch - too modern).`,
  },
  {
    id: "action",
    name: "Action",
    name_zh: "动作基调",
    description: "Speed, impact, power",
    promptModifier: `High-impact action atmosphere with dynamic movement, combat effects, and powerful visual energy. Creates visceral, exciting sequences.

Mood Characteristics:
- Speed and motion
- Power and impact
- Combat intensity
- Physical energy
- Visceral excitement

Color Modifiers (when applied to any art style):
- Saturation: High contrast
- Contrast: Maximum
- Temperature: Variable per effect
- Brightness: Dynamic range

Action Effects (combat/motion effects to apply liberally):
- Speed lines: Motion, velocity
- Impact bursts: Hits, collisions
- Shockwaves: Powerful impacts
- Flying debris: Environmental destruction
- Dust clouds: Ground impacts
- Motion blur: Fast movement
- Afterimages: Super speed

Special Effects:
- Energy attacks: Glowing, radiating
- Physical impacts: Radiating lines, debris
- Movement: Speed lines, blur
- Atmosphere: Flying particles, wind

Effect Colors:
- Energy glow: Blue #4299E1
- Fire/power: Gold #FFD700
- Impact: White burst #FFFFFF
- Blood/intensity: Deep red #8B0000

Lighting:
- Dynamic, shifting
- Impact flashes
- Energy glow sources
- Rim lighting on figures
- Dramatic contrast

Emotional Range:
- Determination: Fierce focus
- Rage: Intense, powerful
- Triumph: Victorious pose
- Struggle: Strained effort

Composition:
- Dynamic angles
- Extreme perspectives
- Panel-breaking layouts
- Asymmetric designs
- Impact-focused framing

Pose Guidelines:
- Dynamic warrior poses
- Weight and momentum visible
- Muscle tension shown
- Flow of movement captured
- Impact points emphasized

Best For: Martial arts combat, action sequences, sports moments, physical challenges, battle scenes, climactic confrontations

Combination Notes: Works especially well with ink-brush (wuxia combat), manga (shonen battles). Avoid with chalk, ligne-claire (style mismatch - too static).`,
  },
];

export const COMIC_LAYOUTS: SkillOption[] = [
  {
    id: "standard",
    name: "Standard",
    name_zh: "标准布局",
    description: "Classic comic grid, versatile",
    promptModifier: `Classic comic grid layout. Versatile for narrative flow and dialogue scenes.

Panel Structure:
- Panels per page: 4-6
- Structure: Regular grid with occasional variation
- Gutters: Consistent white space (8-10px)

Grid Configuration:
- 2-3 columns × 2-3 rows
- Panel sizes: Mostly equal, occasional variation
- Reading flow: Left→right, top→bottom (Z-pattern)

Best For: Narrative flow, dialogue scenes
Best Style Pairings: classic, warm, sepia`,
  },
  {
    id: "cinematic",
    name: "Cinematic",
    name_zh: "电影布局",
    description: "Wide panels, filmic feel",
    promptModifier: `Cinematic layout with wide panels and filmic feel.

Panel Structure:
- Panels per page: 2-4
- Structure: Horizontal emphasis, wide aspect panels
- Gutters: Generous spacing (12-15px)

Grid Configuration:
- 1-2 columns, horizontal emphasis
- Panel sizes: Wide aspect ratios (3:1, 4:1)
- Reading flow: Horizontal sweep, filmic rhythm

Best For: Establishing shots, dramatic moments, landscapes
Best Style Pairings: dramatic, classic, sepia`,
  },
  {
    id: "dense",
    name: "Dense",
    name_zh: "密集布局",
    description: "Information-rich, educational focus",
    promptModifier: `Dense information-rich layout with educational focus.

Panel Structure:
- Panels per page: 6-9
- Structure: Compact grid, smaller panels
- Gutters: Tight spacing (4-6px)

Grid Configuration:
- 3 columns × 3 rows
- Panel sizes: Compact, uniform
- Reading flow: Rapid progression, information-rich

Best For: Technical explanations, complex narratives, timelines
Best Style Pairings: ohmsha, vibrant`,
  },
  {
    id: "splash",
    name: "Splash",
    name_zh: "冲击布局",
    description: "Impact-focused, key moments",
    promptModifier: `Splash layout focused on impact and key moments.

Panel Structure:
- Panels per page: 1-2 large + 2-3 small
- Structure: Dominant splash with supporting panels
- Gutters: Varied for emphasis

Grid Configuration:
- 1 dominant panel + 2-3 supporting
- Panel sizes: 50-70% splash, remainder small
- Reading flow: Splash dominates, supporting panels accent

Best For: Revelations, breakthroughs, chapter openings
Best Style Pairings: dramatic, classic, vibrant`,
  },
  {
    id: "mixed",
    name: "Mixed",
    name_zh: "混合布局",
    description: "Dynamic, varied rhythm",
    promptModifier: `Mixed layout with dynamic, varied rhythm.

Panel Structure:
- Panels per page: 3-7 (varies)
- Structure: Intentionally varied for pacing
- Gutters: Dynamic spacing

Grid Configuration:
- Intentionally irregular
- Panel sizes: Varied for pacing and emphasis
- Reading flow: Guides eye through varied rhythm

Best For: Action sequences, emotional arcs, complex stories
Best Style Pairings: dramatic, vibrant, ohmsha`,
  },
  {
    id: "webtoon",
    name: "Webtoon",
    name_zh: "条漫布局",
    description: "Vertical scrolling comic (竖版条漫)",
    promptModifier: `Vertical scrolling comic layout (竖版条漫) optimized for mobile reading.

Panel Structure:
- Panels per page: 3-5 vertically stacked
- Structure: Single column, vertical flow optimized for scrolling
- Gutters: Generous vertical spacing (20-40px), panels often bleed horizontally

Grid Configuration:
- Single column, vertical stack
- Panel sizes: Full width, variable height (1:1 to 1:2 aspect)
- Reading flow: Top→bottom continuous scroll

Special Features:
- Panels can extend beyond frame for dramatic effect
- Generous whitespace between beats
- Character close-ups alternate with wide explanation panels
- "Float" effect - elements can exist between panels

Best For: Ohmsha-style tutorials, mobile reading, step-by-step guides
Best Style Pairings: ohmsha, vibrant`,
  },
];

export const COMIC_PRESETS: SkillOption[] = [
  {
    id: "ohmsha",
    name: "Ohmsha",
    name_zh: "欧姆社预设",
    description: "Educational manga with visual metaphors. Equivalent to --art manga --tone neutral",
    promptModifier: `Ohmsha preset - Educational manga with visual metaphors.

Base Configuration:
- Art Style: manga
- Tone: neutral
- Layout: webtoon (default)

Equivalent to: --art manga --tone neutral

Unique Rules (CRITICAL - ALL rules below must be applied):

Visual Metaphor Requirements:
Every technical concept MUST be visualized as a metaphor:
- Algorithm: Gadget/machine that demonstrates the process
- Data structure: Physical space characters can enter/explore
- Mathematical formula: Transformation visible in environment
- Abstract process: Tangible flow of particles/objects

Wrong approach: Character points at blackboard explaining
Right approach: Character uses "Concept Visualizer" gadget, steps into metaphorical space

Visual Metaphor Examples:
- Attention mechanism: "Attention Flashlight" gadget illuminates key words in dark room (NOT character points at formula on blackboard)
- Gradient descent: Character rides ball rolling down mountain valley (NOT "The algorithm minimizes loss")
- Neural network: Living network of glowing creatures passing messages (NOT diagram with arrows)
- Overfitting: Character wearing clothes that fit only one specific pose (NOT "The model memorized the data")

Character Roles (Required):
DEFAULT: Use Doraemon characters unless user explicitly specifies custom characters.
- Student (Role A): 大雄 (Nobita) - Boy, 10yo, round glasses, black hair, yellow shirt, navy shorts. Confused, asks basic but crucial questions, represents reader.
- Mentor (Role B): 哆啦A梦 (Doraemon) - Blue robot cat, white belly, 4D pocket, red nose, golden bell. Knowledgeable, patient, uses gadgets as technical metaphors.
- Challenge (Role C): 胖虎 (Gian) - Stocky boy, small eyes, orange shirt. Represents misunderstanding, or "noise" in the data.
- Support (Role D): 静香 (Shizuka) - Cute girl, black short hair, pink dress. Asks clarifying questions, provides alternative perspectives.

Page Title Convention:
Every page MUST have a narrative title (not section header):
- Wrong: "Chapter 1: Introduction to Transformers"
- Right: "The Day Nobita Couldn't Understand Anyone"

Gadget Reveal Pattern:
When introducing a concept:
1. Student expresses confusion with visual indicator (?, spiral eyes)
2. Mentor dramatically produces gadget with sparkle effects
3. Gadget name announced in bold with explanation
4. Demonstration begins - student enters metaphorical space

Ending Requirements:
Final page MUST include:
1. Student demonstrating understanding (applying the concept)
2. Callback to opening problem (now resolved)
3. Mentor's satisfied expression
4. Optional: hint at next topic

NO Talking Heads Rule (Critical):
Characters must DO things, not just explain. Every panel should show action being performed, metaphor being demonstrated, character interaction with concept-space. NOT: two characters facing each other talking.

Special Visual Elements:
- Gadget reveals: Dramatic unveiling with sparkle effects
- Concept spaces: Rounded borders, glowing edges for "imagination mode"
- Information displays: Holographic UI style for technical details
- Aha moments: Radial lines, light burst effects
- Confusion: Spiral eyes, question marks floating above head

Quality Markers:
- Every concept is a visual metaphor
- Characters are DOING things, not just talking
- Clear student/mentor dynamic
- Gadgets and props drive the explanation
- Expressive manga-style emotions
- Information density through visual design, not text walls
- Narrative page titles`,
  },
  {
    id: "wuxia",
    name: "Wuxia",
    name_zh: "武侠预设",
    description: "Hong Kong martial arts comic style. Equivalent to --art ink-brush --tone action",
    promptModifier: `Wuxia preset - Hong Kong martial arts comic style.

Base Configuration:
- Art Style: ink-brush
- Tone: action
- Layout: splash (default)

Equivalent to: --art ink-brush --tone action

Unique Rules (ALL rules below must be applied):

Qi/Energy Effects (Required):
Martial arts power must be visible through qi effects:
- Internal qi: Glowing aura around character
- External qi: Visible energy projection
- Qi clash: Radiating impact waves
- Qi absorption: Flowing particles toward character
- Hidden power: Subtle glow in eyes/fists

Energy Colors:
- Righteous: Blue (#4299E1), Gold (#FFD700)
- Fierce: Red (#DC2626), Orange (#EA580C)
- Evil: Purple (#7C3AED), Green (#16A34A)
- Pure: White, Silver
- Ancient: Gold with particles

Combat Visual Language:
Impact moments must include:
1. Speed lines radiating from impact point
2. Flying debris (stone, wood, cloth)
3. Shockwave rings
4. Dust/energy clouds
5. Hair and clothing blown back

Movement Depiction:
- Normal: Standard pose
- Fast: Motion blur, speed lines
- Lightning: Afterimages, multiple positions
- Teleport: Fade effect, particle trail

Environmental Integration:
Backgrounds must support action:
- Mountains: Crumbling peaks from impacts
- Forest: Exploding trees, flying leaves
- Water: Dramatic splashes, walking on water
- Temple: Breaking pillars, flying tiles
- Cliff: Dramatic falls, wind effects

Character Pose Guidelines:
- Dynamic warrior stances with weight distribution
- Flowing robes and hair showing movement
- Muscle tension visible in action
- Feet planted or in dynamic motion
- Traditional martial arts postures

Weapon Effects:
- Sword: Trailing light arc, blade glow
- Palm: Qi projection, wind effect
- Staff: Spinning blur, impact ripples
- Whip: Flowing energy trail

Atmospheric Elements (always include):
- Floating particles (leaves, petals, dust)
- Ink wash mist for depth
- Wind direction indicators
- Dramatic sky/weather when appropriate

Quality Markers:
- Dynamic action poses with sense of motion
- Ink brush aesthetic in line work
- Visible qi/energy effects
- High contrast dramatic lighting
- Atmospheric backgrounds with Chinese elements
- Flowing fabric and hair movement
- Impactful combat moments
- Speed lines and impact effects

Best For: Martial arts stories, Chinese historical fiction, wuxia/xianxia adaptations, action-heavy narratives`,
  },
  {
    id: "shoujo",
    name: "Shoujo",
    name_zh: "少女预设",
    description: "Classic shoujo manga with romantic aesthetics. Equivalent to --art manga --tone romantic",
    promptModifier: `Shoujo preset - Classic shoujo manga with romantic aesthetics.

Base Configuration:
- Art Style: manga
- Tone: romantic
- Layout: standard (default)

Equivalent to: --art manga --tone romantic

Unique Rules (ALL rules below must be applied):

Decorative Elements (Required):
Every emotional moment must include decorative elements:
- Love: Floating hearts, sparkles, rose petals
- Longing: Feathers, bubbles, distant sparkles
- Joy: Flowers blooming, light bursts, stars
- Sadness: Falling petals, fading sparkles
- Shyness: Soft sparkles, floating bubbles
- Realization: Radiating lines with sparkles

Eye Detail Requirements:
Eyes are critical in shoujo style:
- Size: Larger than standard manga (1.2x)
- Highlights: Multiple (3-5), placed for emotion
- Reflection: Scene reflection in emotional moments
- Sparkle: Built-in sparkle effects
- Tears: Crystalline, detailed teardrops

Character Beauty Standards:
- Hair: Flowing, detailed strands, shine highlights
- Skin: Porcelain, soft blush on cheeks
- Lips: Soft, slightly glossy
- Hands: Elegant, expressive gestures
- Posture: Graceful, elegant poses

Background Effects (abstract backgrounds for emotional moments):
- Love confession: Soft gradient + floating flowers
- Shock: Screen tone speed lines + sparkles
- Memory: Dreamy blur + scattered petals
- Realization: Radial lines + light burst
- Intimate: Soft focus + floating elements

Panel Flow:
- Overlap panels for intimate moments
- Break panel borders for emotional impact
- Float decorative elements between panels
- Use screen tone gradients for mood
- Irregular panel shapes for drama

Emotional Beat Timing (slow down pacing for emotional impact):
- Confession: Multiple small panels, then splash
- Eye contact: Close-up sequence
- Touch: Slow-motion panel breakdown
- Realization: Build-up panels then impact

Color Palette Application:
- Romantic: Pink, lavender, rose gold
- Happy: Soft yellow, peach, sky blue
- Sad: Pale blue, silver, gray lavender
- Dramatic: Deep rose, purple, contrast

Screen Tone Usage:
- Neutral: Clean, minimal
- Romantic: Soft gradient overlays
- Dramatic: Heavy contrast tones
- Dreamy: Soft dot patterns

Quality Markers:
- Large, sparkling detailed eyes
- Decorative elements in emotional moments
- Flowing, beautiful character designs
- Soft, pastel color palette
- Elegant panel compositions
- Screen tone mood effects
- Romantic atmosphere throughout
- Beautiful, expressive poses

Best For: Romance stories, coming-of-age, friendship narratives, school life, emotional drama, love stories`,
  },
];

export interface CompatibilityEntry {
  artStyle: string;
  best: string[];
  works: string[];
  avoid: string[];
}

export const COMPATIBILITY_MATRIX: CompatibilityEntry[] = [
  {
    artStyle: "ligne-claire",
    best: ["neutral", "warm"],
    works: ["dramatic", "vintage", "energetic"],
    avoid: ["romantic", "action"],
  },
  {
    artStyle: "manga",
    best: ["neutral", "romantic", "energetic", "action"],
    works: ["warm", "dramatic"],
    avoid: ["vintage"],
  },
  {
    artStyle: "realistic",
    best: ["neutral", "warm", "dramatic", "vintage"],
    works: ["action"],
    avoid: ["romantic", "energetic"],
  },
  {
    artStyle: "ink-brush",
    best: ["neutral", "dramatic", "action", "vintage"],
    works: ["warm"],
    avoid: ["romantic", "energetic"],
  },
  {
    artStyle: "chalk",
    best: ["neutral", "warm", "energetic"],
    works: ["vintage"],
    avoid: ["dramatic", "action", "romantic"],
  },
];
