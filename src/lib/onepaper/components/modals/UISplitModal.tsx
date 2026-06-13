import React, { useMemo, useState } from 'react';
import type { Artboard, DesignTokens, LangType } from '../../types';
import IconLoader from '../IconLoader';

type UISplitRegion = {
  id: string;
  name: string;
  nameZh: string;
  component: string;
  description: string;
  responsibilities: string[];
  props: string[];
  x: number;
  y: number;
  w: number;
  h: number;
};

type UISplitSpec = {
  title: string;
  platform: string;
  resolution: string;
  layoutType: string;
  regions: UISplitRegion[];
  implementationNotes: string[];
  tokens: DesignTokens;
};

type Props = {
  artboard: Artboard;
  lang: LangType;
  onClose: () => void;
};

const fallbackTokens: DesignTokens = {
  primaryColor: '#14b8a6',
  backgroundColor: '#ffffff',
  accentColor: '#06b6d4',
  decorativeColor: '#f59e0b',
  borderRadius: 'medium',
  spacing: 'comfortable',
};

const radiusClassMap: Record<string, string> = {
  none: 'rounded-none',
  small: 'rounded',
  medium: 'rounded-lg',
  large: 'rounded-2xl',
  full: 'rounded-full',
};

const spacingClassMap: Record<string, string> = {
  compact: 'gap-2 p-3',
  comfortable: 'gap-4 p-5',
  spacious: 'gap-6 p-8',
};

const clamp = (value: number, min: number, max: number) => Math.max(min, Math.min(max, value));

const getPromptText = (artboard: Artboard) => {
  const details = artboard.image.details;
  return [
    artboard.label,
    artboard.image.prompt,
    details?.originalDescription,
    details?.fullPrompt,
  ].filter(Boolean).join('\n').toLowerCase();
};

const detectLayoutType = (prompt: string, width: number, height: number) => {
  const isMobile = height > width * 1.2;

  if (/login|sign in|signup|register|auth|onboarding|登录|注册|引导/.test(prompt)) return isMobile ? 'mobile-auth' : 'auth';
  if (/dashboard|admin|analytics|chart|table|metric|crm|后台|仪表盘|数据|表格/.test(prompt)) return 'dashboard';
  if (/shop|product|cart|checkout|pricing|store|电商|商品|购物|支付/.test(prompt)) return 'commerce';
  if (/chat|message|inbox|assistant|conversation|聊天|消息|会话/.test(prompt)) return 'chat';
  if (/profile|settings|account|preferences|个人|设置|账户/.test(prompt)) return isMobile ? 'mobile-settings' : 'settings';
  if (isMobile) return 'mobile-app';
  return 'landing';
};

const region = (
  id: string,
  name: string,
  nameZh: string,
  component: string,
  description: string,
  responsibilities: string[],
  props: string[],
  x: number,
  y: number,
  w: number,
  h: number
): UISplitRegion => ({ id, name, nameZh, component, description, responsibilities, props, x, y, w, h });

