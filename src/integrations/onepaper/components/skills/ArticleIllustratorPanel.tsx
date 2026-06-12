import React from 'react';
import type { ArticleIllustratorConfig, LangType } from '../../types';
import DesignMdSelector, { type SelectorOption } from '../DesignMdSelector';

interface Props {
  config: ArticleIllustratorConfig;
  onChange: (config: ArticleIllustratorConfig) => void;
  lang: LangType;
}

const toOptions = (arr: any[]): SelectorOption[] => arr.map(t => ({
  id: t.id, name: t.name, name_zh: t.name_zh,
  description: t.description || '', description_zh: t.description_zh || '',
  content: t.promptModifier || ''
}));

const ARTICLE_TYPES = [
  { id: 'infographic', name: 'Infographic', name_zh: '信息图', description: 'Data, metrics', promptModifier: '' },
  { id: 'scene', name: 'Scene', name_zh: '场景', description: 'Narratives, emotional', promptModifier: '' },
  { id: 'flowchart', name: 'Flowchart', name_zh: '流程图', description: 'Processes, workflows', promptModifier: '' },
  { id: 'comparison', name: 'Comparison', name_zh: '对比', description: 'Side-by-side', promptModifier: '' },
  { id: 'framework', name: 'Framework', name_zh: '框架', description: 'Models, architecture', promptModifier: '' },
  { id: 'timeline', name: 'Timeline', name_zh: '时间线', description: 'History, evolution', promptModifier: '' },
];

const ARTICLE_STYLES = [
  { id: 'notion', name: 'Notion', name_zh: 'Notion', description: 'Minimal line art', promptModifier: '' },
  { id: 'warm', name: 'Warm', name_zh: '温馨', description: 'Friendly, approachable', promptModifier: '' },
  { id: 'minimal', name: 'Minimal', name_zh: '极简', description: 'Clean, whitespace', promptModifier: '' },
  { id: 'blueprint', name: 'Blueprint', name_zh: '蓝图', description: 'Technical schematic', promptModifier: '' },
  { id: 'watercolor', name: 'Watercolor', name_zh: '水彩', description: 'Soft washes', promptModifier: '' },
  { id: 'elegant', name: 'Elegant', name_zh: '优雅', description: 'Sophisticated', promptModifier: '' },
];

const ARTICLE_DENSITIES = [
  { id: 'minimal', name: 'Minimal', name_zh: '最少', description: '1-2 images', promptModifier: '' },
  { id: 'balanced', name: 'Balanced', name_zh: '平衡', description: '3-5 images', promptModifier: '' },
  { id: 'per-section', name: 'Per Section', name_zh: '每节一图', description: 'Section-based', promptModifier: '' },
  { id: 'rich', name: 'Rich', name_zh: '丰富', description: '6+ images', promptModifier: '' },
];

export const ArticleIllustratorPanel: React.FC<Props> = ({ config, onChange, lang }) => {
  const update = (partial: Partial<ArticleIllustratorConfig>) => {
    onChange({ ...config, ...partial });
  };

  return (
    <div className="space-y-4">
      <DesignMdSelector
        selectedId={config.type}
        onSelect={(id: string | null) => id && update({ type: id as any })}
        lang={lang}
        options={toOptions(ARTICLE_TYPES)}
        label="Type" label_zh="插图类型"
        showPreview={false} showClear={false} confirmOnSelect
        favoritesKey="skill-article-type"
      />

      <DesignMdSelector
        selectedId={config.style}
        onSelect={(id: string | null) => id && update({ style: id })}
        lang={lang}
        options={toOptions(ARTICLE_STYLES)}
        label="Style" label_zh="视觉风格"
        showPreview={false} showClear={false} confirmOnSelect
        favoritesKey="skill-article-style"
      />

      <DesignMdSelector
        selectedId={config.density}
        onSelect={(id: string | null) => id && update({ density: id as any })}
        lang={lang}
        options={toOptions(ARTICLE_DENSITIES)}
        label="Density" label_zh="插图密度"
        showPreview={false} showClear={false} confirmOnSelect
        favoritesKey="skill-article-density"
      />
    </div>
  );
};
