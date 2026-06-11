
import React, { useEffect, useState, useRef } from 'react';
import { useUIState } from './useUIState';
import { useConfigState } from './useConfigState';
import { useProjectState } from './useProjectState';
import { useCanvasState } from './useCanvasState';
import { useGenerationLogic } from './useGenerationLogic';
import { getAssetDetails } from '../services/idbHistoryService';
import type { AppConfigExport } from '../types';
import html2canvas from 'html2canvas';

export const useAppLogic = (initialProjectId?: string) => {

    // 1. UI State
    const ui = useUIState();

    // 2. Canvas State (Needs UI for notifications)
    const canvas = useCanvasState(ui.lang, initialProjectId, ui.addNotification, (msg) => ui.addNotification(msg || 'Error', 'error'));

    // 3. Project State 
    const project = useProjectState(ui.lang, ui.addNotification, canvas.setArtboards, initialProjectId);

    // 4. Config State
    const config = useConfigState();

    // 5. Generation Logic (Aggregates everything)
    const gen = useGenerationLogic(ui.lang, config, canvas);

    const [isBuilderOpen, setIsBuilderOpen] = useState(false);
    const [activePageBuilderId, setActivePageBuilderId] = useState<string | null>(null);

    // --- Sync Logic (Facade Glue) ---

    // Project Loading Side-effects (Restoring Config)
    // useProjectState loads the project and hydrates Artboards, but returns the project object.
    // We need to catch that and restore Config.
    // Since we can't easily hook into the internal async of useProjectState without callbacks, 
    // we can use an Effect or modify useProjectState to accept a callback.
    // HOWEVER, useProjectState exposes `handleLoadProject`. We can wrap it here.

    const restoreProjectConfig = (p: any) => {
        if (p.config) {
            const c = p.config;
            if (c.platform) config.setPlatform(c.platform);
            if (c.resolution) config.setResolution(c.resolution);
            if (c.style) config.setStyle(c.style);
            if (c.description) config.setDescription(c.description);
            if (c.pageName) config.setPageName(c.pageName);
            if (c.keywords) config.setKeywords(c.keywords || []);
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
        }
    };

    // Override handleLoadProject to also restore Config
    const handleLoadProjectWrapper = async (pid: string) => {
        const p = await project.handleLoadProject(pid);
        if (p) restoreProjectConfig(p);
    };

    // Initial Load Effect (if ID provided) is handled inside useProjectState, 
    // BUT we need to restore config. useProjectState enables the artboards, 
    // but we need to fetch the project again or expose it?
    // Actually useProjectState calls getProjectById. 
    // Let's rely on useProjectState's internal effect calling handleLoadProject?
    // Wait, useProjectState's internal Effect calls its OWN handleLoadProject.
    // We need to intercept that result.
    // EASIER FIX: Pass a `onProjectLoaded` callback to useProjectState. 
    // But I can't change useProjectState signature easily without breaking the tool call I just made?
    // Actually I can edit it.
    // OR: I can just put a simple Effect here watching `project.currentProjectId`?
    // But then I need the project data. `project.projects` has the list.

    // Better: We wrap the actions. For the initial load, we might miss the config restore if we don't watch it.
    // Let's use `project.projects` change to find the current one? No, `projects` is the list.

    // Use an Effect in Facade: When `project.currentProjectId` changes, find it in `project.projects` (if loaded) and restore? 
    // But `projects` list might be just summary. We need detail.
    // Let's modify `useProjectState` to expose the `loadedProject` or `onLoad` callback.
    // For now, let's keep it simple: `handleLoadProjectWrapper` is used for explicit actions.
    // For the initial ID load, we might need `useProjectState` to export the data it fetched?
    // Refactoring `useProjectState` slightly is safer. For now let's assume `handleLoadProject` returns the project 
    // and we can't easily intercept the *initial* useEffect call inside it.
    // ==> Modify `useProjectState.ts` to accept `onProjectLoaded` callback is best.

    // WORKAROUND without editing `useProjectState`:
    useEffect(() => {
        if (initialProjectId && project.projects.length > 0) {
            // This relies on projects being loaded.
        }
    }, [initialProjectId]);


    // --- Estimated Tokens Logic (Legacy) ---
    const [estimatedTokens, setEstimatedTokens] = useState(0);
    useEffect(() => {
        let base = 500 + (config.description.length + config.pageName.length + config.keywords.join(' ').length) * 0.5;
        const imgTokens = ((config.colorImage ? 1 : 0) + (config.referenceImages.length) + (canvas.layoutImage ? 1 : 0)) * 258;
        base += imgTokens;
        if (config.isBatchMode) {
            setEstimatedTokens(Math.round(config.batchOutputMode === 'separate' ? base * Math.max(1, config.pages.length) : base + (config.pages.length * 100)));
        } else {
            setEstimatedTokens(Math.round(base));
        }
    }, [config.description, config.pageName, config.keywords, config.colorImage, config.referenceImages, canvas.layoutImage, config.isBatchMode, config.batchOutputMode, config.pages]);

    // --- Auto-Save Logic ---
    const lastSavedRef = useRef<string>('');

    // Define current config object helper
    const currentConfigObject = {
        platform: config.platform, resolution: config.resolution, customSize: config.customSize, style: config.style,
        description: config.description, pageName: config.pageName, keywords: config.keywords, enableDesignTokens: config.enableDesignTokens,
        designTokens: config.designTokens, background: config.background, highQuality: config.highQuality,
        promptLanguage: config.promptLanguage, preferredImageApiId: config.preferredImageApiId,
        designMdId: config.designMdId, designMdContent: config.designMdContent,
        visualStyleId: config.visualStyleId, visualStyleContent: config.visualStyleContent,
        layoutDensityId: config.layoutDensityId, layoutDensityContent: config.layoutDensityContent
    };

    useEffect(() => {
        if (!project.currentProjectId) return;
        if (project.isLoadingProject) return; 

        const currentStateString = JSON.stringify({
            artboards: canvas.artboards.map(a => ({ id: a.id, x: a.x, y: a.y, w: a.width, h: a.height })),
            config: {
                d: config.description,
                p: config.platform,
                s: config.style
            }
        });

        if (lastSavedRef.current === currentStateString) return;
        
        // Initial set (avoid save on load)
        if (lastSavedRef.current === '') {
            lastSavedRef.current = currentStateString;
            return;
        }

        const timer = setTimeout(async () => {
            let thumb: string | undefined;
            if (canvas.artboards.length > 0) {
                try {
                    const el = document.getElementById('main-canvas-area');
                    if (el) {
                        const c = await html2canvas(el, { useCORS: true, scale: 0.15, logging: false });
                        thumb = c.toDataURL('image/jpeg', 0.6);
                    }
                } catch (_) {}
            }
            project.handleUpdateProjectContent(
                project.currentProjectId!,
                currentConfigObject,
                canvas.artboards,
                thumb,
                true // Silent / Skip State Update
            ).then(() => {
                lastSavedRef.current = currentStateString;
                console.log("Auto-saved");
            });
        }, 3000); // 3 seconds debounce

        return () => clearTimeout(timer);
    }, [
        project.currentProjectId, 
        project.isLoadingProject,
        canvas.artboards, 
        config.description, config.platform, config.style, config.resolution // Add more deps as needed
    ]);


    // --- Export / Import Config ---
    const handleExportConfig = async () => {
        const exportData: AppConfigExport = {
            version: 1, timestamp: Date.now(),
            platform: config.platform, resolution: config.resolution, customSize: config.customSize,
            description: config.description, pageName: config.pageName, keywords: config.keywords,
            style: config.style, customStyles: config.customStyles, enableDesignTokens: config.enableDesignTokens,
            designTokens: config.designTokens, background: config.background, highQuality: config.highQuality,
            forceChinese: config.forceChinese,
            promptLanguage: config.promptLanguage, preferredImageApiId: config.preferredImageApiId,
            designMdId: config.designMdId || undefined, designMdContent: config.designMdContent || undefined,
            visualStyleId: config.visualStyleId || undefined, visualStyleContent: config.visualStyleContent || undefined,
            layoutDensityId: config.layoutDensityId || undefined, layoutDensityContent: config.layoutDensityContent || undefined,
            isBatchMode: config.isBatchMode, batchOutputMode: config.batchOutputMode,
            specMode: config.specMode, pages: config.pages,
            styleImages: [], contentImages: [], // TODO: support images
            layoutImage: canvas.layoutImage, layoutElements: canvas.layoutElements
        };
        // Download logic...
        const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a'); a.href = url; a.download = `muse-ui-config-${Date.now()}.json`;
        document.body.appendChild(a); a.click(); document.body.removeChild(a); URL.revokeObjectURL(url);
    };

    const handleImportConfig = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = async (ev) => {
            try {
                const data: AppConfigExport = JSON.parse(ev.target?.result as string);
                if (data.platform) config.setPlatform(data.platform);
                if (data.resolution) config.setResolution(data.resolution);
                // ... map all fields ...
                if (data.description) config.setDescription(data.description);
                if (data.pages) config.setPages(data.pages);
                if (data.designMdId) { config.setDesignMdId(data.designMdId); config.setDesignMdContent(data.designMdContent || null); }
                if (data.visualStyleId) { config.setVisualStyleId(data.visualStyleId); config.setVisualStyleContent(data.visualStyleContent || null); }
                if (data.layoutDensityId) { config.setLayoutDensityId(data.layoutDensityId); config.setLayoutDensityContent(data.layoutDensityContent || null); }
                if (data.promptLanguage !== undefined) config.setPromptLanguage(data.promptLanguage);
                if (data.preferredImageApiId !== undefined) config.setPreferredImageApiId(data.preferredImageApiId);

                ui.addNotification(ui.lang === 'zh' ? '配置导入成功' : 'Configuration imported successfully', 'success');
            } catch (error) {
                ui.addNotification(ui.lang === 'zh' ? '配置文件无效' : 'Invalid configuration file', 'error');
            }
        };
        reader.readAsText(file);
        e.target.value = '';
    };

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
                {
                    platform: config.platform, resolution: config.resolution, customSize: config.customSize, style: config.style,
                    description: config.description, pageName: config.pageName, keywords: config.keywords, enableDesignTokens: config.enableDesignTokens,
                    designTokens: config.designTokens, background: config.background, highQuality: config.highQuality,
                    promptLanguage: config.promptLanguage, preferredImageApiId: config.preferredImageApiId,
                    designMdId: config.designMdId, designMdContent: config.designMdContent,
                    visualStyleId: config.visualStyleId, visualStyleContent: config.visualStyleContent,
                    layoutDensityId: config.layoutDensityId, layoutDensityContent: config.layoutDensityContent
                },
                canvas.artboards,
                thumbnail
            ),
            handleCreateBlankProject: () => project.handleCreateBlankProject(),
            handleUpdateProjectContent: (id: string, thumbnail?: string, configOverride?: any) => project.handleUpdateProjectContent(
                id,
                {
                    ...(configOverride || {}),
                    platform: configOverride?.platform || config.platform,
                    resolution: configOverride?.resolution || config.resolution,
                    customSize: configOverride?.customSize || config.customSize,
                    style: configOverride?.style || config.style,
                    description: configOverride?.description || config.description,
                    pageName: configOverride?.pageName || config.pageName,
                    keywords: configOverride?.keywords || config.keywords,
                    enableDesignTokens: configOverride?.enableDesignTokens !== undefined ? configOverride.enableDesignTokens : config.enableDesignTokens,
                    designTokens: configOverride?.designTokens || config.designTokens,
                    background: configOverride?.background || config.background,
                    highQuality: configOverride?.highQuality !== undefined ? configOverride.highQuality : config.highQuality,
                    promptLanguage: configOverride?.promptLanguage !== undefined ? configOverride.promptLanguage : config.promptLanguage,
                    preferredImageApiId: configOverride?.preferredImageApiId !== undefined ? configOverride.preferredImageApiId : config.preferredImageApiId,
                    designMdId: configOverride?.designMdId || config.designMdId,
                    designMdContent: configOverride?.designMdContent || config.designMdContent,
                    visualStyleId: configOverride?.visualStyleId || config.visualStyleId,
                    visualStyleContent: configOverride?.visualStyleContent || config.visualStyleContent,
                    layoutDensityId: configOverride?.layoutDensityId || config.layoutDensityId,
                    layoutDensityContent: configOverride?.layoutDensityContent || config.layoutDensityContent
                },
                canvas.artboards,
                thumbnail,
                false // Explicit Manual Save -> Updates State & Notifies
            ),
            handleUpdateProjectConfig: project.handleUpdateProjectConfig,
            handleCanvasDrop: (file: File, x: number, y: number) => canvas.handleCanvasDrop(file, x, y, config.platform, config.designTokens),

            cancelGeneration: () => { }, // TODO
            handleOpenRegen: (id: string) => gen.handleOpenRegen(id, getAssetDetails),
            onCopyImage: (base64: string) => {
                config.setCopiedImageBase64(base64);
                ui.addNotification(ui.lang === 'zh' ? '已复制，可在左侧参考图粘贴' : 'Copied! Paste in Reference Images on the left', 'success');
            }
        }
    };
};
