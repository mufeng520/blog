import { onePaperShell, type ToolShellConfig } from './tool-shells';
import { toolRoutes } from './tool-routes';

export type ToolCatalogItem = {
  name: string;
  url: string;
  type: string;
  status: string;
  description: string;
  tags?: string[];
};

export type ToolAppRegistration = {
  id: string;
  kind: 'react-island-app';
  shell: ToolShellConfig;
  catalog: ToolCatalogItem;
  routes: {
    home: string;
    editor?: (projectId: string) => string;
    livePreview?: string;
  };
};

export const toolApps = {
  onePaper: {
    id: 'onepaper',
    kind: 'react-island-app',
    shell: onePaperShell,
    catalog: {
      name: 'OnePaper 视觉设计台',
      url: toolRoutes.onePaper.home,
      type: 'AI 工具',
      status: '已接入',
      description: '用于生成 UI 原型、封面、信息图、贴纸和视觉草稿，内置项目管理、画板和本地历史记录。',
      tags: ['AI', 'UI', '视觉设计'],
    },
    routes: {
      home: toolRoutes.onePaper.home,
      editor: toolRoutes.onePaper.editor,
      livePreview: toolRoutes.onePaper.livePreview,
    },
  },
} satisfies Record<string, ToolAppRegistration>;

export const independentToolApps = [
  toolApps.onePaper,
] as const;

export const independentToolCatalogItems = independentToolApps.map((app) => app.catalog);