const buildRegions = (layoutType: string): UISplitRegion[] => {
  switch (layoutType) {
    case 'dashboard':
      return [
        region('sidebar', 'Sidebar Navigation', '侧边导航', 'SidebarNav', 'Persistent product navigation and workspace switcher.', ['Route links', 'Workspace identity', 'Collapsed state'], ['items', 'activeKey', 'onNavigate'], 0, 0, 20, 100),
        region('topbar', 'Top Bar', '顶部栏', 'TopBar', 'Search, account actions, and page-level commands.', ['Search input', 'User actions', 'Global filters'], ['title', 'actions', 'user'], 20, 0, 80, 12),
        region('metrics', 'Metric Cards', '指标卡片', 'MetricGrid', 'High-priority KPI cards for scanning.', ['Summary values', 'Trend state', 'Status colors'], ['metrics', 'period'], 22, 15, 74, 20),
        region('main-chart', 'Primary Chart', '主图表区', 'AnalyticsPanel', 'Main visualization or analysis workspace.', ['Chart state', 'Empty/loading states', 'Legend'], ['data', 'filters'], 22, 38, 46, 35),
        region('side-panel', 'Insight Panel', '侧栏信息', 'InsightPanel', 'Supporting details, recommendations, or activity.', ['Secondary insights', 'Activity stream', 'Quick actions'], ['items', 'onAction'], 70, 38, 26, 35),
        region('table', 'Data Table', '数据表格', 'DataTable', 'Dense row-based data with sorting and pagination.', ['Columns', 'Row actions', 'Pagination'], ['rows', 'columns', 'onSort'], 22, 76, 74, 20),
      ];
    case 'auth':
    case 'mobile-auth':
      return [
        region('brand-panel', 'Brand Panel', '品牌视觉区', 'BrandPanel', 'Brand mark, value proposition, or illustration.', ['Logo', 'Primary message', 'Visual anchor'], ['logo', 'headline', 'image'], 0, 0, layoutType === 'mobile-auth' ? 100 : 48, layoutType === 'mobile-auth' ? 30 : 100),
        region('auth-card', 'Auth Form', '登录表单', 'AuthForm', 'Primary credential form and validation states.', ['Inputs', 'Submit button', 'Validation copy'], ['mode', 'onSubmit', 'loading'], layoutType === 'mobile-auth' ? 8 : 56, layoutType === 'mobile-auth' ? 32 : 18, layoutType === 'mobile-auth' ? 84 : 34, layoutType === 'mobile-auth' ? 48 : 58),
        region('secondary-actions', 'Secondary Actions', '辅助操作', 'AuthSecondaryActions', 'Forgot password, social login, and legal links.', ['Social buttons', 'Password recovery', 'Legal copy'], ['providers', 'links'], layoutType === 'mobile-auth' ? 8 : 56, layoutType === 'mobile-auth' ? 82 : 78, layoutType === 'mobile-auth' ? 84 : 34, 14),
      ];
    case 'commerce':
      return [
        region('header', 'Commerce Header', '电商顶部栏', 'CommerceHeader', 'Navigation, search, account, and cart access.', ['Search', 'Category nav', 'Cart badge'], ['categories', 'cartCount'], 0, 0, 100, 12),
        region('hero-product', 'Product Hero', '商品主视觉', 'ProductHero', 'Main offer, featured product, and conversion CTA.', ['Product image', 'Offer copy', 'Primary CTA'], ['product', 'onAddToCart'], 5, 15, 90, 38),
        region('catalog-grid', 'Catalog Grid', '商品网格', 'ProductGrid', 'Product cards or content tiles.', ['Cards', 'Price display', 'Favorite state'], ['products', 'onSelect'], 5, 56, 64, 36),
        region('filters-cart', 'Filter / Cart Panel', '筛选购物栏', 'CommerceSidePanel', 'Filters, cart summary, or recommendations.', ['Filters', 'Summary', 'Recommendations'], ['filters', 'summary'], 72, 56, 23, 36),
      ];
    case 'chat':
      return [
        region('thread-list', 'Thread List', '会话列表', 'ThreadList', 'Conversation navigation and search.', ['Conversation previews', 'Unread states', 'Search'], ['threads', 'activeThreadId'], 0, 0, 28, 100),
        region('chat-header', 'Chat Header', '聊天顶部栏', 'ChatHeader', 'Selected contact or assistant context.', ['Title', 'Presence', 'Actions'], ['thread', 'actions'], 28, 0, 72, 12),
        region('messages', 'Message Stream', '消息流', 'MessageStream', 'Scrollable conversation body.', ['Message groups', 'Timestamps', 'Typing indicator'], ['messages', 'isTyping'], 28, 12, 72, 74),
        region('composer', 'Composer', '输入框', 'MessageComposer', 'Input, attachments, and send action.', ['Text input', 'Attachment tools', 'Submit state'], ['value', 'onChange', 'onSend'], 28, 86, 72, 14),
      ];
    case 'settings':
    case 'mobile-settings':
      return [
        region('settings-nav', 'Settings Navigation', '设置导航', 'SettingsNav', 'Groups settings by category.', ['Section links', 'Active section', 'Badges'], ['sections', 'activeSection'], 0, 0, layoutType === 'mobile-settings' ? 100 : 26, layoutType === 'mobile-settings' ? 16 : 100),
        region('settings-form', 'Settings Form', '设置表单', 'SettingsForm', 'Editable user or product settings.', ['Fields', 'Validation', 'Save state'], ['values', 'onChange', 'onSave'], layoutType === 'mobile-settings' ? 5 : 30, layoutType === 'mobile-settings' ? 18 : 10, layoutType === 'mobile-settings' ? 90 : 46, 70),
        region('help-panel', 'Help Panel', '帮助面板', 'HelpPanel', 'Contextual guidance and account metadata.', ['Hints', 'Status', 'Secondary actions'], ['items'], layoutType === 'mobile-settings' ? 5 : 78, layoutType === 'mobile-settings' ? 88 : 10, layoutType === 'mobile-settings' ? 90 : 18, layoutType === 'mobile-settings' ? 10 : 70),
      ];
    case 'mobile-app':
      return [
        region('status-header', 'App Header', '应用顶部栏', 'AppHeader', 'Screen title, navigation, and key actions.', ['Title', 'Back/menu action', 'Primary icon action'], ['title', 'onBack', 'actions'], 0, 0, 100, 14),
        region('summary-card', 'Summary Card', '摘要卡片', 'SummaryCard', 'Main state or featured content.', ['Primary metric/content', 'CTA', 'Status'], ['data', 'onAction'], 5, 16, 90, 24),
        region('content-list', 'Content List', '内容列表', 'ContentList', 'Primary scrollable content.', ['Rows/cards', 'Empty state', 'Loading state'], ['items', 'renderItem'], 5, 43, 90, 43),
        region('bottom-nav', 'Bottom Navigation', '底部导航', 'BottomNav', 'Top-level mobile navigation.', ['Tabs', 'Active state', 'Badges'], ['items', 'activeKey'], 0, 88, 100, 12),
      ];
    default:
      return [
        region('header', 'Header', '页头导航', 'Header', 'Top navigation, brand, and primary actions.', ['Brand identity', 'Navigation links', 'CTA'], ['navItems', 'cta'], 0, 0, 100, 12),
        region('hero', 'Hero Section', '首屏主视觉', 'HeroSection', 'Primary story, headline, and conversion action.', ['Headline', 'Supporting copy', 'Primary media', 'CTA'], ['headline', 'description', 'media'], 0, 12, 100, 42),
        region('content-grid', 'Content Grid', '内容网格', 'FeatureGrid', 'Reusable cards or feature modules.', ['Card list', 'Icons/media', 'Responsive grid'], ['items'], 6, 57, 88, 28),
        region('secondary-band', 'Secondary Band', '辅助内容区', 'SecondaryBand', 'Proof, testimonials, steps, or additional content.', ['Supporting blocks', 'Social proof', 'CTA'], ['items'], 6, 86, 88, 10),
        region('footer', 'Footer', '页脚', 'Footer', 'Low-priority navigation and metadata.', ['Links', 'Legal', 'Social'], ['links'], 0, 96, 100, 4),
      ];
  }
};

