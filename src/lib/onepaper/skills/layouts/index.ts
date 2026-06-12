const rawTemplateLoaders = import.meta.glob('./*.md', { query: '?raw', import: 'default' }) as Record<string, () => Promise<string>>;

const loadRawTemplate = async (contentPath: string): Promise<string> => {
    const loader = rawTemplateLoaders[`./${contentPath}.md`];
    return loader ? loader() : '';
};

export interface LayoutDensityTemplate {
    id: string;
    name: string;
    name_zh: string;
    category: 'Density' | 'Structure' | 'Flow';
    description: string;
    description_zh: string;
    contentPath: string;
}

export const LAYOUT_DENSITY_TEMPLATES: LayoutDensityTemplate[] = [
    {
        id: 'sparse',
        name: 'Sparse',
        name_zh: '极简留白',
        category: 'Density',
        description: 'Extreme minimalism with single focal point and generous whitespace. 3-5 elements per screen.',
        description_zh: '极端极简主义，单焦点设计，大量留白。每屏 3-5 个元素。',
        contentPath: 'sparse',
    },
    {
        id: 'balanced',
        name: 'Balanced',
        name_zh: '均衡经典',
        category: 'Density',
        description: 'Classic grid with comfortable spacing. 6-10 elements, 2-3 columns.',
        description_zh: '经典网格，舒适间距。每屏 6-10 个元素，2-3 列布局。',
        contentPath: 'balanced',
    },
    {
        id: 'dense',
        name: 'Dense',
        name_zh: '高密度仪表盘',
        category: 'Density',
        description: 'Dashboard-style high density. 15-25 elements, multi-panel layout.',
        description_zh: '仪表盘式高密度布局。每屏 15-25 个元素，多面板结构。',
        contentPath: 'dense',
    },
    {
        id: 'hero-centric',
        name: 'Hero Centric',
        name_zh: '大图主导',
        category: 'Structure',
        description: 'Visual-first with large hero image occupying 50-70% of viewport.',
        description_zh: '视觉优先，大图占据 50-70% 视口高度，适合营销页。',
        contentPath: 'hero-centric',
    },
    {
        id: 'card-grid',
        name: 'Card Grid',
        name_zh: '卡片网格',
        category: 'Structure',
        description: 'Modular card-based grid. 2-4 cards per row, self-contained units.',
        description_zh: '模块化卡片网格。每行 2-4 张卡片，独立内容单元。',
        contentPath: 'card-grid',
    },
    {
        id: 'sidebar-nav',
        name: 'Sidebar Nav',
        name_zh: '侧边导航',
        category: 'Structure',
        description: 'Persistent sidebar with tree navigation + main content area.',
        description_zh: '常驻侧边栏树形导航 + 主内容区，适合工具型应用。',
        contentPath: 'sidebar-nav',
    },
    {
        id: 'timeline-flow',
        name: 'Timeline Flow',
        name_zh: '时间线流',
        category: 'Flow',
        description: 'Step-oriented chronological layout. Ideal for wizards and onboarding.',
        description_zh: '步骤导向的时间线布局，适合向导和流程引导。',
        contentPath: 'timeline-flow',
    },
    {
        id: 'split-screen',
        name: 'Split Screen',
        name_zh: '分屏对比',
        category: 'Structure',
        description: 'Two-zone split layout for comparison or image+content pairing.',
        description_zh: '双区分屏布局，用于对比展示或图文配对。',
        contentPath: 'split-screen',
    }
];

export const getLayoutDensityList = () =>
    LAYOUT_DENSITY_TEMPLATES;

export const getLayoutDensityById = (id: string): LayoutDensityTemplate | undefined =>
    LAYOUT_DENSITY_TEMPLATES.find(t => t.id === id);

export const loadLayoutDensityContent = async (id: string): Promise<string> => {
    const template = getLayoutDensityById(id);
    return template ? loadRawTemplate(template.contentPath) : '';
};
