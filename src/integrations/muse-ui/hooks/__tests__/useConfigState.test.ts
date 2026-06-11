import { renderHook, act } from '@testing-library/react';
import { useConfigState } from '../useConfigState';
import { describe, it, expect } from 'vitest';
import { RESOLUTION_PRESETS, UI_STYLES } from '../../constants';

describe('useConfigState', () => {
    it('should initialize with defaults', () => {
        const { result } = renderHook(() => useConfigState());
        expect(result.current.platform).toBe('mobile');
        expect(result.current.resolution).toBeDefined();
        // Since default platform is mobile, resolution should be a mobile preset
        expect(result.current.resolution?.type).toBe('mobile');
    });

    it('should update platform and resolution', () => {
        const { result } = renderHook(() => useConfigState());

        act(() => {
            result.current.setPlatform('pc');
        });
        expect(result.current.platform).toBe('pc');
        expect(result.current.resolution?.type).toBe('pc');
    });

    it('should update description', () => {
        const { result } = renderHook(() => useConfigState());
        act(() => {
            result.current.setDescription('New Description');
        });
        expect(result.current.description).toBe('New Description');
    });

    it('should toggle batch mode', () => {
        const { result } = renderHook(() => useConfigState());
        act(() => {
            result.current.setIsBatchMode(true);
        });
        expect(result.current.isBatchMode).toBe(true);
    });
});