const buildSpec = (artboard: Artboard): UISplitSpec => {
  const details = artboard.image.details;
  const [rawWidth, rawHeight] = (details?.resolution || `${artboard.width}x${artboard.height}`).split('x').map(Number);
  const width = rawWidth || artboard.width || 1000;
  const height = rawHeight || artboard.height || 1000;
  const prompt = getPromptText(artboard);
  const layoutType = detectLayoutType(prompt, width, height);
  const tokens = details?.tokens || fallbackTokens;

  return {
    title: artboard.label || details?.originalDescription || 'UI Screen',
    platform: details?.platform || (height > width ? 'mobile' : 'web'),
    resolution: `${width}x${height}`,
    layoutType,
    regions: buildRegions(layoutType),
    tokens,
    implementationNotes: [
      'Use the region map as a component boundary guide, then replace placeholder content with real data contracts.',
      'Start with layout primitives first: shell, navigation, content regions, then fill leaf components.',
      'Keep visual tokens centralized so generated images and implementation stay aligned.',
      'Convert absolute percentages into responsive CSS grid/flex rules after the first scaffold is working.',
    ],
  };
};

const regionToTailwind = (item: UISplitRegion) => {
  return `absolute left-[${item.x}%] top-[${item.y}%] w-[${item.w}%] h-[${item.h}%]`;
};

