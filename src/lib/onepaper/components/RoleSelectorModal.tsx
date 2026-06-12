import React from 'react';
import type { CreatorRole, LangType } from '../types';
import { ONEPAPER_SKILL_DEFINITIONS } from '../skills/skillRegistry';

interface RoleDef {
  id: CreatorRole;
  label: string;
  label_zh: string;
  description: string;
  description_zh: string;
}

const BASE_ROLES: RoleDef[] = [
  {
    id: 'designer', label: 'UI Design', label_zh: 'UI 设计',
    description: 'UI mockups & wireframes', description_zh: 'UI 原型与线框图'
  },
  {
    id: 'media', label: 'Social', label_zh: '社交平台',
    description: 'Posters & banners', description_zh: '海报与 Banner'
  },
  // {
  //   id: 'game', label: 'Game', label_zh: '游戏制作者',
  //   description: 'Game assets & icons', description_zh: '游戏素材与图标'
  // },
];

const FREE_ROLE: RoleDef = {
  id: 'free', label: 'Free', label_zh: '自由模式',
  description: 'Free prompt mode', description_zh: '自由输入，直接生成'
};

const ROLES: RoleDef[] = [
  ...BASE_ROLES,
  ...ONEPAPER_SKILL_DEFINITIONS.map(({ id, label, label_zh, description, description_zh }) => ({
    id,
    label,
    label_zh,
    description,
    description_zh,
  })),
  FREE_ROLE,
];

