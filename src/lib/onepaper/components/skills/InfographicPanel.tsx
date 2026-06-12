import React from 'react';
import type { InfographicConfig, LangType } from '../../types';
import GenericOptionSelector, { type SelectorOption } from './shared/GenericOptionSelector';

interface Props {
  config: InfographicConfig;
  onChange: (config: InfographicConfig) => void;
  lang: LangType;
}

const toOptions = (arr: any[]): SelectorOption[] => arr.map(t => ({
  id: t.id, name: t.name, name_zh: t.name_zh,
  description: t.description || '', description_zh: t.description_zh || '',
  content: t.promptModifier || ''
}));

const INFOGRAPHIC_LAYOUTS = [
  { id: 'linear-progression', name: 'Linear', name_zh: '线性推进', description: 'Timeline, process', promptModifier: '' },
  { id: 'binary-comparison', name: 'Comparison', name_zh: '二元对比', description: 'A vs B', promptModifier: '' },
  { id: 'comparison-matrix', name: 'Matrix', name_zh: '对比矩阵', description: 'Multi-factor', promptModifier: '' },
  { id: 'hierarchical-layers', name: 'Hierarchy', name_zh: '层级结构', description: 'Pyramids', promptModifier: '' },
  { id: 'tree-branching', name: 'Tree', name_zh: '树状分支', description: 'Categories', promptModifier: '' },
  { id: 'hub-spoke', name: 'Hub-Spoke', name_zh: '中心辐射', description: 'Central concept', promptModifier: '' },
  { id: 'structural-breakdown', name: 'Structural', name_zh: '结构分解', description: 'Exploded view', promptModifier: '' },
  { id: 'bento-grid', name: 'Bento Grid', name_zh: 'Bento 网格', description: 'Multiple topics', promptModifier: '' },
  { id: 'iceberg', name: 'Iceberg', name_zh: '冰山', description: 'Surface vs hidden', promptModifier: '' },
  { id: 'bridge', name: 'Bridge', name_zh: '桥梁', description: 'Problem-solution', promptModifier: '' },
  { id: 'funnel', name: 'Funnel', name_zh: '漏斗', description: 'Conversion', promptModifier: '' },
  { id: 'isometric-map', name: 'Isometric', name_zh: '等轴地图', description: 'Spatial', promptModifier: '' },
  { id: 'dashboard', name: 'Dashboard', name_zh: '仪表盘', description: 'Metrics, KPIs', promptModifier: '' },
  { id: 'periodic-table', name: 'Periodic', name_zh: '周期表', description: 'Collections', promptModifier: '' },
  { id: 'comic-strip', name: 'Comic', name_zh: '漫画条', description: 'Narrative', promptModifier: '' },
  { id: 'story-mountain', name: 'Story Mt', name_zh: '故事山', description: 'Plot arc', promptModifier: '' },
  { id: 'jigsaw', name: 'Jigsaw', name_zh: '拼图', description: 'Interconnected', promptModifier: '' },
  { id: 'venn-diagram', name: 'Venn', name_zh: '韦恩图', description: 'Overlapping', promptModifier: '' },
  { id: 'winding-roadmap', name: 'Roadmap', name_zh: '路线图', description: 'Journey', promptModifier: '' },
  { id: 'circular-flow', name: 'Circular', name_zh: '循环流', description: 'Cycles', promptModifier: '' },
  { id: 'dense-modules', name: 'Dense', name_zh: '高密度', description: 'Data-rich', promptModifier: '' },
];