const buildReactCode = (spec: UISplitSpec) => {
  const radius = radiusClassMap[spec.tokens.borderRadius] || radiusClassMap.medium;
  const spacing = spacingClassMap[spec.tokens.spacing] || spacingClassMap.comfortable;
  const imports = `import React from 'react';`;
  const regionTypes = spec.regions
    .map(item => `type ${item.component}Props = {\n  ${item.props.map(prop => `${prop}?: unknown;`).join('\n  ')}\n};`)
    .join('\n\n');
  const components = spec.regions
    .map(item => {
      return [
        `function ${item.component}(_props: ${item.component}Props) {`,
        `  return (`,
        `    <section className="${regionToTailwind(item)} ${spacing} ${radius} border border-slate-200 bg-white/90 shadow-sm overflow-hidden">`,
        `      <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">${item.name}</p>`,
        `      <div className="mt-2 text-sm text-slate-700">${item.description}</div>`,
        `    </section>`,
        `  );`,
        `}`,
      ].join('\n');
    })
    .join('\n\n');
  const screen = [
    `export default function SplitUIScreen() {`,
    `  return (`,
    `    <main className="relative min-h-screen overflow-hidden" style={{ background: '${spec.tokens.backgroundColor}' }}>`,
    ...spec.regions.map(item => `      <${item.component} />`),
    `    </main>`,
    `  );`,
    `}`,
  ].join('\n');

  return [imports, regionTypes, components, screen].join('\n\n');
};

const buildMarkdown = (spec: UISplitSpec) => {
  return [
    `# ${spec.title}`,
    '',
    `- Platform: ${spec.platform}`,
    `- Resolution: ${spec.resolution}`,
    `- Layout: ${spec.layoutType}`,
    '',
    '## Component Regions',
    ...spec.regions.map((item, index) => [
      '',
      `### ${index + 1}. ${item.component}`,
      `- Region: ${item.name}`,
      `- Bounds: x ${item.x}%, y ${item.y}%, w ${item.w}%, h ${item.h}%`,
      `- Responsibility: ${item.responsibilities.join('; ')}`,
      `- Props: ${item.props.join(', ') || 'none'}`,
      `- Notes: ${item.description}`,
    ].join('\n')),
    '',
    '## Implementation Notes',
    ...spec.implementationNotes.map(note => `- ${note}`),
  ].join('\n');
};

const copyText = async (text: string) => {
  await navigator.clipboard.writeText(text);
};

