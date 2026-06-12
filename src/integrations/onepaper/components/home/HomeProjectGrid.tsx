import React, { useState } from 'react';
import IconLoader from '../IconLoader';
import { getStudio } from '../../studios';
import type { LangType, Project } from '../../types';
import { toolRoutes } from '../../../../lib/tool-routes';
import { getHomeCopy } from './homeCopy';

type Props = {
  lang: LangType;
  isLoading: boolean;
  projects: Project[];
  onCreateProject: () => void;
  onDeleteProject: (projectId: string) => void;
  onRenameProject: (projectId: string, name: string) => void;
};

export default function HomeProjectGrid({
  lang,
  isLoading,
  projects,
  onCreateProject,
  onDeleteProject,
  onRenameProject,
}: Props) {
  const copy = getHomeCopy(lang);
  const [renamingProjectId, setRenamingProjectId] = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState('');

  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="animate-spin text-stone-300">
          <IconLoader name="loader" size={48} />
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 pb-20">
      <div
        onClick={onCreateProject}
        className="aspect-[4/3] rounded-2xl border-2 border-dashed border-stone-300 dark:border-stone-700 hover:border-teal-400 dark:hover:border-teal-500 bg-stone-100 dark:bg-stone-900/50 flex flex-col items-center justify-center gap-3 cursor-pointer group transition-all"
      >
        <div className="w-12 h-12 rounded-full bg-teal-50 dark:bg-teal-900/20 text-teal-500 group-hover:scale-110 transition-transform flex items-center justify-center">
          <IconLoader name="plus" size={24} />
        </div>
        <span className="font-bold text-stone-500 dark:text-stone-400 group-hover:text-teal-500 transition-colors">
          {copy.createBlankProject}
        </span>
      </div>
      {projects.map(project => {
        const studio = getStudio(project.studioType);

        return (
          <div
            key={project.id}
            onClick={() => window.open(toolRoutes.onePaper.editor(project.id), '_blank')}
            className="group relative aspect-[4/3] bg-white dark:bg-stone-800 rounded-2xl shadow-sm hover:shadow-xl transition-all border border-stone-200 dark:border-stone-800 overflow-hidden cursor-pointer hover:-translate-y-1"
          >
            <div className="h-2/3 bg-stone-200 dark:bg-stone-700 relative overflow-hidden">
              {project.thumbnailUrl ? (
                <img src={project.thumbnailUrl} className="w-full h-full object-cover transition-transform group-hover:scale-105" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-stone-300 dark:text-stone-600">
                  <IconLoader name="image" size={32} />
                </div>
              )}
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
              <div className={`absolute top-2 left-2 px-2 py-0.5 rounded text-[10px] font-bold bg-white/80 dark:bg-black/60 text-${studio.themeColor}-600 dark:text-${studio.themeColor}-400 backdrop-blur-sm`}>
                {lang === 'zh' ? studio.name_zh : studio.name}
              </div>
            </div>
            <div className="h-1/3 p-4 flex flex-col justify-between">
              <div className="flex justify-between items-start">
                {renamingProjectId === project.id ? (
                  <input
                    value={renameValue}
                    onChange={(event) => setRenameValue(event.target.value)}
                    onBlur={() => {
                      onRenameProject(project.id, renameValue);
                      setRenamingProjectId(null);
                    }}
                    onKeyDown={(event) => {
                      if (event.key === 'Enter') {
                        onRenameProject(project.id, renameValue);
                        setRenamingProjectId(null);
                      }
                      if (event.key === 'Escape') setRenamingProjectId(null);
                    }}
                    autoFocus
                    className="font-bold text-stone-800 dark:text-stone-100 bg-transparent border-b border-stone-400 outline-none flex-1 pr-2 text-sm"
                  />
                ) : (
                  <h3 className="font-bold text-stone-800 dark:text-stone-100 truncate flex-1 pr-2" title={project.name}>
                    {project.name}
                  </h3>
                )}
                <div className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1">
                  <button
                    type="button"
                    onClick={(event) => {
                      event.stopPropagation();
                      setRenamingProjectId(project.id);
                      setRenameValue(project.name);
                    }}
                    className="text-stone-400 hover:text-teal-500 p-1"
                    title={copy.rename}
                  >
                    <IconLoader name="edit" size={16} />
                  </button>
                  <button
                    type="button"
                    onClick={(event) => {
                      event.stopPropagation();
                      onDeleteProject(project.id);
                    }}
                    className="text-stone-400 hover:text-red-500 p-1"
                    title={copy.delete}
                  >
                    <IconLoader name="trash" size={16} />
                  </button>
                </div>
              </div>
              <p className="text-xs text-stone-400">{new Date(project.updatedAt).toLocaleDateString()}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
