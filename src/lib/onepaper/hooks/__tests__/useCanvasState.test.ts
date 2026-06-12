import { renderHook, act } from '@testing-library/react';
import { useCanvasState } from '../useCanvasState';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import * as historyService from '../../services/idbHistoryService';

// Mock services
vi.mock('../../services/idbHistoryService');

describe('useCanvasState', () => {
    const mockAddNotification = vi.fn();
    const mockSetError = vi.fn();
    const lang = 'zh';

    beforeEach(() => {
        vi.clearAllMocks();
        localStorage.clear();
    });

    it('should initialize empty', () => {
        (historyService.getHistory as any).mockResolvedValue([]);
        const { result } = renderHook(() => useCanvasState(lang, undefined, mockAddNotification, mockSetError));
        expect(result.current.artboards).toEqual([]);
        expect(result.current.history).toEqual([]);
    });

    it('should handle history logic', async () => {
        const mockImg = { id: 'img1', url: 'test.png' };
        (historyService.saveImageToHistory as any).mockResolvedValue(mockImg);
        (historyService.getHistory as any).mockResolvedValue([mockImg]);

        const { result } = renderHook(() => useCanvasState(lang, undefined, mockAddNotification, mockSetError));

        await act(async () => {
            await result.current.handleSaveToHistory(mockImg as any);
        });

        // getHistory is called in mount and after save. 
        // We mocked it to return [mockImg] always for simplicity, or we can vary mock.
        expect(historyService.saveImageToHistory).toHaveBeenCalledWith(mockImg);
    });

    it('should update layout image', () => {
        const { result } = renderHook(() => useCanvasState(lang, undefined, mockAddNotification, mockSetError));

        act(() => {
            result.current.updateLayoutImage('base64String');
        });
        expect(result.current.layoutImage).toBe('base64String');

        act(() => {
            result.current.updateLayoutImage(null);
        });
        expect(result.current.layoutImage).toBeNull();
    });
});
