import React from 'react';
import { CircleDot, Grid3X3, ScanFace, Type } from 'lucide-react';
import type { LangType, StickerDesignConfig, StickerFormat, StickerTextStyle } from '../../types';
import GenericOptionSelector, { type SelectorOption } from './shared/GenericOptionSelector';
import {
  STICKER_ASPECTS,
  STICKER_BACKGROUNDS,
  STICKER_FORMATS,
  STICKER_SHAPES,
  STICKER_SIZES,
  STICKER_STYLES,
  STICKER_TEXT_STYLES,
  STICKER_THEMES,
} from '../../skills/sticker-design/constants';

interface Props {
  config: StickerDesignConfig;
  onChange: (config: StickerDesignConfig) => void;
  lang: LangType;
}

const toOptions = (arr: any[]): SelectorOption[] => arr.map(t => ({
  id: t.id,
  name: t.name,
  name_zh: t.name_zh,
  description: t.description || '',
  description_zh: t.description_zh || '',
  content: t.promptModifier || '',
}));

const clampSheetCount = (count: number | undefined) => Math.max(2, Math.min(12, Math.round(count || 6)));

const getFormat = (config: StickerDesignConfig): StickerFormat => {
  if (config.format) return config.format;
  return config.size === 'sheet' ? 'sheet' : 'single';
};

const findOptionLabel = (arr: any[], id: string | undefined, isZh: boolean): string => {
  const item = arr.find(option => option.id === id);
  if (!item) return id || '';
  return isZh ? item.name_zh : item.name;
};

interface SettingSwitchProps {
  checked: boolean;
  onChange: () => void;
  icon: React.ComponentType<{ className?: string; 'aria-hidden'?: boolean }>;
  label: string;
  description: string;
}

