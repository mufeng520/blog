
import { useState } from 'react';
import { useUIState } from './useUIState';
import { useConfigState } from './useConfigState';
import { useProjectState } from './useProjectState';
import { useCanvasState } from './useCanvasState';
import { useGenerationLogic } from './useGenerationLogic';
import { useEditorAutosave } from './useEditorAutosave';
import { useEditorConfigTransfer } from './useEditorConfigTransfer';
import { useEditorTokenEstimate } from './useEditorTokenEstimate';
import { useProjectConfigRestore } from './useProjectConfigRestore';
import type { AppConfigExport } from '../types';

export const useAppLogic = (initialProjectId?: string) => {

    // 1. UI State
    const ui = useUIState();

    // 2. Canvas State (Needs UI for notifications)
    const canvas = useCanvasState(ui.lang, initialProjectId, ui.addNotification, (msg) => ui.addNotification(msg || 'Error', 'error'));

    // 3. Config State
    const config = useConfigState();
    const { restoreProjectConfig } = useProjectConfigRestore(config);

    // 4. Project State
    const project = useProjectState(ui.lang, ui.addNotification, canvas.setArtboards, initialProjectId, restoreProjectConfig);

    // 5. Generation Logic (Aggregates everything)
    const gen = useGenerationLogic(ui.lang, config, canvas);

    const [isBuilderOpen, setIsBuilderOpen] = useState(false);
    const [activePageBuilderId, setActivePageBuilderId] = useState<string | null>(null);

    const estimatedTokens = useEditorTokenEstimate({
        description: config.description,
        pageName: config.pageName,
        keywords: config.keywords,
        colorImage: config.colorImage,
        referenceImages: config.referenceImages,
        layoutImage: canvas.layoutImage,
        isBatchMode: config.isBatchMode,
        batchOutputMode: config.batchOutputMode,
        pages: config.pages,
    });

    const currentConfigObject: Partial<AppConfigExport> = {
        platform: config.platform, resolution: config.resolution, customSize: config.customSize, style: config.style,
        customStyles: config.customStyles, description: config.description, pageName: config.pageName,
        keywords: config.keywords, enableDesignTokens: config.enableDesignTokens,
        designTokens: config.designTokens, background: config.background, highQuality: config.highQuality,
        forceChinese: config.forceChinese,
        promptLanguage: config.promptLanguage, preferredImageApiId: config.preferredImageApiId,
        activeRole: config.activeRole, skillMode: config.skillMode,
        activeSkill: config.activeSkill, skillConfig: config.skillConfig,
        mediaAspectRatio: config.mediaAspectRatio, mediaResolution: config.mediaResolution, mediaType: config.mediaType,
        isBatchMode: config.isBatchMode, batchOutputMode: config.batchOutputMode, specMode: config.specMode,
        pages: config.pages,
        designMdId: config.designMdId, designMdContent: config.designMdContent,
        visualStyleId: config.visualStyleId, visualStyleContent: config.visualStyleContent,
        layoutDensityId: config.layoutDensityId, layoutDensityContent: config.layoutDensityContent
    };

    useEditorAutosave({
        currentProjectId: project.currentProjectId,
        isLoadingProject: project.isLoadingProject,
        artboards: canvas.artboards,
        config: currentConfigObject,
        onSave: project.handleUpdateProjectContent,
    });

    const { handleExportConfig, handleImportConfig } = useEditorConfigTransfer({
        config,
        layoutImage: canvas.layoutImage,
        layoutElements: canvas.layoutElements,
        lang: ui.lang,
        addNotification: ui.addNotification,
    });

    return {
        state: {
            ...ui, ...config, ...canvas, ...project, ...gen,
            estimatedTokens, isBuilderOpen, activePageBuilderId
        },
        actions: {
            ...ui, ...config, ...canvas, ...project, ...gen,
            startBatchGenerationFlow: gen.startBatchGenerationFlow,
            continueBatchGeneration: () => gen.continueBatchGeneration(project.currentProjectId),
            handlePrepareGeneration: () => gen.handlePrepareGeneration(ui.devMode, project.currentProjectId),
            setIsBuilderOpen, onOpenPageBuilder: (pid: string | null) => { setActivePageBuilderId(pid); setIsBuilderOpen(true); },
            handleExportConfig, handleImportConfig,
            handleSaveProject: (name: string, thumbnail?: string) => project.handleSaveProject(
                name,
                config.description,
                currentConfigObject,
                canvas.artboards,
                thumbnail
            ),
            handleCreateBlankProject: () => project.handleCreateBlankProject(),
            handleUpdateProjectContent: (id: string, thumbnail?: string, configOverride?: any) => project.handleUpdateProjectContent(
                id,
                {
                    ...currentConfigObject,
                    ...(configOverride || {})
                },
                canvas.artboards,
                thumbnail,
                false // Explicit Manual Save -> Updates State & Notifies
            ),
            handleUpdateProjectConfig: project.handleUpdateProjectConfig,
            handleCanvasDrop: (file: File, x: number, y: number) => canvas.handleCanvasDrop(file, x, y, config.platform, config.designTokens),

            cancelGeneration: () => { }, // TODO
            handleOpenRegen: async (id: string) => {
                const { getAssetDetails } = await import('../services/idbHistoryService');
                return gen.handleOpenRegen(id, getAssetDetails);
            },
            onCopyImage: (base64: string) => {
                config.setCopiedImageBase64(base64);
                ui.addNotification(ui.lang === 'zh' ? '已复制，可在左侧参考图粘贴' : 'Copied! Paste in Reference Images on the left', 'success');
            }
        }
    };
};

export type OnePaperAppLogic = ReturnType<typeof useAppLogic>;
export type OnePaperAppState = OnePaperAppLogic['state'];
export type OnePaperAppActions = OnePaperAppLogic['actions'];
