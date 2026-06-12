import { useRef, useState } from 'react';
import type { LangType, Project } from '../../../types';
import IconLoader from '../../IconLoader';

type Props = {
  currentProject?: Project;
  isSaving?: boolean;
  lang: LangType;
  onUpdateCurrentProject: () => void;
  onRenameProject?: (newName: string) => void;
};

const zh = {
  rename: '\u70b9\u51fb\u6539\u540d',
  saving: '\u4fdd\u5b58\u4e2d...',
  save: '\u4fdd\u5b58\u5f53\u524d\u53d8\u52a8\u5230\u6b64\u9879\u76ee',
};

export default function ProjectStatusControl({
  currentProject,
  isSaving,
  lang,
  onUpdateCurrentProject,
  onRenameProject,
}: Props) {
  const [isEditingName, setIsEditingName] = useState(false);
  const [editName, setEditName] = useState('');
  const nameInputRef = useRef<HTMLInputElement>(null);

  if (!currentProject) return null;

  const startRename = () => {
    if (!onRenameProject) return;
    setEditName(currentProject.name);
    setIsEditingName(true);
    setTimeout(() => nameInputRef.current?.focus(), 50);
  };

  const commitRename = () => {
    if (editName.trim() && editName.trim() !== currentProject.name) {
      onRenameProject?.(editName.trim());
    }
    setIsEditingName(false);
  };

  return (
    <div className="flex items-center gap-1.5 sm:gap-2 px-2 sm:px-3 py-1.5 bg-teal-50 dark:bg-teal-900/20 text-teal-700 dark:text-teal-300 rounded-lg border border-teal-200 dark:border-teal-800 sm:mr-2 min-w-0 max-w-[40vw] sm:max-w-none">
      {isEditingName ? (
        <input
          ref={nameInputRef}
          value={editName}
          onChange={(event) => setEditName(event.target.value)}
          onBlur={commitRename}
          onKeyDown={(event) => {
            if (event.key === 'Enter') commitRename();
            if (event.key === 'Escape') setIsEditingName(false);
          }}
          className="text-xs font-bold bg-transparent border-b border-teal-400 dark:border-teal-600 outline-none w-24 sm:max-w-[150px] text-teal-700 dark:text-teal-300"
        />
      ) : (
        <button
          onClick={startRename}
          className="text-xs font-bold max-w-[22vw] sm:max-w-[150px] truncate hover:underline cursor-pointer"
          title={lang === 'zh' ? zh.rename : 'Click to rename'}
        >
          {currentProject.name}
        </button>
      )}

      <div className="h-3 w-px bg-teal-200 dark:bg-teal-800 mx-0.5 sm:mx-1" />

      <button
        onClick={() => {
          if (!isSaving) onUpdateCurrentProject();
        }}
        disabled={isSaving}
        className={`p-1.5 text-teal-600 dark:text-teal-400 rounded flex items-center gap-1 transition-all ${
          isSaving
            ? 'opacity-50 cursor-not-allowed'
            : 'hover:text-teal-800 dark:hover:text-teal-200 hover:bg-teal-100 dark:hover:bg-teal-900/40'
        }`}
        title={lang === 'zh' ? (isSaving ? zh.saving : zh.save) : (isSaving ? 'Saving...' : 'Save changes to this project')}
      >
        {isSaving ? (
          <svg className="animate-spin h-3.5 w-3.5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
        ) : (
          <IconLoader name="save" size={14} />
        )}
      </button>
    </div>
  );
}
