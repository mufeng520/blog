import React from 'react';
import type { AnimationSequenceConfig, LangType } from '../../types';
import {
  ANIMATION_SEQUENCE_CONTINUITY,
  ANIMATION_SEQUENCE_FRAMINGS,
  ANIMATION_SEQUENCE_MOTIONS,
  ANIMATION_SEQUENCE_STYLES,
} from '../../skills/animation-sequence/constants';
import GenericOptionSelector, { type SelectorOption } from './shared/GenericOptionSelector';

interface Props {
  config: AnimationSequenceConfig;
  onChange: (config: AnimationSequenceConfig) => void;
  lang: LangType;
}

const toOptions = (arr: any[]): SelectorOption[] => arr.map(item => ({
  id: item.id,
  name: item.name,
  name_zh: item.name_zh,
  description: item.description || '',
  description_zh: item.description_zh || '',
  content: item.promptModifier || '',
}));

const ASPECT_OPTIONS = [
  { id: '16:9', name: '16:9 Landscape', name_zh: '16:9 横屏', description: 'Video, presentation, web hero' },
  { id: '9:16', name: '9:16 Vertical', name_zh: '9:16 竖屏', description: 'Short video, mobile story' },
  { id: '1:1', name: '1:1 Square', name_zh: '1:1 方形', description: 'Social posts and compact loops' },
  { id: '4:3', name: '4:3 Classic', name_zh: '4:3 经典', description: 'Storyboard and presentation frames' },
  { id: '3:4', name: '3:4 Portrait', name_zh: '3:4 竖构图', description: 'Character and poster-style motion' },
];

const clampNumber = (value: number, min: number, max: number) => Math.max(min, Math.min(max, value));

export const AnimationSequencePanel: React.FC<Props> = ({ config, onChange, lang }) => {
  const isZh = lang === 'zh';
  const update = (partial: Partial<AnimationSequenceConfig>) => {
    onChange({ ...config, ...partial });
  };

  const numberInputClass = 'w-full bg-stone-100 dark:bg-stone-800 border border-stone-300 dark:border-stone-700 rounded-lg px-3 py-2 text-sm text-stone-800 dark:text-stone-200 focus:outline-none focus:ring-2 focus:ring-teal-500/40';

  return (
    <div className="space-y-4">
      <GenericOptionSelector
        selectedId={config.style}
        onSelect={(id: string | null) => id && update({ style: id as AnimationSequenceConfig['style'] })}
        lang={lang}
        options={toOptions(ANIMATION_SEQUENCE_STYLES)}
        label="Visual Style"
        label_zh="视觉风格"
        showPreview={false}
        showClear={false}
        confirmOnSelect
        favoritesKey="skill-animation-style"
      />

      <GenericOptionSelector
        selectedId={config.motion}
        onSelect={(id: string | null) => id && update({ motion: id as AnimationSequenceConfig['motion'] })}
        lang={lang}
        options={toOptions(ANIMATION_SEQUENCE_MOTIONS)}
        label="Motion Type"
        label_zh="运动类型"
        showPreview={false}
        showClear={false}
        confirmOnSelect
        favoritesKey="skill-animation-motion"
      />

      <div className="grid grid-cols-2 gap-3">
        <GenericOptionSelector
          selectedId={config.framing}
          onSelect={(id: string | null) => id && update({ framing: id as AnimationSequenceConfig['framing'] })}
          lang={lang}
          options={toOptions(ANIMATION_SEQUENCE_FRAMINGS)}
          label="Framing"
          label_zh="镜头"
          showPreview={false}
          showClear={false}
          showFavorites={false}
          showSearch={false}
          confirmOnSelect
        />

        <GenericOptionSelector
          selectedId={config.continuity}
          onSelect={(id: string | null) => id && update({ continuity: id as AnimationSequenceConfig['continuity'] })}
          lang={lang}
          options={toOptions(ANIMATION_SEQUENCE_CONTINUITY)}
          label="Continuity"
          label_zh="连续性"
          showPreview={false}
          showClear={false}
          showFavorites={false}
          showSearch={false}
          confirmOnSelect
        />
      </div>

      <GenericOptionSelector
        selectedId={config.aspect}
        onSelect={(id: string | null) => id && update({ aspect: id as AnimationSequenceConfig['aspect'] })}
        lang={lang}
        options={toOptions(ASPECT_OPTIONS)}
        label="Aspect Ratio"
        label_zh="画幅比例"
        showPreview={false}
        showClear={false}
        showFavorites={false}
        showSearch={false}
        confirmOnSelect
      />

      <label className="block space-y-1.5">
        <span className="block text-xs font-bold uppercase text-stone-500">
          {isZh ? '关键帧数' : 'Keyframes'}
        </span>
        <input
          type="number"
          min={4}
          max={24}
          value={config.frameCount}
          onChange={event => update({ frameCount: clampNumber(Number(event.target.value) || 4, 4, 24) })}
          className={numberInputClass}
        />
      </label>
    </div>
  );
};