// ─── SVG Icons (24×24 viewBox) ───
export const RoleIcon: React.FC<{ roleId: CreatorRole; className?: string }> = ({ roleId, className = 'w-8 h-8' }) => {
  const props = { className, viewBox: '0 0 24 24', fill: 'none' };
  switch (roleId) {
    case 'designer':
      return (
        <svg {...props}>
          <rect x="2" y="2" width="20" height="20" rx="3" stroke="currentColor" strokeWidth="1.5" />
          <circle cx="8.5" cy="8.5" r="2" stroke="currentColor" strokeWidth="1.5" />
          <rect x="13" y="13" width="5" height="5" rx="1" stroke="currentColor" strokeWidth="1.5" />
          <path d="M15 4L17 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          <path d="M4 15L6 17" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      );
    case 'media':
      return (
        <svg {...props}>
          <rect x="3" y="6" width="18" height="14" rx="2" stroke="currentColor" strokeWidth="1.5" />
          <circle cx="12" cy="13" r="3.5" stroke="currentColor" strokeWidth="1.5" />
          <circle cx="12" cy="13" r="1.5" fill="currentColor" />
          <path d="M7 6V5a2 2 0 012-2h6a2 2 0 012 2v1" stroke="currentColor" strokeWidth="1.5" />
        </svg>
      );
    case 'game':
      return (
        <svg {...props}>
          <rect x="4" y="7" width="16" height="11" rx="3" stroke="currentColor" strokeWidth="1.5" />
          <path d="M9 12.5h2m-1-1v2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          <circle cx="15" cy="12.5" r="1" fill="currentColor" />
          <path d="M2 10h2m0 4H2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      );
    case 'cover-image':
      return (
        <svg {...props}>
          <rect x="3" y="4" width="18" height="16" rx="2" stroke="currentColor" strokeWidth="1.5" />
          <path d="M3 8h18" stroke="currentColor" strokeWidth="1.5" />
          <circle cx="8" cy="6.5" r="0.8" fill="currentColor" />
          <rect x="6" y="11" width="5" height="6" rx="1" stroke="currentColor" strokeWidth="1.5" />
          <path d="M14 11h4m-4 3h3m-3 3h2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      );
    case 'infographic':
      return (
        <svg {...props}>
          <rect x="3" y="14" width="4" height="7" rx="1" stroke="currentColor" strokeWidth="1.5" />
          <rect x="10" y="9" width="4" height="12" rx="1" stroke="currentColor" strokeWidth="1.5" />
          <rect x="17" y="4" width="4" height="17" rx="1" stroke="currentColor" strokeWidth="1.5" />
          <path d="M5 10l3-3 4 2 3-5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      );
    case 'xhs-images':
      return (
        <svg {...props}>
          <rect x="5" y="2" width="14" height="20" rx="3" stroke="currentColor" strokeWidth="1.5" />
          <rect x="8" y="6" width="8" height="8" rx="1" stroke="currentColor" strokeWidth="1.5" />
          <circle cx="12" cy="17" r="1.2" stroke="currentColor" strokeWidth="1.5" />
          <path d="M10 10l2 2 3-3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      );
    case 'comic':
      return (
        <svg {...props}>
          <rect x="2" y="4" width="8" height="7" rx="1" stroke="currentColor" strokeWidth="1.5" />
          <rect x="14" y="4" width="8" height="7" rx="1" stroke="currentColor" strokeWidth="1.5" />
          <rect x="2" y="13" width="20" height="7" rx="1" stroke="currentColor" strokeWidth="1.5" />
          <path d="M5.5 7.5L6.5 8.5 8 6.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
          <circle cx="17" cy="7.5" r="1" fill="currentColor" />
          <path d="M8 16.5h8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      );
    case 'article-illustrator':
      return (
        <svg {...props}>
          <path d="M3 19h18" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          <path d="M3 15h12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          <path d="M3 11h8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          <rect x="14" y="4" width="7" height="10" rx="1" stroke="currentColor" strokeWidth="1.5" />
          <circle cx="17.5" cy="8" r="1.5" stroke="currentColor" strokeWidth="1.5" />
          <path d="M15 12l1.5-1.5 1 1 2-2" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      );
    case 'slide-deck':
      return (
        <svg {...props}>
          <rect x="2" y="4" width="20" height="14" rx="2" stroke="currentColor" strokeWidth="1.5" />
          <path d="M2 8h20" stroke="currentColor" strokeWidth="1.5" />
          <circle cx="5" cy="6" r="0.8" fill="currentColor" />
          <path d="M8 6h4" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
          <path d="M5 12h8M5 15h5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          <rect x="14" y="10" width="6" height="6" rx="1" stroke="currentColor" strokeWidth="1.5" />
        </svg>
      );
    case 'logo':
      return (
        <svg {...props}>
          <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.5" />
          <path d="M8 16V8l4 6 4-6v8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      );
    case 'sticker-design':
      return (
        <svg {...props}>
          <rect x="5" y="5" width="14" height="14" rx="3" stroke="currentColor" strokeWidth="1.5" />
          <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="1.5" />
          <path d="M12 9V7M12 15v2M9 12H7M15 12h2" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
          <path d="M9.5 9.5L8 8M14.5 14.5L16 16M14.5 9.5L16 8M9.5 14.5L8 16" stroke="currentColor" strokeWidth="1" strokeLinecap="round" />
        </svg>
      );
    case 'animation-sequence':
      return (
        <svg {...props}>
          <rect x="3" y="5" width="5" height="14" rx="1" stroke="currentColor" strokeWidth="1.5" />
          <rect x="9.5" y="5" width="5" height="14" rx="1" stroke="currentColor" strokeWidth="1.5" />
          <rect x="16" y="5" width="5" height="14" rx="1" stroke="currentColor" strokeWidth="1.5" />
          <path d="M4.5 8h2M11 8h2M17.5 8h2M4.5 16h2M11 16h2M17.5 16h2" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
          <path d="M6 12h11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeDasharray="2 2" />
          <path d="M15 10l2 2-2 2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      );
    case 'free':
      return (
        <svg {...props}>
          <path d="M12 19l7-7 3 3-7 7-3-3z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M18 13l-1.5-7.5L2 2l3.5 14.5L13 18l5-5z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M2 2l7.586 7.586" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          <circle cx="11" cy="11" r="1" fill="currentColor" />
        </svg>
      );
    default:
      return null;
  }
};

interface Props {
  isOpen: boolean;
  activeRole: CreatorRole;
  onSelect: (role: CreatorRole) => void;
  onClose: () => void;
  lang: LangType;
}

export const RoleSelectorModal: React.FC<Props> = ({ isOpen, activeRole, onSelect, onClose, lang }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative bg-white dark:bg-stone-900 rounded-2xl shadow-2xl border border-stone-200 dark:border-stone-700 w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="px-6 pt-6 pb-3">
          <h3 className="text-lg font-bold text-stone-800 dark:text-stone-100">
            {lang === 'zh' ? '选择创作模式' : 'Select Creation Mode'}
          </h3>
          <p className="text-sm text-stone-500 dark:text-stone-400 mt-1">
            {lang === 'zh' ? '切换不同的 AI 创作助手角色' : 'Switch between different AI creation roles'}
          </p>
        </div>

        {/* Grid */}
        <div className="p-6 pt-3 grid grid-cols-3 gap-3">
          {ROLES.map((role) => {
            const isActive = role.id === activeRole;
            return (
              <button
                key={role.id}
                onClick={() => { onSelect(role.id); onClose(); }}
                className={`group flex flex-col items-center gap-2.5 p-4 rounded-xl border-2 transition-all duration-150 ${
                  isActive
                    ? 'border-teal-500 bg-teal-50 dark:bg-teal-900/20 text-teal-600 dark:text-teal-400'
                    : 'border-stone-100 dark:border-stone-800 bg-stone-50 dark:bg-stone-800/50 text-stone-500 dark:text-stone-400 hover:border-stone-300 dark:hover:border-stone-600 hover:bg-stone-100 dark:hover:bg-stone-800'
                }`}
              >
                <div className={`transition-transform duration-150 group-hover:scale-110 ${isActive ? 'text-teal-500' : ''}`}>
                  <RoleIcon roleId={role.id} className="w-9 h-9" />
                </div>
                <div className="text-center">
                  <div className={`text-xs font-bold leading-tight ${isActive ? 'text-teal-700 dark:text-teal-300' : 'text-stone-700 dark:text-stone-200'}`}>
                    {lang === 'zh' ? role.label_zh : role.label}
                  </div>
                  <div className="text-[10px] mt-0.5 leading-tight opacity-70">
                    {lang === 'zh' ? role.description_zh : role.description}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export { ROLES };
