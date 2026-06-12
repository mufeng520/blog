import type { SkillOption } from '../../types';

export const ANIMATION_SEQUENCE_STYLES: SkillOption[] = [
  {
    id: 'clean-vector',
    name: 'Clean Vector',
    name_zh: '清爽矢量',
    description: 'Flat, polished, product-friendly animation frames.',
    description_zh: '扁平、干净、适合产品展示的动画帧。',
    promptModifier: 'Use crisp vector shapes, clean edges, restrained shadows, stable color tokens, and readable silhouettes across all frames.',
  },
  {
    id: 'anime',
    name: 'Anime',
    name_zh: '动画番剧',
    description: 'Expressive characters and energetic poses.',
    description_zh: '强调角色表情、动作张力和镜头节奏。',
    promptModifier: 'Use expressive anime-inspired character design, dynamic poses, clean line art, cel shading, and consistent character proportions.',
  },
  {
    id: 'cinematic',
    name: 'Cinematic',
    name_zh: '电影感',
    description: 'Atmospheric lighting and shot-based storytelling.',
    description_zh: '强调光影、景深和电影分镜叙事。',
    promptModifier: 'Use cinematic lighting, coherent camera direction, depth, atmospheric composition, and film storyboard discipline.',
  },
  {
    id: 'storybook',
    name: 'Storybook',
    name_zh: '绘本',
    description: 'Warm illustrated scenes for narrative sequences.',
    description_zh: '温暖插画场景，适合故事型动画序列。',
    promptModifier: 'Use warm hand-illustrated storybook textures, gentle colors, clear narrative beats, and consistent charming characters.',
  },
  {
    id: 'motion-graphics',
    name: 'Motion Graphics',
    name_zh: '动态图形',
    description: 'Graphic transitions, icons, charts, and abstract motion.',
    description_zh: '适合图形转场、图标、图表和抽象运动。',
    promptModifier: 'Use bold graphic shapes, layered transitions, directional arrows, clean icons, kinetic typography cues, and precise spacing.',
  },
  {
    id: 'pixel-art',
    name: 'Pixel Art',
    name_zh: '像素动画',
    description: 'Sprite-like frames with limited palettes.',
    description_zh: '精灵图风格帧，有限色板和清晰像素边缘。',
    promptModifier: 'Use pixel-art sprites, limited palette, clear tile-like staging, readable frame-to-frame motion, and no anti-aliased blur.',
  },
];

export const ANIMATION_SEQUENCE_MOTIONS: SkillOption[] = [
  {
    id: 'subtle-loop',
    name: 'Subtle Loop',
    name_zh: '轻循环',
    description: 'Small looping motion such as breathing, floating, glowing, or idle movement.',
    description_zh: '呼吸、漂浮、发光、待机等轻量循环动作。',
    promptModifier: 'Design a seamless loop with small pose changes, repeatable start/end states, and no sudden jumps.',
  },
  {
    id: 'character-action',
    name: 'Character Action',
    name_zh: '角色动作',
    description: 'Character performs a readable action across keyframes.',
    description_zh: '角色在关键帧中完成一个明确动作。',
    promptModifier: 'Focus on anticipation, action, follow-through, consistent anatomy, and clear pose silhouettes.',
  },
  {
    id: 'camera-move',
    name: 'Camera Move',
    name_zh: '镜头运动',
    description: 'Pan, zoom, reveal, or parallax camera motion.',
    description_zh: '平移、推进、揭示或视差镜头运动。',
    promptModifier: 'Keep subject identity stable while the camera framing changes gradually through pan, zoom, reveal, or parallax cues.',
  },
  {
    id: 'transformation',
    name: 'Transformation',
    name_zh: '形态变化',
    description: 'Object, logo, UI, or scene transforms through stages.',
    description_zh: '物体、Logo、UI 或场景分阶段变化。',
    promptModifier: 'Show a clear transformation path with intermediate states, matching anchor points, and consistent materials.',
  },
  {
    id: 'explainer-flow',
    name: 'Explainer Flow',
    name_zh: '解释流程',
    description: 'Step-by-step visual explanation or process animation.',
    description_zh: '逐步解释流程、机制或概念。',
    promptModifier: 'Use numbered visual beats, diagram clarity, progressive reveal, and consistent labels or symbols when text is needed.',
  },
];

export const ANIMATION_SEQUENCE_FRAMINGS: SkillOption[] = [
  {
    id: 'wide',
    name: 'Wide',
    name_zh: '远景',
    description: 'Full scene and spatial context.',
    description_zh: '完整场景和空间关系。',
    promptModifier: 'Use wide shots that preserve full-body or full-object visibility and clear spatial staging.',
  },
  {
    id: 'medium',
    name: 'Medium',
    name_zh: '中景',
    description: 'Balanced subject and environment.',
    description_zh: '主体和环境比例均衡。',
    promptModifier: 'Use medium framing with the main subject dominant but enough surrounding context for motion readability.',
  },
  {
    id: 'close-up',
    name: 'Close Up',
    name_zh: '特写',
    description: 'Focus on emotion, detail, or product interaction.',
    description_zh: '聚焦情绪、细节或产品交互。',
    promptModifier: 'Use close-up framing focused on facial expression, hand interaction, object detail, or UI micro-motion.',
  },
  {
    id: 'mixed',
    name: 'Mixed Shots',
    name_zh: '混合镜头',
    description: 'Vary framing across the sequence.',
    description_zh: '序列中混合远景、中景和特写。',
    promptModifier: 'Use a storyboard mix of wide, medium, and close-up shots while preserving visual continuity.',
  },
];

export const ANIMATION_SEQUENCE_CONTINUITY: SkillOption[] = [
  {
    id: 'strict',
    name: 'Strict',
    name_zh: '严格连续',
    description: 'Prioritize exact character, object, and style continuity.',
    description_zh: '优先保持角色、物体和风格完全连续。',
    promptModifier: 'Maintain strict continuity: same character design, outfit, colors, proportions, props, lighting direction, and environment across frames.',
  },
  {
    id: 'flexible',
    name: 'Flexible',
    name_zh: '灵活连续',
    description: 'Allow small visual changes for stronger composition.',
    description_zh: '允许少量变化以换取更好的画面表现。',
    promptModifier: 'Maintain general continuity while allowing small composition and pose adjustments for stronger readability.',
  },
];
