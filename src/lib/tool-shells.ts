import { toolRoutes } from './tool-routes';

export type ToolShellConfig = {
  title: string;
  description: string;
  toolName: string;
  toolType?: string;
  toolsHref?: string;
  accent?: string;
  iconHref?: string;
  appleTouchIconHref?: string;
  lang?: string;
  bodyClass?: string;
  fontLinks?: readonly string[];
  tailwindConfig?: string;
  toolGlobalStyle?: string;
};

export const onePaperTailwindConfig = `
  window.tailwind = window.tailwind || {};
  window.tailwind.config = {
    darkMode: 'class',
    theme: {
      extend: {
        fontFamily: {
          sans: ['Inter', 'sans-serif'],
        },
      },
    },
  };
`;

export const onePaperShell = {
  title: 'OnePaper 视觉设计台 | 木风',
  description: '用 AI 生成 UI 原型、封面、信息图和视觉草稿。木风工具箱出品。',
  toolName: 'OnePaper 视觉设计台',
  toolType: 'AI 视觉设计',
  toolsHref: toolRoutes.index,
  accent: '#0f766e',
  iconHref: '/integrations/onepaper/logo.png',
  appleTouchIconHref: '/integrations/onepaper/logo.png',
  fontLinks: [
    'https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Noto+Serif+SC:wght@500;700&family=Outfit:wght@400;500;600;700&display=swap',
    'https://fonts.googleapis.com/css2?family=Bangers&family=Pacifico&family=Orbitron:wght@400;700&family=Creepster&family=Abril+Fatface&display=swap',
  ],
  tailwindConfig: onePaperTailwindConfig,
} satisfies ToolShellConfig;

export const onePaperFocusedShell = {
  ...onePaperShell,
  fontLinks: [
    'https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap',
    'https://fonts.googleapis.com/css2?family=Bangers&family=Pacifico&family=Orbitron:wght@400;700&family=Creepster&family=Abril+Fatface&display=swap',
  ],
} satisfies ToolShellConfig;