const downloadText = (filename: string, text: string, type: string) => {
  const blob = new Blob([text], { type });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

export default function UISplitModal({ artboard, lang, onClose }: Props) {
  const spec = useMemo(() => buildSpec(artboard), [artboard]);
  const [activeTab, setActiveTab] = useState<'map' | 'json' | 'code'>('map');
  const [selectedId, setSelectedId] = useState(spec.regions[0]?.id || '');
  const [copied, setCopied] = useState<string | null>(null);
  const isZh = lang === 'zh';
  const code = useMemo(() => buildReactCode(spec), [spec]);
  const markdown = useMemo(() => buildMarkdown(spec), [spec]);
  const selectedRegion = spec.regions.find(item => item.id === selectedId) || spec.regions[0];
  const json = JSON.stringify(spec, null, 2);

  const handleCopy = async (label: string, text: string) => {
    try {
      await copyText(text);
      setCopied(label);
      window.setTimeout(() => setCopied(null), 1600);
    } catch {
      setCopied(isZh ? '复制失败' : 'Copy failed');
      window.setTimeout(() => setCopied(null), 1600);
    }
  };

  return (
    <div className="fixed inset-0 z-[115] bg-black/70 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6" onMouseDown={onClose}>
      <div
        className="w-full max-w-6xl max-h-[92vh] bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-700 rounded-xl shadow-2xl overflow-hidden flex flex-col"
        onMouseDown={event => event.stopPropagation()}
      >
        <div className="flex items-center justify-between gap-3 px-4 py-3 border-b border-stone-200 dark:border-stone-800">
          <div className="min-w-0">
            <h3 className="text-sm font-bold text-stone-900 dark:text-stone-100">
              {isZh ? '拆分 UI' : 'Split UI'}
            </h3>
            <p className="text-xs text-stone-500 dark:text-stone-400 truncate">
              {spec.title} · {spec.resolution} · {spec.layoutType}
            </p>
          </div>
          <div className="flex items-center gap-2">
            {copied && <span className="hidden sm:inline text-xs text-teal-600 dark:text-teal-300">{copied}</span>}
            <button
              type="button"
              onClick={() => downloadText('ui-split-spec.json', json, 'application/json;charset=utf-8')}
              className="min-h-9 px-3 rounded-lg border border-stone-200 dark:border-stone-700 text-xs text-stone-600 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800 flex items-center gap-2"
            >
              <IconLoader name="download" size={14} />
              JSON
            </button>
            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-lg text-stone-500 hover:bg-stone-100 dark:hover:bg-stone-800"
              title={isZh ? '关闭' : 'Close'}
            >
              <IconLoader name="x" size={18} />
            </button>
          </div>
        </div>

        <div className="flex flex-wrap gap-2 px-4 py-3 border-b border-stone-200 dark:border-stone-800 bg-stone-50 dark:bg-stone-950">
          {[
            { id: 'map', label: isZh ? '区域图' : 'Region Map', icon: 'layout' },
            { id: 'json', label: 'JSON', icon: 'code' },
            { id: 'code', label: isZh ? '代码骨架' : 'Code Scaffold', icon: 'code' },
          ].map(tab => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id as typeof activeTab)}
              className={`min-h-9 px-3 rounded-lg text-xs font-bold flex items-center gap-2 transition-colors ${
                activeTab === tab.id
                  ? 'bg-white dark:bg-stone-800 text-teal-700 dark:text-teal-300 shadow-sm'
                  : 'text-stone-500 dark:text-stone-400 hover:bg-white/70 dark:hover:bg-stone-800/70'
              }`}
            >
              <IconLoader name={tab.icon as any} size={14} />
              {tab.label}
            </button>
          ))}
          <button
            type="button"
            onClick={() => handleCopy(isZh ? '已复制说明' : 'Copied brief', markdown)}
            className="ml-auto min-h-9 px-3 rounded-lg text-xs text-stone-600 dark:text-stone-300 hover:bg-white dark:hover:bg-stone-800 border border-transparent hover:border-stone-200 dark:hover:border-stone-700 flex items-center gap-2"
          >
            <IconLoader name="copy" size={14} />
            {isZh ? '复制说明' : 'Copy Brief'}
          </button>
        </div>

        <div className="flex-1 min-h-0 overflow-y-auto custom-scrollbar p-4">
          {activeTab === 'map' && (
            <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_340px] gap-4">
              <div className="rounded-lg bg-stone-100 dark:bg-stone-950 border border-stone-200 dark:border-stone-800 p-3">
                <div className="relative mx-auto overflow-hidden rounded-lg border border-stone-300 dark:border-stone-700 bg-white" style={{ aspectRatio: `${artboard.width} / ${artboard.height}`, maxHeight: '68vh' }}>
                  <img src={artboard.image.url} alt="" className="h-full w-full object-contain" />
                  {spec.regions.map((item, index) => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => setSelectedId(item.id)}
                      className={`absolute border-2 text-left transition-colors ${
                        selectedId === item.id
                          ? 'border-teal-400 bg-teal-500/20'
                          : 'border-indigo-400/80 bg-indigo-500/10 hover:bg-indigo-500/20'
                      }`}
                      style={{
                        left: `${clamp(item.x, 0, 100)}%`,
                        top: `${clamp(item.y, 0, 100)}%`,
                        width: `${clamp(item.w, 1, 100)}%`,
                        height: `${clamp(item.h, 1, 100)}%`,
                      }}
                    >
                      <span className="absolute left-1 top-1 rounded bg-black/70 px-1.5 py-0.5 text-[10px] font-bold text-white">
                        {index + 1}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-3">
                {selectedRegion && (
                  <div className="rounded-lg border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-950 p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <h4 className="text-sm font-bold text-stone-900 dark:text-stone-100">
                          {isZh ? selectedRegion.nameZh : selectedRegion.name}
                        </h4>
                        <p className="mt-1 text-xs font-mono text-teal-700 dark:text-teal-300">{selectedRegion.component}</p>
                      </div>
                      <span className="rounded bg-stone-100 dark:bg-stone-800 px-2 py-1 text-[10px] text-stone-500">
                        {selectedRegion.x}% / {selectedRegion.y}%
                      </span>
                    </div>
                    <p className="mt-3 text-xs leading-relaxed text-stone-600 dark:text-stone-300">
                      {selectedRegion.description}
                    </p>
                    <div className="mt-3">
                      <p className="text-[10px] font-bold uppercase text-stone-400">{isZh ? '职责' : 'Responsibilities'}</p>
                      <ul className="mt-1 space-y-1 text-xs text-stone-600 dark:text-stone-300">
                        {selectedRegion.responsibilities.map(item => <li key={item}>- {item}</li>)}
                      </ul>
                    </div>
                    <div className="mt-3">
                      <p className="text-[10px] font-bold uppercase text-stone-400">Props</p>
                      <div className="mt-1 flex flex-wrap gap-1.5">
                        {selectedRegion.props.map(prop => (
                          <code key={prop} className="rounded bg-stone-100 dark:bg-stone-800 px-2 py-1 text-[10px] text-stone-700 dark:text-stone-200">
                            {prop}
                          </code>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                <div className="rounded-lg border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-950 p-4">
                  <h4 className="text-xs font-bold uppercase text-stone-500 dark:text-stone-400">
                    {isZh ? '组件树' : 'Component Tree'}
                  </h4>
                  <div className="mt-3 space-y-2">
                    {spec.regions.map((item, index) => (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => setSelectedId(item.id)}
                        className={`w-full text-left rounded-lg border px-3 py-2 transition-colors ${
                          selectedId === item.id
                            ? 'border-teal-300 bg-teal-50 dark:border-teal-900 dark:bg-teal-950/30'
                            : 'border-stone-200 dark:border-stone-800 hover:bg-stone-50 dark:hover:bg-stone-800'
                        }`}
                      >
                        <span className="text-[10px] text-stone-400">{String(index + 1).padStart(2, '0')}</span>
                        <span className="ml-2 text-xs font-bold text-stone-800 dark:text-stone-100">{item.component}</span>
                        <span className="ml-2 text-[10px] text-stone-500">{isZh ? item.nameZh : item.name}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'json' && (
            <div className="space-y-3">
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => handleCopy(isZh ? '已复制 JSON' : 'Copied JSON', json)}
                  className="min-h-9 px-3 rounded-lg bg-stone-900 dark:bg-stone-100 text-white dark:text-stone-900 text-xs font-bold flex items-center gap-2"
                >
                  <IconLoader name="copy" size={14} />
                  {isZh ? '复制 JSON' : 'Copy JSON'}
                </button>
              </div>
              <pre className="max-h-[66vh] overflow-auto custom-scrollbar rounded-lg bg-stone-950 p-4 text-xs leading-relaxed text-stone-100">
                {json}
              </pre>
            </div>
          )}

          {activeTab === 'code' && (
            <div className="space-y-3">
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => handleCopy(isZh ? '已复制代码' : 'Copied code', code)}
                  className="min-h-9 px-3 rounded-lg bg-stone-900 dark:bg-stone-100 text-white dark:text-stone-900 text-xs font-bold flex items-center gap-2"
                >
                  <IconLoader name="copy" size={14} />
                  {isZh ? '复制代码' : 'Copy Code'}
                </button>
                <button
                  type="button"
                  onClick={() => downloadText('SplitUIScreen.tsx', code, 'text/plain;charset=utf-8')}
                  className="min-h-9 px-3 rounded-lg border border-stone-200 dark:border-stone-700 text-xs text-stone-600 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800 flex items-center gap-2"
                >
                  <IconLoader name="download" size={14} />
                  TSX
                </button>
              </div>
              <pre className="max-h-[66vh] overflow-auto custom-scrollbar rounded-lg bg-stone-950 p-4 text-xs leading-relaxed text-stone-100">
                {code}
              </pre>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
