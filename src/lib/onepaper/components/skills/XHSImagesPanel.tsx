import React from 'react';
import type { XHSImagesConfig, LangType } from '../../types';
import GenericOptionSelector, { type SelectorOption } from './shared/GenericOptionSelector';

interface Props {
  config: XHSImagesConfig;
  onChange: (config: XHSImagesConfig) => void;
  lang: LangType;
}

const toOptions = (arr: any[]): SelectorOption[] => arr.map(t => ({
  id: t.id, name: t.name, name_zh: t.name_zh,
  description: t.description || '', description_zh: t.description_zh || '',
  content: t.promptModifier || ''
}));

const XHS_STYLES = [
  { id: 'cute', name: 'Cute', name_zh: '可爱', description: 'Sweet, girly', promptModifier: '' },
  { id: 'fresh', name: 'Fresh', name_zh: '清新', description: 'Clean, natural', promptModifier: '' },
  { id: 'warm', name: 'Warm', name_zh: '温馨', description: 'Cozy, friendly', promptModifier: '' },
  { id: 'bold', name: 'Bold', name_zh: ' bold', description: 'High impact', promptModifier: '' },
  { id: 'minimal', name: 'Minimal', name_zh: '极简', description: 'Ultra-clean', promptModifier: '' },
  { id: 'retro', name: 'Retro', name_zh: '复古', description: 'Vintage', promptModifier: '' },
  { id: 'pop', name: 'Pop', name_zh: '活力', description: 'Vibrant, energetic', promptModifier: '' },
  { id: 'notion', name: 'Notion', name_zh: 'Notion 风', description: 'Minimal line art', promptModifier: '' },
  { id: 'chalkboard', name: 'Chalkboard', name_zh: '黑板', description: 'Colorful chalk', promptModifier: '' },
  { id: 'study-notes', name: 'Study Notes', name_zh: '手写笔记', description: 'Realistic handwritten', promptModifier: '' },
];

const XHS_LAYOUTS = [
  { id: 'sparse', name: 'Sparse', name_zh: '稀疏', description: '1-2 points', promptModifier: '' },
  { id: 'balanced', name: 'Balanced', name_zh: '平衡', description: '3-4 points', promptModifier: '' },
  { id: 'dense', name: 'Dense', name_zh: '高密度', description: '5-8 points', promptModifier: '' },
  { id: 'list', name: 'List', name_zh: '列表', description: 'Enumeration', promptModifier: '' },
  { id: 'comparison', name: 'Comparison', name_zh: '对比', description: 'Side-by-side', promptModifier: '' },
  { id: 'flow', name: 'Flow', name_zh: '流程', description: 'Timeline', promptModifier: '' },
  { id: 'mindmap', name: 'Mindmap', name_zh: '思维导图', description: 'Radial', promptModifier: '' },
  { id: 'quadrant', name: 'Quadrant', name_zh: '四象限', description: 'Four sections', promptModifier: '' },
];

const XHS_STRATEGIES = [
  { id: 'story-driven', name: 'Story', name_zh: '故事驱动', description: 'Personal experience, emotional', promptModifier: '' },
  { id: 'info-dense', name: 'Info', name_zh: '信息密集', description: 'Value-first, structured', promptModifier: '' },
  { id: 'visual-first', name: 'Visual', name_zh: '视觉优先', description: 'Impact, minimal text', promptModifier: '' },
];

export const XHSImagesPanel: React.FC<Props> = ({ config, onChange, lang }) => {
  const update = (partial: Partial<XHSImagesConfig>) => {
    onChange({ ...config, ...partial });
  };

  return (
    <div className="space-y-4">
      <GenericOptionSelector
        selectedId={config.style}
        onSelect={(id: string | null) => id && update({ style: id as any })}
        lang={lang}
        options={toOptions(XHS_STYLES)}
        label="Style" label_zh="视觉风格"
        showPreview={false} showClear={false} confirmOnSelect
        favoritesKey="skill-xhs-style"
      />

      <GenericOptionSelector
        selectedId={config.layout}
        onSelect={(id: string | null) => id && update({ layout: id as any })}
        lang={lang}
        options={toOptions(XHS_LAYOUTS)}
        label="Layout" label_zh="信息布局"
        showPreview={false} showClear={false} confirmOnSelect
        favoritesKey="skill-xhs-layout"
      />

      <GenericOptionSelector
        selectedId={config.strategy}
        onSelect={(id: string | null) => id && update({ strategy: id as any })}
        lang={lang}
        options={toOptions(XHS_STRATEGIES)}
        label="Strategy" label_zh="内容策略"
        showPreview={false} showClear={false} confirmOnSelect
        favoritesKey="skill-xhs-strategy"
      />
    </div>
  );
};
