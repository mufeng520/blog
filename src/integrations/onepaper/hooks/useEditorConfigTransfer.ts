import type { ChangeEvent } from 'react';
import type { AppConfigExport, LangType, LayoutElement } from '../types';
import type { useConfigState } from './useConfigState';

type ConfigState = ReturnType<typeof useConfigState>;

interface UseEditorConfigTransferParams {
  config: ConfigState;
  layoutImage: string | null;
  layoutElements: LayoutElement[];
  lang: LangType;
  addNotification: (message: string, type: 'success' | 'error' | 'info') => void;
}

export function useEditorConfigTransfer({
  config,
  layoutImage,
  layoutElements,
  lang,
  addNotification,
}: UseEditorConfigTransferParams) {
  const handleExportConfig = async () => {
    const exportData: AppConfigExport = {
      version: 1,
      timestamp: Date.now(),
      platform: config.platform,
      resolution: config.resolution,
      customSize: config.customSize,
      description: config.description,
      pageName: config.pageName,
      keywords: config.keywords,
      style: config.style,
      customStyles: config.customStyles,
      enableDesignTokens: config.enableDesignTokens,
      designTokens: config.designTokens,
      background: config.background,
      highQuality: config.highQuality,
      forceChinese: config.forceChinese,
      promptLanguage: config.promptLanguage,
      preferredImageApiId: config.preferredImageApiId,
      activeRole: config.activeRole,
      skillMode: config.skillMode,
      activeSkill: config.activeSkill,
      skillConfig: config.skillConfig,
      mediaAspectRatio: config.mediaAspectRatio,
      mediaResolution: config.mediaResolution,
      mediaType: config.mediaType,
      designMdId: config.designMdId || undefined,
      designMdContent: config.designMdContent || undefined,
      visualStyleId: config.visualStyleId || undefined,
      visualStyleContent: config.visualStyleContent || undefined,
      layoutDensityId: config.layoutDensityId || undefined,
      layoutDensityContent: config.layoutDensityContent || undefined,
      isBatchMode: config.isBatchMode,
      batchOutputMode: config.batchOutputMode,
      specMode: config.specMode,
      pages: config.pages,
      styleImages: [],
      contentImages: [],
      layoutImage,
      layoutElements,
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `onepaper-config-${Date.now()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleImportConfig = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (ev) => {
      try {
        const data: AppConfigExport = JSON.parse(ev.target?.result as string);
        if (data.platform) config.setPlatform(data.platform);
        if (data.resolution) config.setResolution(data.resolution);
        if (data.description) config.setDescription(data.description);
        if (data.pageName) config.setPageName(data.pageName);
        if (data.keywords) config.setKeywords(data.keywords);
        if (data.style) config.setStyle(data.style);
        if (data.customStyles) config.setCustomStyles(data.customStyles);
        if (data.customSize) config.setCustomSize(data.customSize);
        if (data.enableDesignTokens !== undefined) config.setEnableDesignTokens(data.enableDesignTokens);
        if (data.designTokens) config.setDesignTokens(data.designTokens);
        if (data.background) config.setBackground(data.background);
        if (data.highQuality !== undefined) config.setHighQuality(data.highQuality);
        if (data.forceChinese !== undefined) config.setForceChinese(data.forceChinese);
        if (data.isBatchMode !== undefined) config.setIsBatchMode(data.isBatchMode);
        if (data.batchOutputMode) config.setBatchOutputMode(data.batchOutputMode);
        if (data.specMode) config.setSpecMode(data.specMode);
        if (data.pages) config.setPages(data.pages);
        if (data.mediaAspectRatio) config.setMediaAspectRatio(data.mediaAspectRatio);
        if (data.mediaResolution) config.setMediaResolution(data.mediaResolution);
        if (data.mediaType) config.setMediaType(data.mediaType);
        if (data.activeRole) config.setActiveRole(data.activeRole);
        if (data.skillMode !== undefined) config.setSkillMode(data.skillMode);
        if (data.activeSkill !== undefined) config.setActiveSkill(data.activeSkill);
        if (data.skillConfig !== undefined) config.setSkillConfig(data.skillConfig);
        if (data.designMdId) {
          config.setDesignMdId(data.designMdId);
          config.setDesignMdContent(data.designMdContent || null);
        }
        if (data.visualStyleId) {
          config.setVisualStyleId(data.visualStyleId);
          config.setVisualStyleContent(data.visualStyleContent || null);
        }
        if (data.layoutDensityId) {
          config.setLayoutDensityId(data.layoutDensityId);
          config.setLayoutDensityContent(data.layoutDensityContent || null);
        }
        if (data.promptLanguage !== undefined) config.setPromptLanguage(data.promptLanguage);
        if (data.preferredImageApiId !== undefined) config.setPreferredImageApiId(data.preferredImageApiId);

        addNotification(
          lang === 'zh' ? '\u914d\u7f6e\u5bfc\u5165\u6210\u529f' : 'Configuration imported successfully',
          'success',
        );
      } catch (error) {
        addNotification(lang === 'zh' ? '\u914d\u7f6e\u6587\u4ef6\u65e0\u6548' : 'Invalid configuration file', 'error');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  return {
    handleExportConfig,
    handleImportConfig,
  };
}
