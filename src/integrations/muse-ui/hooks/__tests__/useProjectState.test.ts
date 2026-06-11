import { renderHook, act, waitFor } from '@testing-library/react';
import { useProjectState } from '../useProjectState';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import * as projectService from '../../services/idbProjectService';

// Mock dependencies
vi.mock('../../services/idbProjectService');

describe('useProjectState', () => {
    const mockAddNotification = vi.fn();
    const mockSetArtboards = vi.fn();
    const lang = 'zh';

    beforeEach(() => {
        vi.clearAllMocks();
        localStorage.clear();
    });

    it('should load initial projects', async () => {
        const mockProjects = [{ id: 'p1', name: 'Test P1' }];
        (projectService.getProjects as any).mockResolvedValue(mockProjects);

        const { result } = renderHook(() => useProjectState(lang, mockAddNotification, mockSetArtboards));

        await waitFor(() => {
            expect(result.current.projects).toHaveLength(1);
            expect(result.current.projects[0].name).toBe('Test P1');
        });
    });

    it('should handle creating a project', async () => {
        const mockNewProject = { id: 'new-p', name: 'New Project' };
        const mockSavedProject = { ...mockNewProject, config: {}, artboards: [] };

        (projectService.createProject as any).mockResolvedValue(mockNewProject);
        (projectService.saveProject as any).mockResolvedValue(mockSavedProject);

        const { result } = renderHook(() => useProjectState(lang, mockAddNotification, mockSetArtboards));

        await act(async () => {
            await result.current.handleSaveProject('New Project', 'Desc', {}, []);
        });

        expect(projectService.createProject).toHaveBeenCalledWith({ name: 'New Project', description: 'Desc' });
        expect(projectService.saveProject).toHaveBeenCalled(); // Should save initial state
        expect(mockAddNotification).toHaveBeenCalledWith('项目已创建', 'success');
        expect(result.current.currentProjectId).toBe('new-p');
    });

    it('should delete a project', async () => {
        const { result } = renderHook(() => useProjectState(lang, mockAddNotification, mockSetArtboards));

        // Setup initial state manually or via mock return (but state is internal)
        // We can verify the service call
        await act(async () => {
            await result.current.handleDeleteProject('p1');
        });

        expect(projectService.deleteProject).toHaveBeenCalledWith('p1');
        expect(mockAddNotification).toHaveBeenCalledWith('项目已删除', 'success');
    });
});
