import { useEffect, useState } from 'react';
import { I18N } from '../constants';
import { createProject, deleteProject, getProjects, saveProject } from '../services/idbProjectService';
import type { LangType, Project } from '../types';
import { toolRoutes } from '../../../lib/tool-routes';
import { applyTheme, getNextTheme, readStoredTheme, storeTheme, type ThemeMode } from '../services/themeStore';

export type HomeNotification = {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info';
};

const readStoredLang = (): LangType => {
  if (typeof localStorage === 'undefined') return 'zh';
  return (localStorage.getItem('onepaper-lang') as LangType) || 'zh';
};

export function useHomePageState() {
  const [lang, setLang] = useState<LangType>(readStoredLang);
  const [theme, setTheme] = useState<ThemeMode>(readStoredTheme);
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [notifications, setNotifications] = useState<HomeNotification[]>([]);
  const t = I18N[lang];

  const addNotification = (message: string, type: HomeNotification['type']) => {
    const id = Date.now().toString();
    setNotifications((prev) => [...prev, { id, message, type }]);
    setTimeout(() => setNotifications((prev) => prev.filter((item) => item.id !== id)), 3000);
  };

  const loadProjects = async () => {
    setIsLoading(true);
    try {
      const data = await getProjects();
      setProjects(data);
    } catch (error) {
      console.error('Failed to load projects', error);
      addNotification(lang === 'zh' ? '加载项目失败' : 'Failed to load projects', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const toggleTheme = () => {
    setTheme((prev) => {
      const next = getNextTheme(prev);
      storeTheme(next);
      return next;
    });
  };

  const handleCreateProject = async () => {
    const name = lang === 'zh' ? '未命名项目' : 'Untitled Project';
    try {
      const newProject = await createProject({ name });
      window.open(toolRoutes.onePaper.editor(newProject.id), '_blank');
    } catch (error) {
      console.error('Failed to create project', error);
      addNotification(lang === 'zh' ? '创建项目失败' : 'Failed to create project', 'error');
    }
  };

  const handleDeleteProject = async (id: string) => {
    const confirmed = window.confirm(
      lang === 'zh' ? '确定删除此项目吗？' : 'Are you sure you want to delete this project?',
    );
    if (!confirmed) return;

    try {
      await deleteProject(id);
      setProjects((prev) => prev.filter((project) => project.id !== id));
      addNotification(lang === 'zh' ? '项目已删除' : 'Project deleted', 'success');
    } catch (error) {
      console.error('Delete failed', error);
      addNotification(lang === 'zh' ? '删除失败' : 'Delete failed', 'error');
    }
  };

  const handleRenameProject = async (projectId: string, newName: string) => {
    try {
      await saveProject(projectId, { name: newName });
      setProjects((prev) => prev.map((project) => (
        project.id === projectId ? { ...project, name: newName } : project
      )));
      addNotification(lang === 'zh' ? '已重命名' : 'Renamed', 'success');
    } catch (error) {
      console.error('Rename failed', error);
      addNotification(lang === 'zh' ? '重命名失败' : 'Rename failed', 'error');
    }
  };

  const dismissNotification = (id: string) => {
    setNotifications((prev) => prev.filter((item) => item.id !== id));
  };

  useEffect(() => {
    applyTheme(theme);
    loadProjects();
  }, []);

  useEffect(() => {
    storeTheme(theme);
  }, [theme]);

  useEffect(() => {
    localStorage.setItem('onepaper-lang', lang);
  }, [lang]);

  return {
    lang,
    setLang,
    theme,
    toggleTheme,
    t,
    projects,
    isLoading,
    notifications,
    dismissNotification,
    handleCreateProject,
    handleDeleteProject,
    handleRenameProject,
  };
}