const SettingSwitch: React.FC<SettingSwitchProps> = ({ checked, onChange, icon: Icon, label, description }) => (
  <button
    type="button"
    onClick={onChange}
    className={`w-full rounded-xl border px-3 py-3 text-left transition-colors ${
      checked
        ? 'border-teal-500 bg-teal-50 dark:bg-teal-900/20'
        : 'border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-900 hover:border-stone-300 dark:hover:border-stone-600'
    }`}
    role="switch"
    aria-checked={checked}
  >
    <div className="flex items-center gap-3">
      <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
        checked
          ? 'bg-teal-100 dark:bg-teal-900/40 text-teal-600 dark:text-teal-300'
          : 'bg-stone-100 dark:bg-stone-800 text-stone-400'
      }`}>
        <Icon className="w-4 h-4" aria-hidden="true" />
      </div>
      <div className="min-w-0 flex-1">
        <div className={`text-xs font-semibold ${
          checked
            ? 'text-teal-700 dark:text-teal-300'
            : 'text-stone-700 dark:text-stone-200'
        }`}>
          {label}
        </div>
        <p className="mt-0.5 text-[11px] leading-relaxed text-stone-500 dark:text-stone-400">
          {description}
        </p>
      </div>
      <span className={`relative inline-flex h-5 w-9 shrink-0 rounded-full transition-colors ${
        checked ? 'bg-teal-500' : 'bg-stone-300 dark:bg-stone-700'
      }`}>
        <span className={`absolute top-0.5 h-4 w-4 rounded-full bg-white shadow transition-transform ${
          checked ? 'translate-x-4' : 'translate-x-0.5'
        }`} />
      </span>
    </div>
  </button>
);

export const StickerDesignPanel: React.FC<Props> = ({ config, onChange, lang }) => {
  const isZh = lang === 'zh';
  const format = getFormat(config);
  const sheetCount = clampSheetCount(config.sheetCount);
  const textStyle = config.textStyle || 'none';
  const whiteBorder = config.whiteBorder ?? true;
  const facialFeatures = config.facialFeatures ?? true;
  const summaryItems = [
    findOptionLabel(STICKER_FORMATS, format, isZh),
    findOptionLabel(STICKER_STYLES, config.style, isZh),
    findOptionLabel(STICKER_THEMES, config.theme, isZh),
    config.aspect,
  ].filter(Boolean);

  const update = (partial: Partial<StickerDesignConfig>) => {
    onChange({ ...config, ...partial });
  };

  const updateFormat = (nextFormat: StickerFormat) => {
    update({
      format: nextFormat,
      size: nextFormat === 'sheet' ? 'sheet' : (config.size === 'sheet' ? 'medium' : config.size),
      aspect: nextFormat === 'three-views' ? '4:3' : config.aspect,
    });
  };

  const updateTextStyle = (nextStyle: StickerTextStyle) => {
    update({
      textStyle: nextStyle,
      text: nextStyle === 'none' ? '' : config.text,
    });
  };

  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-900/60 p-3">
        <div className="flex items-start gap-3">
          <div className="w-9 h-9 rounded-lg bg-teal-100 dark:bg-teal-900/40 text-teal-600 dark:text-teal-300 flex items-center justify-center shrink-0">
            <CircleDot className="w-4 h-4" aria-hidden="true" />
          </div>
          <div className="min-w-0">
            <div className="text-sm font-semibold text-stone-800 dark:text-stone-100">
              {isZh ? '贴纸模式' : 'Sticker Mode'}
            </div>
            <p className="mt-1 text-xs leading-relaxed text-stone-500 dark:text-stone-400">
              {summaryItems.join(' / ')}
            </p>
          </div>
        </div>
      </div>

      <GenericOptionSelector
        selectedId={format}
        onSelect={(id: string | null) => id && updateFormat(id as StickerFormat)}
        lang={lang}
        options={toOptions(STICKER_FORMATS)}
        label="Output Format"
        label_zh="输出格式"
        modalTitle="Sticker Output Format"
        modalTitle_zh="贴纸输出格式"
        modalSubtitle="Choose the production shape before tuning style details."
        modalSubtitle_zh="先确定生成形态，再细调风格与画布。"
        showPreview={false}
        showClear={false}
        confirmOnSelect
        favoritesKey="skill-sticker-format"
      />

      <GenericOptionSelector
        selectedId={config.style}
        onSelect={(id: string | null) => id && update({ style: id as any })}
        lang={lang}
        options={toOptions(STICKER_STYLES)}
        label="Style"
        label_zh="视觉风格"
        showPreview={false}
        showClear={false}
        confirmOnSelect
        favoritesKey="skill-sticker-style"
      />

      <GenericOptionSelector
        selectedId={config.theme}
        onSelect={(id: string | null) => id && update({ theme: id as any })}
        lang={lang}
        options={toOptions(STICKER_THEMES)}
        label="Subject Type"
        label_zh="主体类型"
        showPreview={false}
        showClear={false}
        confirmOnSelect
        favoritesKey="skill-sticker-theme"
      />

      <div className="space-y-3">
        <div>
          <label className="block text-xs font-medium text-stone-500 dark:text-stone-400 mb-1.5">
            {isZh ? '主体名称（可选）' : 'Subject Name (optional)'}
          </label>
          <input
            type="text"
            value={config.subjectName}
            onChange={(event) => update({ subjectName: event.target.value })}
            placeholder={isZh ? '例如：咖啡杯小人、云朵猫、品牌吉祥物' : 'e.g. coffee mascot, cloud cat, brand character'}
            className="w-full px-3 py-2 text-sm rounded-lg border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800 text-stone-800 dark:text-stone-200 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-teal-500/30"
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-stone-500 dark:text-stone-400 mb-1.5">
            {isZh ? '表情或动作（可选）' : 'Expression or Action (optional)'}
          </label>
          <input
            type="text"
            value={config.expression}
            onChange={(event) => update({ expression: event.target.value })}
            placeholder={isZh ? '例如：开心挥手、困倦、惊讶、比心' : 'e.g. waving happily, sleepy, surprised, heart gesture'}
            className="w-full px-3 py-2 text-sm rounded-lg border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800 text-stone-800 dark:text-stone-200 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-teal-500/30"
          />
        </div>
      </div>

      <GenericOptionSelector
        selectedId={config.shape}
        onSelect={(id: string | null) => id && update({ shape: id as any })}
        lang={lang}
        options={toOptions(STICKER_SHAPES)}
        label="Cut Shape"
        label_zh="模切形状"
        showPreview={false}
        showClear={false}
        confirmOnSelect
        favoritesKey="skill-sticker-shape"
      />

      {format !== 'sheet' && (
        <GenericOptionSelector
          selectedId={config.size === 'sheet' ? 'medium' : config.size}
          onSelect={(id: string | null) => id && update({ size: id as any })}
          lang={lang}
          options={toOptions(STICKER_SIZES.filter(option => option.id !== 'sheet'))}
          label="Physical Size"
          label_zh="成品尺寸"
          showPreview={false}
          showClear={false}
          confirmOnSelect
          favoritesKey="skill-sticker-size"
        />
      )}

      {format === 'sheet' && (
        <div className="space-y-3 rounded-xl border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-900/50 p-3">
          <div className="flex items-center justify-between gap-3">
            <div className="min-w-0">
              <div className="flex items-center gap-1.5 text-sm font-medium text-stone-700 dark:text-stone-200">
                <Grid3X3 className="w-4 h-4 text-teal-500" aria-hidden="true" />
                {isZh ? '贴纸集合数量' : 'Sticker Sheet Count'}
              </div>
              <p className="mt-0.5 text-xs text-stone-500 dark:text-stone-400">
                {isZh ? '建议 4、6 或 9 张，画面更稳定。' : '4, 6, or 9 usually gives the most stable layout.'}
              </p>
            </div>
            <input
              type="number"
              min={2}
              max={12}
              value={sheetCount}
              onChange={(event) => update({ sheetCount: clampSheetCount(Number(event.target.value)) })}
              className="w-16 px-2 py-2 text-xs font-semibold text-center rounded-lg border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800 text-stone-700 dark:text-stone-200 focus:outline-none focus:ring-2 focus:ring-teal-500/30"
            />
          </div>
          <input
            type="range"
            min={2}
            max={12}
            step={1}
            value={sheetCount}
            onChange={(event) => update({ sheetCount: clampSheetCount(Number(event.target.value)) })}
            className="w-full accent-teal-600"
            aria-label={isZh ? '贴纸集合数量' : 'Sticker sheet count'}
          />
          <div className="grid grid-cols-3 gap-1.5">
            {[4, 6, 9].map((count) => (
              <button
                key={count}
                type="button"
                onClick={() => update({ sheetCount: count })}
                className={`py-1.5 text-xs font-semibold rounded-lg border transition-colors ${
                  sheetCount === count
                    ? 'border-teal-500 bg-teal-50 dark:bg-teal-900/20 text-teal-600 dark:text-teal-400'
                    : 'border-stone-200 dark:border-stone-700 text-stone-500 dark:text-stone-400 hover:border-stone-300 dark:hover:border-stone-600'
                }`}
              >
                {count}
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="space-y-2">
        <SettingSwitch
          checked={whiteBorder}
          onChange={() => update({ whiteBorder: !whiteBorder })}
          icon={CircleDot}
          label={isZh ? '保留模切白边' : 'Die-cut Border'}
          description={isZh ? '强调贴纸轮廓和可裁切边缘。' : 'Emphasize the sticker silhouette and cut edge.'}
        />
        <SettingSwitch
          checked={facialFeatures}
          onChange={() => update({ facialFeatures: !facialFeatures })}
          icon={ScanFace}
          label={isZh ? '允许表情特征' : 'Facial Features'}
          description={isZh ? '适合角色、表情包、拟人化物件。' : 'Useful for characters, emoji sets, and personified objects.'}
        />
      </div>

      <GenericOptionSelector
        selectedId={textStyle}
        onSelect={(id: string | null) => id && updateTextStyle(id as StickerTextStyle)}
        lang={lang}
        options={toOptions(STICKER_TEXT_STYLES)}
        label="Text Treatment"
        label_zh="文字策略"
        showPreview={false}
        showClear={false}
        confirmOnSelect
        favoritesKey="skill-sticker-text"
      />

      {textStyle !== 'none' && (
        <div>
          <label className="flex items-center gap-1.5 text-xs font-medium text-stone-500 dark:text-stone-400 mb-1.5">
            <Type className="w-3.5 h-3.5" aria-hidden="true" />
            {isZh ? '指定贴纸文字' : 'Exact Sticker Text'}
          </label>
          <input
            type="text"
            value={config.text || ''}
            onChange={(event) => update({ text: event.target.value })}
            placeholder={isZh ? '例如：加油、OK、今日营业' : 'e.g. Yay, OK, Open Today'}
            className="w-full px-3 py-2 text-sm rounded-lg border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800 text-stone-800 dark:text-stone-200 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-teal-500/30"
          />
        </div>
      )}

      <GenericOptionSelector
        selectedId={config.background}
        onSelect={(id: string | null) => id && update({ background: id as any })}
        lang={lang}
        options={toOptions(STICKER_BACKGROUNDS)}
        label="Background"
        label_zh="背景处理"
        showPreview={false}
        showClear={false}
        confirmOnSelect
        favoritesKey="skill-sticker-background"
      />

      <GenericOptionSelector
        selectedId={config.aspect}
        onSelect={(id: string | null) => id && update({ aspect: id as any })}
        lang={lang}
        options={toOptions(STICKER_ASPECTS)}
        label="Canvas Ratio"
        label_zh="画布比例"
        showPreview={false}
        showClear={false}
        confirmOnSelect
        favoritesKey="skill-sticker-aspect"
      />
    </div>
  );
};
