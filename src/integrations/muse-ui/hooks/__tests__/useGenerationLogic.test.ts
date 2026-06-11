
import { renderHook, act } from '@testing-library/react';
import { useGenerationLogic } from '../useGenerationLogic';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import * as geminiService from '../../services/geminiService';

// Mock geminiService
vi.mock('../../services/geminiService');

describe('useGenerationLogic', () => {
    const lang = 'zh';
    const mockAddNotification = vi.fn();

    // Mock Config State
    const mockConfig: any = {
        platform: 'mobile',
        resolution: { width: 375, height: 667 },
        customSize: { width: 375, height: 667, active: false },
        style: { name: 'Modern' },
        description: 'Test Desc',
        pageName: 'Home',
        keywords: [],
        enableDesignTokens: false,
        designTokens: {},
        background: { type: 'color', value: '#fff' },
        highQuality: false,
        forceChinese: false,
        batchOutputMode: 'separate',
        specMode: 'image',
        pages: [],
        colorImage: null,
        referenceImages: [],
        promptLanguage: null,
        preferredImageApiId: null,
        designMdContent: null,
        visualStyleContent: null,
        layoutDensityContent: null,
        activeRole: 'designer',
        skillMode: false,
        activeSkill: null,
        skillConfig: null,
        isBatchMode: false,
        setDescription: vi.fn(),
        setPages: vi.fn(),
        setCustomStyles: vi.fn(),
        setStyle: vi.fn(),
        setIsAutoGeneratingPages: vi.fn(),
    };

    // Mock Canvas State
    const mockCanvas: any = {
        layoutImage: null,
        layoutElements: [],
        layoutAnalysis: null,
        setLayoutAnalysis: vi.fn(),
        setArtboards: vi.fn(),
        setArtboardGroups: vi.fn(),
        handleSaveToHistory: vi.fn(),
        getImageDimensions: vi.fn().mockResolvedValue({ width: 375, height: 667 }),
        artboardGroups: [],
        artboards: []
    };

    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('should initialize with default state', () => {
        const { result } = renderHook(() => useGenerationLogic(lang, mockConfig, mockCanvas));
        expect(result.current.isGenerating).toBe(false);
        expect(result.current.error).toBeNull();
    });

    it('should handle auto generate pages', async () => {
        const { result } = renderHook(() => useGenerationLogic(lang, mockConfig, mockCanvas));
        const mockPages = [{ name: 'P1', description: 'D1' }];
        (geminiService.generatePageList as any).mockResolvedValue(mockPages);

        await act(async () => {
            await result.current.handleAutoGeneratePages();
        });

        expect(mockConfig.setIsAutoGeneratingPages).toHaveBeenCalledWith(true);
        expect(geminiService.generatePageList).toHaveBeenCalled();
        expect(mockConfig.setPages).toHaveBeenCalledWith(mockPages);
        expect(mockConfig.setIsAutoGeneratingPages).toHaveBeenCalledWith(false);
    });

    it('should handle confirm generation (single)', async () => {
        const { result } = renderHook(() => useGenerationLogic(lang, mockConfig, mockCanvas));
        const mockAsset = { id: 'a1', url: 'test.png', prompt: 'prompt', timestamp: 123, base64: 'b64' };

        (geminiService.constructPrompt as any).mockReturnValue('Constructed Prompt');
        (geminiService.generateUIReference as any).mockResolvedValue(mockAsset);
        mockCanvas.getImageDimensions.mockResolvedValue({ width: 375, height: 667 });

        await act(async () => {
            await result.current.handleConfirmGeneration();
        });

        expect(result.current.isGenerating).toBe(false);
        expect(geminiService.generateUIReference).toHaveBeenCalled();
        expect(mockCanvas.setArtboards).toHaveBeenCalled();
    });
});
