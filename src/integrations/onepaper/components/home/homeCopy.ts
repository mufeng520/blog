import type { LangType } from '../../types';

export const HOME_COPY = {
  zh: {
    lightMode: '\u6d45\u8272\u6a21\u5f0f',
    darkMode: '\u6df1\u8272\u6a21\u5f0f',
    languageToggle: 'English',
    apiSettings: 'API Key \u8bbe\u7f6e',
    myProjects: '\u6211\u7684\u9879\u76ee',
    projectMeta: (count: number) => `${count} \u4e2a\u9879\u76ee \u00b7 \u6700\u8fd1\u66f4\u65b0`,
    newProject: '\u65b0\u5efa\u9879\u76ee',
    createBlankProject: '\u521b\u5efa\u7a7a\u767d\u9879\u76ee',
    rename: '\u91cd\u547d\u540d',
    delete: '\u5220\u9664',
  },
  en: {
    lightMode: 'Light Mode',
    darkMode: 'Dark Mode',
    languageToggle: '\u4e2d\u6587',
    apiSettings: 'API Key Settings',
    myProjects: 'My Projects',
    projectMeta: (count: number) => `${count} Projects \u00b7 Recently updated`,
    newProject: 'New Project',
    createBlankProject: 'Create Blank Project',
    rename: 'Rename',
    delete: 'Delete',
  },
} as const;

export const getHomeCopy = (lang: LangType) => HOME_COPY[lang];
