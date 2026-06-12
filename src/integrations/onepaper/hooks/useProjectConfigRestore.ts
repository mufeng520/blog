import { useCallback } from 'react';
import type { Project } from '../types';
import type { useConfigState } from './useConfigState';

type ConfigState = ReturnType<typeof useConfigState>;

export function useProjectConfigRestore(config: ConfigState) {
  const restoreProjectConfig = useCallback(
    (project: Pick<Project, 'config'> | null | undefined) => {
      if (!project?.config) return;

      const c = project.config;
      if (c.platform) config.setPlatform(c.platform);
      if (c.resolution) config.setResolution(c.resolution);
      if (c.style) config.setStyle(c.style);
      if (c.description) config.setDescription(c.description);
      if (c.pageName) config.setPageName(c.pageName);
      if (c.keywords) config.setKeywords(c.keywords || []);
      if (c.designTokens) config.setDesignTokens(c.designTokens);
      if (c.designMdId) config.setDesignMdId(c.designMdId);
      if (c.designMdContent) config.setDesignMdContent(c.designMdContent);
      if (c.visualStyleId) config.setVisualStyleId(c.visualStyleId);
      if (c.visualStyleContent) config.setVisualStyleContent(c.visualStyleContent);
      if (c.layoutDensityId) config.setLayoutDensityId(c.layoutDensityId);
      if (c.layoutDensityContent) config.setLayoutDensityContent(c.layoutDensityContent);
      if (c.promptLanguage !== undefined) config.setPromptLanguage(c.promptLanguage);
      if (c.preferredImageApiId !== undefined) config.setPreferredImageApiId(c.preferredImageApiId);
      if (c.activeRole) config.setActiveRole(c.activeRole);
      if (c.skillMode !== undefined) config.setSkillMode(c.skillMode);
      if (c.activeSkill !== undefined) config.setActiveSkill(c.activeSkill);
      if (c.skillConfig !== undefined) config.setSkillConfig(c.skillConfig);
      if (c.mediaAspectRatio) config.setMediaAspectRatio(c.mediaAspectRatio);
      if (c.mediaResolution) config.setMediaResolution(c.mediaResolution);
      if (c.mediaType) config.setMediaType(c.mediaType);
      if (c.customSize) config.setCustomSize(c.customSize);
      if (c.customStyles) config.setCustomStyles(c.customStyles);
      if (c.enableDesignTokens !== undefined) config.setEnableDesignTokens(c.enableDesignTokens);
      if (c.background) config.setBackground(c.background);
      if (c.highQuality !== undefined) config.setHighQuality(c.highQuality);
      if (c.forceChinese !== undefined) config.setForceChinese(c.forceChinese);
      if (c.isBatchMode !== undefined) config.setIsBatchMode(c.isBatchMode);
      if (c.batchOutputMode) config.setBatchOutputMode(c.batchOutputMode);
      if (c.specMode) config.setSpecMode(c.specMode);
      if (c.pages) config.setPages(c.pages);
    },
    [
      config.setActiveRole,
      config.setActiveSkill,
      config.setBackground,
      config.setBatchOutputMode,
      config.setCustomSize,
      config.setCustomStyles,
      config.setDescription,
      config.setDesignMdContent,
      config.setDesignMdId,
      config.setDesignTokens,
      config.setEnableDesignTokens,
      config.setForceChinese,
      config.setHighQuality,
      config.setIsBatchMode,
      config.setKeywords,
      config.setLayoutDensityContent,
      config.setLayoutDensityId,
      config.setMediaAspectRatio,
      config.setMediaResolution,
      config.setMediaType,
      config.setPageName,
      config.setPages,
      config.setPlatform,
      config.setPreferredImageApiId,
      config.setPromptLanguage,
      config.setResolution,
      config.setSkillConfig,
      config.setSkillMode,
      config.setSpecMode,
      config.setStyle,
      config.setVisualStyleContent,
      config.setVisualStyleId,
    ],
  );

  return {
    restoreProjectConfig,
  };
}