const INFOGRAPHIC_STYLES = [
  { id: 'craft-handmade', name: 'Craft', name_zh: '手工纸艺', description: 'Hand-drawn, warm', promptModifier: '' },
  { id: 'claymation', name: 'Clay', name_zh: '黏土', description: '3D clay figures', promptModifier: '' },
  { id: 'kawaii', name: 'Kawaii', name_zh: '可爱', description: 'Japanese cute', promptModifier: '' },
  { id: 'storybook-watercolor', name: 'Watercolor', name_zh: '水彩绘本', description: 'Soft painted', promptModifier: '' },
  { id: 'chalkboard', name: 'Chalkboard', name_zh: '黑板', description: 'Chalk on black', promptModifier: '' },
  { id: 'cyberpunk-neon', name: 'Cyberpunk', name_zh: '赛博朋克', description: 'Neon glow', promptModifier: '' },
  { id: 'bold-graphic', name: 'Bold', name_zh: ' bold', description: 'Comic style', promptModifier: '' },
  { id: 'aged-academia', name: 'Academia', name_zh: '学术复古', description: 'Vintage science', promptModifier: '' },
  { id: 'corporate-memphis', name: 'Memphis', name_zh: '孟菲斯', description: 'Flat vector', promptModifier: '' },
  { id: 'technical-schematic', name: 'Technical', name_zh: '技术蓝图', description: 'Blueprint', promptModifier: '' },
  { id: 'origami', name: 'Origami', name_zh: '折纸', description: 'Folded paper', promptModifier: '' },
  { id: 'pixel-art', name: 'Pixel', name_zh: '像素', description: '8-bit retro', promptModifier: '' },
  { id: 'ui-wireframe', name: 'Wireframe', name_zh: '线框', description: 'Grayscale mockup', promptModifier: '' },
  { id: 'subway-map', name: 'Subway', name_zh: '地铁图', description: 'Transit diagram', promptModifier: '' },
  { id: 'ikea-manual', name: 'IKEA', name_zh: '宜家手册', description: 'Minimal line', promptModifier: '' },
  { id: 'knolling', name: 'Knolling', name_zh: '平铺', description: 'Organized flat-lay', promptModifier: '' },
  { id: 'lego-brick', name: 'Lego', name_zh: '乐高', description: 'Toy bricks', promptModifier: '' },
  { id: 'pop-laboratory', name: 'Lab', name_zh: '实验室', description: 'Blueprint grid', promptModifier: '' },
  { id: 'morandi-journal', name: 'Morandi', name_zh: '莫兰迪', description: 'Warm doodle', promptModifier: '' },
  { id: 'retro-pop-grid', name: 'Retro Pop', name_zh: '复古波普', description: '70s pop art', promptModifier: '' },
];

const ASPECT_OPTIONS = [
  { id: 'landscape', name: 'Landscape', name_zh: '横版 (16:9)', description: '', promptModifier: '' },
  { id: 'portrait', name: 'Portrait', name_zh: '竖版 (9:16)', description: '', promptModifier: '' },
  { id: 'square', name: 'Square', name_zh: '方形 (1:1)', description: '', promptModifier: '' },
];

export const InfographicPanel: React.FC<Props> = ({ config, onChange, lang }) => {
  const update = (partial: Partial<InfographicConfig>) => {
    onChange({ ...config, ...partial });
  };

  return (
    <div className="space-y-4">
      <GenericOptionSelector
        selectedId={config.layout}
        onSelect={(id: string | null) => id && update({ layout: id as any })}
        lang={lang}
        options={toOptions(INFOGRAPHIC_LAYOUTS)}
        label="Layout" label_zh="布局结构"
        showPreview={false} showClear={false} confirmOnSelect
        favoritesKey="skill-info-layout"
      />

      <GenericOptionSelector
        selectedId={config.style}
        onSelect={(id: string | null) => id && update({ style: id as any })}
        lang={lang}
        options={toOptions(INFOGRAPHIC_STYLES)}
        label="Style" label_zh="视觉风格"
        showPreview={false} showClear={false} confirmOnSelect
        favoritesKey="skill-info-style"
      />

      <GenericOptionSelector
        selectedId={config.aspect}
        onSelect={(id: string | null) => id && update({ aspect: id as any })}
        lang={lang}
        options={toOptions(ASPECT_OPTIONS)}
        label="Aspect Ratio" label_zh="宽高比"
        showPreview={false} showClear={false} confirmOnSelect
        favoritesKey="skill-info-aspect"
      />
    </div>
  );
};
