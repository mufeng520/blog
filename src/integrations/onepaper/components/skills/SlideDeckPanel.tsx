import React from 'react';
import type { SlideDeckConfig, LangType } from '../../types';
import DesignMdSelector, { type SelectorOption } from '../DesignMdSelector';

interface Props {
  config: SlideDeckConfig;
  onChange: (config: SlideDeckConfig) => void;
  lang: LangType;
}

const toOptions = (arr: any[]): SelectorOption[] => arr.map(t => ({
  id: t.id, name: t.name, name_zh: t.name_zh,
  description: t.description || '', description_zh: t.description_zh || '',
  content: t.promptModifier || ''
}));

const SLIDE_PRESETS = [
  { id: 'blueprint', name: 'Blueprint', name_zh: '工程蓝图', description: 'Technical, grid', promptModifier: '' },
  { id: 'chalkboard', name: 'Chalkboard', name_zh: '黑板', description: 'Education, tutorials', promptModifier: '' },
  { id: 'corporate', name: 'Corporate', name_zh: '商务', description: 'Investor decks', promptModifier: '' },
  { id: 'minimal', name: 'Minimal', name_zh: '极简', description: 'Executive briefings', promptModifier: '' },
  { id: 'sketch-notes', name: 'Sketch', name_zh: '草图笔记', description: 'Educational', promptModifier: '' },
  { id: 'watercolor', name: 'Watercolor', name_zh: '水彩', description: 'Lifestyle', promptModifier: '' },
  { id: 'dark-atmospheric', name: 'Dark', name_zh: '暗黑氛围', description: 'Gaming, entertainment', promptModifier: '' },
  { id: 'notion', name: 'Notion', name_zh: 'Notion', description: 'Product demos', promptModifier: '' },
  { id: 'bold-editorial', name: 'Bold', name_zh: ' bold', description: 'Product launches', promptModifier: '' },
  { id: 'editorial-infographic', name: 'Infographic', name_zh: '信息图', description: 'Tech explainers', promptModifier: '' },
  { id: 'fantasy-animation', name: 'Fantasy', name_zh: '奇幻', description: 'Storytelling', promptModifier: '' },
  { id: 'intuition-machine', name: 'Intuition', name_zh: '直觉机器', description: 'Technical docs', promptModifier: '' },
  { id: 'pixel-art', name: 'Pixel', name_zh: '像素', description: 'Gaming talks', promptModifier: '' },
  { id: 'scientific', name: 'Scientific', name_zh: '科学', description: 'Medical, biology', promptModifier: '' },
  { id: 'vector-illustration', name: 'Vector', name_zh: '矢量插画', description: 'Creative content', promptModifier: '' },
  { id: 'vintage', name: 'Vintage', name_zh: '复古', description: 'Historical', promptModifier: '' },
];

const SLIDE_AUDIENCES = [
  { id: 'general', name: 'General', name_zh: '通用', description: 'Broad appeal', promptModifier: '' },
  { id: 'beginners', name: 'Beginners', name_zh: '初学者', description: 'Educational focus', promptModifier: '' },
  { id: 'intermediate', name: 'Intermediate', name_zh: '中级', description: 'Some knowledge', promptModifier: '' },
  { id: 'experts', name: 'Experts', name_zh: '专家', description: 'Technical depth', promptModifier: '' },
  { id: 'executives', name: 'Executives', name_zh: '高管', description: 'High-level insights', promptModifier: '' },
];

export const SlideDeckPanel: React.FC<Props> = ({ config, onChange, lang }) => {
  const update = (partial: Partial<SlideDeckConfig>) => {
    onChange({ ...config, ...partial });
  };

  return (
    <div className="space-y-4">
      <DesignMdSelector
        selectedId={config.preset}
        onSelect={(id: string | null) => id && update({ preset: id as any })}
        lang={lang}
        options={toOptions(SLIDE_PRESETS)}
        label="Style Preset" label_zh="风格预设"
        showPreview={false} showClear={false} confirmOnSelect
        favoritesKey="skill-slide-preset"
      />

      <DesignMdSelector
        selectedId={config.audience}
        onSelect={(id: string | null) => id && update({ audience: id as any })}
        lang={lang}
        options={toOptions(SLIDE_AUDIENCES)}
        label="Audience" label_zh="目标受众"
        showPreview={false} showClear={false} confirmOnSelect
        favoritesKey="skill-slide-audience"
      />
    </div>
  );
};
