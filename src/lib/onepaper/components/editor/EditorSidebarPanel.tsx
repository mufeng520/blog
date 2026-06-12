import React from 'react';
import AppSidebar from '../AppSidebar';
import type { OnePaperAppActions, OnePaperAppState } from '../../hooks/useAppLogic';

type Props = {
  state: OnePaperAppState;
  actions: OnePaperAppActions;
};

export default function EditorSidebarPanel({ state, actions }: Props) {
  return (
    <AppSidebar
      activeRole={state.activeRole}
      setActiveRole={actions.setActiveRole}
      skillMode={state.skillMode}
      skillConfig={state.skillConfig}
      onSkillConfigChange={actions.setSkillConfig}
      lang={state.lang}
      platform={state.platform}
      resolution={state.resolution}
      customSize={state.customSize}
      description={state.description}
      pageName={state.pageName}
      keywords={state.keywords}
      style={state.style}
      customStyles={state.customStyles}
      enableDesignTokens={state.enableDesignTokens}
      designTokens={state.designTokens}
      background={state.background}
      highQuality={state.highQuality}
      forceChinese={state.forceChinese}
      promptLanguage={state.promptLanguage}
      preferredImageApiId={state.preferredImageApiId}
      designMdId={state.designMdId}
      setDesignMdId={actions.setDesignMdId}
      setDesignMdContent={actions.setDesignMdContent}
      visualStyleId={state.visualStyleId}
      setVisualStyleId={actions.setVisualStyleId}
      setVisualStyleContent={actions.setVisualStyleContent}
      layoutDensityId={state.layoutDensityId}
      setLayoutDensityId={actions.setLayoutDensityId}
      setLayoutDensityContent={actions.setLayoutDensityContent}
      isBatchMode={state.isBatchMode}
      batchOutputMode={state.batchOutputMode}
      specMode={state.specMode}
      pages={state.pages}
      isAutoGeneratingPages={state.isAutoGeneratingPages}
      mediaAspectRatio={state.mediaAspectRatio}
      mediaResolution={state.mediaResolution}
      mediaType={state.mediaType}
      colorImage={state.colorImage}
      referenceImages={state.referenceImages}
      copiedImageBase64={state.copiedImageBase64}
      layoutImage={state.layoutImage}
      setPlatform={actions.setPlatform}
      setResolution={actions.setResolution}
      setCustomSize={actions.setCustomSize}
      setDescription={actions.setDescription}
      setPageName={actions.setPageName}
      setKeywords={actions.setKeywords}
      setStyle={actions.setStyle}
      setCustomStyles={actions.setCustomStyles}
      setEnableDesignTokens={actions.setEnableDesignTokens}
      setDesignTokens={actions.setDesignTokens}
      setBackground={actions.setBackground}
      setHighQuality={actions.setHighQuality}
      setForceChinese={actions.setForceChinese}
      setPromptLanguage={actions.setPromptLanguage}
      setPreferredImageApiId={actions.setPreferredImageApiId}
      setIsBatchMode={actions.setIsBatchMode}
      setBatchOutputMode={actions.setBatchOutputMode}
      setSpecMode={actions.setSpecMode}
      setPages={actions.setPages}
      setMediaAspectRatio={actions.setMediaAspectRatio}
      setMediaResolution={actions.setMediaResolution}
      setMediaType={actions.setMediaType}
      setColorImage={actions.setColorImage}
      setReferenceImages={actions.setReferenceImages}
      setCopiedImageBase64={actions.setCopiedImageBase64}
      setLayoutImage={actions.setLayoutImage}
      setLayoutElements={actions.setLayoutElements}
      onAutoGeneratePages={actions.handleAutoGeneratePages}
      onOpenPageBuilder={actions.onOpenPageBuilder}
      onExtractStyle={actions.handleExtractStyle}
      onAnalyzeLayout={actions.handleAnalyzeLayout}
      isAnalyzingLayout={state.isAnalyzingLayout}
      isExtractingStyle={state.isExtractingStyle}
      onPrepareGeneration={actions.handlePrepareGeneration}
      isGenerating={state.isGenerating}
      batchProgress={state.batchProgress}
      progressValue={state.progressValue}
      error={state.error}
      onAddNotification={actions.addNotification}
      onOpenProjectManager={() => actions.setIsProjectManagerOpen(true)}
      onAiGenerateDescription={actions.handleAiGenerateDescription}
      isAiGeneratingDescription={state.isAiGeneratingDescription}
    />
  );
}
