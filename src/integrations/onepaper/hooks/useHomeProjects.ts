import { useEffect, useState } from 'react';
import { toolRoutes } from '../../../lib/tool-routes';
import { createProject, deleteProject, getProjects, saveProject } from '../services/idbProjectService';
import type { LangType, Project } from '../types';
import type { HomeNotification } from './homeTypes';

type AddNotification = (message: string, type: HomeNotification['type']) => void;

export function useHomeProjects(lang: LangType, addNotification: AddNotification) {
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadProjects = async () => {
    setIsLoading(true);
    try {
      const data = await getProjects();
      setProjects(data);
    } catch (error) {
      console.error('Failed to load projects', error);
      addNotification(lang === 'zh' ? '\u52a0\u8f7d\u9879\u76ee\u5931\u8d25' : 'Failed to load projects', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateProject = async () => {
    const name = lang === 'zh' ? '\u672a\u547d\u540d\u9879\u76ee' : 'Untitled Project';
    try {
      const newProject = await createProject({ name });
      window.open(toolRoutes.onePaper.editor(newProject.id), '_blank');
    } catch (error) {
      console.error('Failed to create project', error);
      addNotification(lang === 'zh' ? '\u521b\u5efa\u9879\u76ee\u5931\u8d25' : 'Failed to create project', 'error');
    }
  };

  const handleDeleteProject = async (id: string) => {
    const confirmed = window.confirm(
      lang === 'zh' ? '\u786e\u5b9a\u5220\u9664\u6b64\u9879\u76ee\u5417\uff1f' : 'Are you sure you want to delete this project?',
    );
    if (!confirmed) return;

    try {
      await deleteProject(id);
      setProjects((prev) => prev.filter((project) => project.id !== id));
      addNotification(lang === 'zh' ? '\u9879\u76ee\u5df2\u5220\u9664' : 'Project deleted', 'success');
    } catch (error) {
      console.error('Delete failed', error);
      addNotification(lang === 'zh' ? '\u5220\u9664\u5931\u8d25' : 'Delete failed', 'error');
    }
  };

  const handleRenameProject = async (projectId: string, newName: string) => {
    try {
      await saveProject(projectId, { name: newName });
      setProjects((prev) => prev.map((project) => (
        project.id === projectId ? { ...project, name: newName } : project
      )));
      addNotification(lang === 'zh' ? '\u5df2\u91cd\u547d\u540d' : 'Renamed', 'success');
    } catch (error) {
      console.error('Rename failed', error);
      addNotification(lang === 'zh' ? '\u91cd\u547d\u540d\u5931\u8d25' : 'Rename failed', 'error');
    }
  };

  useEffect(() => {
    loadProjects();
  }, []);

  return {
    projects,
    isLoading,
    handleCreateProject,
    handleDeleteProject,
    handleRenameProject,
  };
}
