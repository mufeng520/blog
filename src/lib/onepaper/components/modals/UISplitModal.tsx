import React, { useCallback, useEffect, useMemo, useState } from 'react';
import type { Artboard, DesignTokens, LangType } from '../../types';
import IconLoader, { type IconName } from '../IconLoader';

type UISplitImplementation = 'code' | 'texture' | 'hybrid';

type UISplitAssetKind = 'visual-texture' | 'product-media' | 'decorative-background' | 'reference-crop';

type UISplitBounds = {
  x: number;
  y: number;
  w: number;
  h: number;
};

type UISplitRegion = UISplitBounds & {
  id: string;
  name: string;
  nameZh: string;
  component: string;
  description: string;
  responsibilities: string[];
  props: string[];
  implementation: UISplitImplementation;
  implementationReason: string;
  cssStrategy: string;
  assetKey?: string;
  assetFilename?: string;
  assetKind?: UISplitAssetKind;
};

type UISplitAsset = {
  id: string;
  regionId: string;
  key: string;
  name: string;
  nameZh: string;
  filename: string;
  kind: UISplitAssetKind;
  bounds: UISplitBounds;
  reason: string;
  usage: string;
};

type UISplitExtractedAsset = UISplitAsset & {
  status: 'pending' | 'ready' | 'error';
  dataUrl?: string;
  pixelWidth?: number;
  pixelHeight?: number;
  error?: string;
};

type UISplitSpec = {
  title: string;
  platform: string;
  resolution: string;
  layoutType: string;
  regions: UISplitRegion[];
  assets: UISplitAsset[];
  implementationNotes: string[];
  tokens: DesignTokens;
};

type UISplitTab = 'map' | 'assets' | 'json' | 'code';

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

const implementationLabels: Record<UISplitImplementation, { en: string; zh: string; className: string }> = {
  code: {
    en: 'Code',
    zh: '代码实现',
    className: 'border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-200',
  },
  texture: {
    en: 'Texture',
    zh: '贴图资产',
    className: 'border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-900 dark:bg-amber-950/40 dark:text-amber-200',
  },
  hybrid: {
    en: 'Code + Texture',
    zh: '代码 + 贴图',
    className: 'border-sky-200 bg-sky-50 text-sky-700 dark:border-sky-900 dark:bg-sky-950/40 dark:text-sky-200',
  },
};

const assetKindLabels: Record<UISplitAssetKind, { en: string; zh: string }> = {
  'visual-texture': { en: 'Visual texture', zh: '视觉贴图' },
  'product-media': { en: 'Product media', zh: '产品/媒体图' },
  'decorative-background': { en: 'Decorative background', zh: '装饰背景' },
  'reference-crop': { en: 'Reference crop', zh: '参考切片' },
};

const clamp = (value: number, min: number, max: number) => Math.max(min, Math.min(max, value));

const safeFilename = (value: string) => {
  const cleaned = value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
  return cleaned || 'ui-asset';
};

const toAssetKey = (value: string) => {
  const parts = safeFilename(value).split('-').filter(Boolean);
  const key = parts
    .map((part, index) => index === 0 ? part : `${part.charAt(0).toUpperCase()}${part.slice(1)}`)
    .join('');
  return key || 'uiAsset';
};

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

const baseRegion = (
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
): Omit<UISplitRegion, 'implementation' | 'implementationReason' | 'cssStrategy' | 'assetKey' | 'assetFilename' | 'assetKind'> => ({
  id,
  name,
  nameZh,
  component,
  description,
  responsibilities,
  props,
  x,
  y,
  w,
  h,
});

const buildBaseRegions = (
  layoutType: string
): Omit<UISplitRegion, 'implementation' | 'implementationReason' | 'cssStrategy' | 'assetKey' | 'assetFilename' | 'assetKind'>[] => {
  switch (layoutType) {
    case 'dashboard':
      return [
        baseRegion('sidebar', 'Sidebar Navigation', '侧边导航', 'SidebarNav', 'Persistent product navigation and workspace switcher.', ['Route links', 'Workspace identity', 'Collapsed state'], ['items', 'activeKey', 'onNavigate'], 0, 0, 20, 100),
        baseRegion('topbar', 'Top Bar', '顶部栏', 'TopBar', 'Search, account actions, and page-level commands.', ['Search input', 'User actions', 'Global filters'], ['title', 'actions', 'user'], 20, 0, 80, 12),
        baseRegion('metrics', 'Metric Cards', '指标卡片', 'MetricGrid', 'High-priority KPI cards for scanning.', ['Summary values', 'Trend state', 'Status colors'], ['metrics', 'period'], 22, 15, 74, 20),
        baseRegion('main-chart', 'Primary Chart', '主图表区', 'AnalyticsPanel', 'Main visualization or analysis workspace.', ['Chart state', 'Empty/loading states', 'Legend'], ['data', 'filters'], 22, 38, 46, 35),
        baseRegion('side-panel', 'Insight Panel', '侧栏信息', 'InsightPanel', 'Supporting details, recommendations, or activity.', ['Secondary insights', 'Activity stream', 'Quick actions'], ['items', 'onAction'], 70, 38, 26, 35),
        baseRegion('table', 'Data Table', '数据表格', 'DataTable', 'Dense row-based data with sorting and pagination.', ['Columns', 'Row actions', 'Pagination'], ['rows', 'columns', 'onSort'], 22, 76, 74, 20),
      ];
    case 'auth':
    case 'mobile-auth':
      return [
        baseRegion('brand-panel', 'Brand Panel', '品牌视觉区', 'BrandPanel', 'Brand mark, value proposition, or illustration.', ['Logo', 'Primary message', 'Visual anchor'], ['logo', 'headline', 'image'], 0, 0, layoutType === 'mobile-auth' ? 100 : 48, layoutType === 'mobile-auth' ? 30 : 100),
        baseRegion('auth-card', 'Auth Form', '登录表单', 'AuthForm', 'Primary credential form and validation states.', ['Inputs', 'Submit button', 'Validation copy'], ['mode', 'onSubmit', 'loading'], layoutType === 'mobile-auth' ? 8 : 56, layoutType === 'mobile-auth' ? 32 : 18, layoutType === 'mobile-auth' ? 84 : 34, layoutType === 'mobile-auth' ? 48 : 58),
        baseRegion('secondary-actions', 'Secondary Actions', '辅助操作', 'AuthSecondaryActions', 'Forgot password, social login, and legal links.', ['Social buttons', 'Password recovery', 'Legal copy'], ['providers', 'links'], layoutType === 'mobile-auth' ? 8 : 56, layoutType === 'mobile-auth' ? 82 : 78, layoutType === 'mobile-auth' ? 84 : 34, 14),
      ];
    case 'commerce':
      return [
        baseRegion('header', 'Commerce Header', '电商顶部栏', 'CommerceHeader', 'Navigation, search, account, and cart access.', ['Search', 'Category nav', 'Cart badge'], ['categories', 'cartCount'], 0, 0, 100, 12),
        baseRegion('hero-product', 'Product Hero', '商品主视觉', 'ProductHero', 'Main offer, featured product, and conversion CTA.', ['Product image', 'Offer copy', 'Primary CTA'], ['product', 'onAddToCart'], 5, 15, 90, 38),
        baseRegion('catalog-grid', 'Catalog Grid', '商品网格', 'ProductGrid', 'Product cards or content tiles.', ['Cards', 'Price display', 'Favorite state'], ['products', 'onSelect'], 5, 56, 64, 36),
        baseRegion('filters-cart', 'Filter / Cart Panel', '筛选购物栏', 'CommerceSidePanel', 'Filters, cart summary, or recommendations.', ['Filters', 'Summary', 'Recommendations'], ['filters', 'summary'], 72, 56, 23, 36),
      ];
    case 'chat':
      return [
        baseRegion('thread-list', 'Thread List', '会话列表', 'ThreadList', 'Conversation navigation and search.', ['Conversation previews', 'Unread states', 'Search'], ['threads', 'activeThreadId'], 0, 0, 28, 100),
        baseRegion('chat-header', 'Chat Header', '聊天顶部栏', 'ChatHeader', 'Selected contact or assistant context.', ['Title', 'Presence', 'Actions'], ['thread', 'actions'], 28, 0, 72, 12),
        baseRegion('messages', 'Message Stream', '消息流', 'MessageStream', 'Scrollable conversation body.', ['Message groups', 'Timestamps', 'Typing indicator'], ['messages', 'isTyping'], 28, 12, 72, 74),
        baseRegion('composer', 'Composer', '输入框', 'MessageComposer', 'Input, attachments, and send action.', ['Text input', 'Attachment tools', 'Submit state'], ['value', 'onChange', 'onSend'], 28, 86, 72, 14),
      ];
    case 'settings':
    case 'mobile-settings':
      return [
        baseRegion('settings-nav', 'Settings Navigation', '设置导航', 'SettingsNav', 'Groups settings by category.', ['Section links', 'Active section', 'Badges'], ['sections', 'activeSection'], 0, 0, layoutType === 'mobile-settings' ? 100 : 26, layoutType === 'mobile-settings' ? 16 : 100),
        baseRegion('settings-form', 'Settings Form', '设置表单', 'SettingsForm', 'Editable user or product settings.', ['Fields', 'Validation', 'Save state'], ['values', 'onChange', 'onSave'], layoutType === 'mobile-settings' ? 5 : 30, layoutType === 'mobile-settings' ? 18 : 10, layoutType === 'mobile-settings' ? 90 : 46, 70),
        baseRegion('help-panel', 'Help Panel', '帮助面板', 'HelpPanel', 'Contextual guidance and account metadata.', ['Hints', 'Status', 'Secondary actions'], ['items'], layoutType === 'mobile-settings' ? 5 : 78, layoutType === 'mobile-settings' ? 88 : 10, layoutType === 'mobile-settings' ? 90 : 18, layoutType === 'mobile-settings' ? 10 : 70),
      ];
    case 'mobile-app':
      return [
        baseRegion('status-header', 'App Header', '应用顶部栏', 'AppHeader', 'Screen title, navigation, and key actions.', ['Title', 'Back/menu action', 'Primary icon action'], ['title', 'onBack', 'actions'], 0, 0, 100, 14),
        baseRegion('summary-card', 'Summary Card', '摘要卡片', 'SummaryCard', 'Main state or featured content.', ['Primary metric/content', 'CTA', 'Status'], ['data', 'onAction'], 5, 16, 90, 24),
        baseRegion('content-list', 'Content List', '内容列表', 'ContentList', 'Primary scrollable content.', ['Rows/cards', 'Empty state', 'Loading state'], ['items', 'renderItem'], 5, 43, 90, 43),
        baseRegion('bottom-nav', 'Bottom Navigation', '底部导航', 'BottomNav', 'Top-level mobile navigation.', ['Tabs', 'Active state', 'Badges'], ['items', 'activeKey'], 0, 88, 100, 12),
      ];
    default:
      return [
        baseRegion('header', 'Header', '页头导航', 'Header', 'Top navigation, brand, and primary actions.', ['Brand identity', 'Navigation links', 'CTA'], ['navItems', 'cta'], 0, 0, 100, 12),
        baseRegion('hero', 'Hero Section', '首屏主视觉', 'HeroSection', 'Primary story, headline, and conversion action.', ['Headline', 'Supporting copy', 'Primary media', 'CTA'], ['headline', 'description', 'media'], 0, 12, 100, 42),
        baseRegion('content-grid', 'Content Grid', '内容网格', 'FeatureGrid', 'Reusable cards or feature modules.', ['Card list', 'Icons/media', 'Responsive grid'], ['items'], 6, 57, 88, 28),
        baseRegion('secondary-band', 'Secondary Band', '辅助内容区', 'SecondaryBand', 'Proof, testimonials, steps, or additional content.', ['Supporting blocks', 'Social proof', 'CTA'], ['items'], 6, 86, 88, 10),
        baseRegion('footer', 'Footer', '页脚', 'Footer', 'Low-priority navigation and metadata.', ['Links', 'Legal', 'Social'], ['links'], 0, 96, 100, 4),
      ];
  }
};

const classifyRegion = (
  item: ReturnType<typeof buildBaseRegions>[number],
  layoutType: string,
  prompt: string
): Pick<UISplitRegion, 'implementation' | 'implementationReason' | 'cssStrategy' | 'assetKind'> => {
  const searchable = `${layoutType} ${item.id} ${item.name} ${item.component} ${item.description} ${prompt}`;
  const isStructural = /header|nav|topbar|sidebar|form|table|list|grid|chart|metric|composer|settings|footer|filter|cart|message|thread/i.test(searchable);
  const isVisual = /hero|brand|product|media|image|photo|visual|illustration|artwork|mascot|background|poster|render|3d|主视觉|品牌|产品|图片|插画|照片|贴图|背景/.test(searchable);

  if (/brand-panel/i.test(item.id)) {
    return {
      implementation: 'hybrid',
      assetKind: 'visual-texture',
      implementationReason: 'Brand text and layout should be implemented in code, while the generated illustration/visual anchor is kept as a texture asset.',
      cssStrategy: 'Use a CSS grid/flex brand panel, then place the cropped visual as an image layer or background image.',
    };
  }

  if (/hero-product/i.test(item.id)) {
    return {
      implementation: 'hybrid',
      assetKind: 'product-media',
      implementationReason: 'Offer copy, price, and CTA are code; the product render or complex generated media should be exported as a texture.',
      cssStrategy: 'Build the responsive product hero in code and reference the product texture for the media area.',
    };
  }

  if (/hero/i.test(item.id)) {
    return {
      implementation: 'hybrid',
      assetKind: 'visual-texture',
      implementationReason: 'Hero typography and actions should stay editable in code, but generated artwork or atmospheric visual detail is safer as a texture.',
      cssStrategy: 'Implement headline, copy, and CTA as HTML; layer the cropped hero visual with object-fit or background-image.',
    };
  }

  if (!isStructural && isVisual) {
    return {
      implementation: 'texture',
      assetKind: 'decorative-background',
      implementationReason: 'This region is mostly custom visual detail, so exporting it as a texture avoids brittle CSS recreation.',
      cssStrategy: 'Reference the cropped PNG directly and position it with object-fit: cover.',
    };
  }

  return {
    implementation: 'code',
    implementationReason: 'This region is made of standard UI primitives such as layout, text, controls, lists, tables, or charts.',
    cssStrategy: 'Implement with semantic React components, CSS grid/flex, design tokens, and data-driven props.',
  };
};

const buildRegions = (layoutType: string, prompt: string): UISplitRegion[] => {
  return buildBaseRegions(layoutType).map(item => {
    const classification = classifyRegion(item, layoutType, prompt);
    const assetKey = classification.implementation === 'code' ? undefined : toAssetKey(item.id);
    const assetFilename = assetKey ? `assets/ui-split/${safeFilename(item.id)}.png` : undefined;

    return {
      ...item,
      ...classification,
      ...(assetKey ? { assetKey, assetFilename } : {}),
    };
  });
};

const buildAssets = (regions: UISplitRegion[]): UISplitAsset[] => {
  return regions
    .filter(item => item.implementation !== 'code' && item.assetKey && item.assetFilename && item.assetKind)
    .map(item => ({
      id: `asset-${item.id}`,
      regionId: item.id,
      key: item.assetKey || toAssetKey(item.id),
      name: `${item.name} Texture`,
      nameZh: `${item.nameZh}贴图`,
      filename: item.assetFilename || `assets/ui-split/${safeFilename(item.id)}.png`,
      kind: item.assetKind || 'reference-crop',
      bounds: { x: item.x, y: item.y, w: item.w, h: item.h },
      reason: item.implementationReason,
      usage: `Use as ${item.component} visual asset; keep text, controls, state, and interaction in code.`,
    }));
};

const buildSpec = (artboard: Artboard): UISplitSpec => {
  const details = artboard.image.details;
  const [rawWidth, rawHeight] = (details?.resolution || `${artboard.width}x${artboard.height}`).split('x').map(Number);
  const width = rawWidth || artboard.width || 1000;
  const height = rawHeight || artboard.height || 1000;
  const prompt = getPromptText(artboard);
  const layoutType = detectLayoutType(prompt, width, height);
  const tokens = details?.tokens || fallbackTokens;
  const regions = buildRegions(layoutType, prompt);

  return {
    title: artboard.label || details?.originalDescription || 'UI Screen',
    platform: details?.platform || (height > width ? 'mobile' : 'web'),
    resolution: `${width}x${height}`,
    layoutType,
    regions,
    assets: buildAssets(regions),
    tokens,
    implementationNotes: [
      'Treat code regions as editable React components with real state, props, validation, and responsive layout.',
      'Treat texture regions as generated visual assets; keep them isolated behind img/background-image references.',
      'For hybrid regions, rebuild text, buttons, and layout in code, then layer the exported texture only for the complex visual part.',
      'After the first scaffold runs, replace absolute percentages with production grid/flex rules while preserving the same component boundaries.',
    ],
  };
};

const regionToTailwind = (item: UISplitRegion) => {
  return `absolute left-[${item.x}%] top-[${item.y}%] w-[${item.w}%] h-[${item.h}%]`;
};

const getAssetForRegion = (spec: UISplitSpec, region: UISplitRegion) => {
  return spec.assets.find(asset => asset.regionId === region.id);
};

const buildAssetObjectCode = (assets: UISplitAsset[]) => {
  if (assets.length === 0) return 'const assets = {} as const;';

  return [
    'const assets = {',
    ...assets.map(asset => `  ${asset.key}: ${JSON.stringify(`/${asset.filename}`)},`),
    '} as const;',
  ].join('\n');
};

const buildRegionCode = (spec: UISplitSpec, item: UISplitRegion) => {
  const radius = radiusClassMap[spec.tokens.borderRadius] || radiusClassMap.medium;
  const spacing = spacingClassMap[spec.tokens.spacing] || spacingClassMap.comfortable;
  const asset = getAssetForRegion(spec, item);
  const baseClass = `${regionToTailwind(item)} ${spacing} ${radius} overflow-hidden`;

  if (item.implementation === 'texture' && asset) {
    return [
      `function ${item.component}(_props: ${item.component}Props) {`,
      `  return (`,
      `    <img`,
      `      className="${regionToTailwind(item)} ${radius} object-cover"`,
      `      src={assets.${asset.key}}`,
      `      alt=${JSON.stringify(item.name)}`,
      `    />`,
      `  );`,
      `}`,
    ].join('\n');
  }

  if (item.implementation === 'hybrid' && asset) {
    return [
      `function ${item.component}(_props: ${item.component}Props) {`,
      `  return (`,
      `    <section className="${baseClass} border border-slate-200 bg-white/90 shadow-sm">`,
      `      <img`,
      `        className="absolute inset-y-0 right-0 h-full w-1/2 object-cover"`,
      `        src={assets.${asset.key}}`,
      `        alt=""`,
      `        aria-hidden="true"`,
      `      />`,
      `      <div className="relative z-10 flex h-full max-w-[52%] flex-col justify-center gap-3">`,
      `        <p className="text-xs font-semibold uppercase text-slate-400">${item.name}</p>`,
      `        <h2 className="text-2xl font-bold text-slate-950">${item.component}</h2>`,
      `        <p className="text-sm text-slate-600">${item.description}</p>`,
      `      </div>`,
      `    </section>`,
      `  );`,
      `}`,
    ].join('\n');
  }

  return [
    `function ${item.component}(_props: ${item.component}Props) {`,
    `  return (`,
    `    <section className="${baseClass} border border-slate-200 bg-white/90 shadow-sm">`,
    `      <p className="text-xs font-semibold uppercase text-slate-400">${item.name}</p>`,
    `      <div className="mt-2 text-sm text-slate-700">${item.description}</div>`,
    `    </section>`,
    `  );`,
    `}`,
  ].join('\n');
};

const buildReactCode = (spec: UISplitSpec) => {
  const imports = `import React from 'react';`;
  const assets = buildAssetObjectCode(spec.assets);
  const regionTypes = spec.regions
    .map(item => `type ${item.component}Props = {\n  ${item.props.map(prop => `${prop}?: unknown;`).join('\n  ')}\n};`)
    .join('\n\n');
  const components = spec.regions.map(item => buildRegionCode(spec, item)).join('\n\n');
  const screen = [
    `export default function SplitUIScreen() {`,
    `  return (`,
    `    <main className="relative min-h-screen overflow-hidden" style={{ background: ${JSON.stringify(spec.tokens.backgroundColor)} }}>`,
    ...spec.regions.map(item => `      <${item.component} />`),
    `    </main>`,
    `  );`,
    `}`,
  ].join('\n');

  return [imports, assets, regionTypes, components, screen].join('\n\n');
};

const buildMarkdown = (spec: UISplitSpec) => {
  return [
    `# ${spec.title}`,
    '',
    `- Platform: ${spec.platform}`,
    `- Resolution: ${spec.resolution}`,
    `- Layout: ${spec.layoutType}`,
    '',
    '## Implementation Split',
    ...spec.regions.map((item, index) => [
      '',
      `### ${index + 1}. ${item.component}`,
      `- Region: ${item.name}`,
      `- Implementation: ${item.implementation}`,
      `- Bounds: x ${item.x}%, y ${item.y}%, w ${item.w}%, h ${item.h}%`,
      `- Responsibility: ${item.responsibilities.join('; ')}`,
      `- Props: ${item.props.join(', ') || 'none'}`,
      `- Strategy: ${item.cssStrategy}`,
      `- Reason: ${item.implementationReason}`,
      item.assetFilename ? `- Texture: ${item.assetFilename}` : '',
    ].filter(Boolean).join('\n')),
    '',
    '## Texture Assets',
    ...(spec.assets.length > 0
      ? spec.assets.map(asset => `- ${asset.filename}: ${asset.usage}`)
      : ['- None. This screen can be rebuilt with code-only regions.']),
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
  downloadBlob(filename, blob);
};

const downloadBlob = (filename: string, blob: Blob) => {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

const loadImageElement = (src: string): Promise<HTMLImageElement> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    if (src.startsWith('http://') || src.startsWith('https://')) {
      img.crossOrigin = 'anonymous';
    }
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error('Image cannot be read by the browser. The source may block CORS.'));
    img.src = src;
  });
};

const cropAssetFromImage = async (imageUrl: string, asset: UISplitAsset) => {
  const image = await loadImageElement(imageUrl);
  const sourceWidth = image.naturalWidth || image.width;
  const sourceHeight = image.naturalHeight || image.height;
  const x = clamp(Math.round((asset.bounds.x / 100) * sourceWidth), 0, sourceWidth - 1);
  const y = clamp(Math.round((asset.bounds.y / 100) * sourceHeight), 0, sourceHeight - 1);
  const width = clamp(Math.round((asset.bounds.w / 100) * sourceWidth), 1, sourceWidth - x);
  const height = clamp(Math.round((asset.bounds.h / 100) * sourceHeight), 1, sourceHeight - y);
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');

  if (!ctx) throw new Error('Canvas is not available.');

  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';
  ctx.drawImage(image, x, y, width, height, 0, 0, width, height);

  return {
    dataUrl: canvas.toDataURL('image/png'),
    pixelWidth: width,
    pixelHeight: height,
  };
};

const dataUrlToBlob = async (dataUrl: string) => {
  const response = await fetch(dataUrl);
  return response.blob();
};

const getJsonSpec = (spec: UISplitSpec, extractedAssets: UISplitExtractedAsset[]) => {
  const assetState = new Map(extractedAssets.map(asset => [asset.id, asset]));

  return JSON.stringify({
    ...spec,
    assets: spec.assets.map(asset => {
      const extracted = assetState.get(asset.id);
      return {
        ...asset,
        extracted: extracted?.status === 'ready',
        pixelWidth: extracted?.pixelWidth,
        pixelHeight: extracted?.pixelHeight,
        error: extracted?.error,
      };
    }),
  }, null, 2);
};

export default function UISplitModal({ artboard, lang, onClose }: Props) {
  const spec = useMemo(() => buildSpec(artboard), [artboard]);
  const [activeTab, setActiveTab] = useState<UISplitTab>('map');
  const [selectedId, setSelectedId] = useState(spec.regions[0]?.id || '');
  const [copied, setCopied] = useState<string | null>(null);
  const [extractedAssets, setExtractedAssets] = useState<UISplitExtractedAsset[]>([]);
  const [isPackaging, setIsPackaging] = useState(false);
  const isZh = lang === 'zh';
  const code = useMemo(() => buildReactCode(spec), [spec]);
  const markdown = useMemo(() => buildMarkdown(spec), [spec]);
  const json = useMemo(() => getJsonSpec(spec, extractedAssets), [spec, extractedAssets]);
  const selectedRegion = spec.regions.find(item => item.id === selectedId) || spec.regions[0];
  const selectedAsset = selectedRegion
    ? extractedAssets.find(asset => asset.regionId === selectedRegion.id)
    : undefined;
  const readyAssets = extractedAssets.filter(asset => asset.status === 'ready' && asset.dataUrl);

  useEffect(() => {
    if (!spec.regions.some(item => item.id === selectedId)) {
      setSelectedId(spec.regions[0]?.id || '');
    }
  }, [selectedId, spec]);

  useEffect(() => {
    let cancelled = false;

    if (spec.assets.length === 0) {
      setExtractedAssets([]);
      return () => {
        cancelled = true;
      };
    }

    setExtractedAssets(spec.assets.map(asset => ({ ...asset, status: 'pending' })));

    const extract = async () => {
      const results = await Promise.all(spec.assets.map(async asset => {
        try {
          const cropped = await cropAssetFromImage(artboard.image.url, asset);
          return { ...asset, ...cropped, status: 'ready' as const };
        } catch (error) {
          return {
            ...asset,
            status: 'error' as const,
            error: error instanceof Error ? error.message : String(error),
          };
        }
      }));

      if (!cancelled) setExtractedAssets(results);
    };

    void extract();

    return () => {
      cancelled = true;
    };
  }, [artboard.image.url, spec]);

  const handleCopy = useCallback(async (label: string, text: string) => {
    try {
      await copyText(text);
      setCopied(label);
      window.setTimeout(() => setCopied(null), 1600);
    } catch {
      setCopied(isZh ? '复制失败' : 'Copy failed');
      window.setTimeout(() => setCopied(null), 1600);
    }
  }, [isZh]);

  const handleDownloadAsset = useCallback(async (asset: UISplitExtractedAsset) => {
    if (!asset.dataUrl) {
      setCopied(isZh ? '贴图尚未生成' : 'Asset is not ready');
      window.setTimeout(() => setCopied(null), 1600);
      return;
    }

    const blob = await dataUrlToBlob(asset.dataUrl);
    downloadBlob(asset.filename.split('/').pop() || 'ui-asset.png', blob);
  }, [isZh]);

  const handleCopyAsset = useCallback(async (asset: UISplitExtractedAsset) => {
    if (!asset.dataUrl) {
      setCopied(isZh ? '贴图尚未生成' : 'Asset is not ready');
      window.setTimeout(() => setCopied(null), 1600);
      return;
    }

    try {
      const ClipboardItemCtor = (window as any).ClipboardItem;
      if (!navigator.clipboard?.write || !ClipboardItemCtor) {
        throw new Error('Clipboard image write is not supported.');
      }

      const blob = await dataUrlToBlob(asset.dataUrl);
      await navigator.clipboard.write([
        new ClipboardItemCtor({ [blob.type || 'image/png']: blob }),
      ]);
      setCopied(isZh ? '已复制贴图' : 'Copied asset');
    } catch {
      setCopied(isZh ? '复制贴图失败' : 'Asset copy failed');
    }

    window.setTimeout(() => setCopied(null), 1600);
  }, [isZh]);

  const handleDownloadPackage = useCallback(async () => {
    setIsPackaging(true);
    try {
      const { default: JSZip } = await import('jszip');
      const zip = new JSZip();

      zip.file('SplitUIScreen.tsx', code);
      zip.file('ui-split-spec.json', json);
      zip.file('ui-split-brief.md', markdown);

      readyAssets.forEach(asset => {
        if (!asset.dataUrl) return;
        const base64Data = asset.dataUrl.split(',')[1];
        if (base64Data) zip.file(asset.filename, base64Data, { base64: true });
      });

      const content = await zip.generateAsync({ type: 'blob' });
      downloadBlob(`ui-split-${Date.now()}.zip`, content);
      setCopied(isZh ? '已导出包' : 'Exported package');
    } catch {
      setCopied(isZh ? '导出失败' : 'Export failed');
    } finally {
      setIsPackaging(false);
      window.setTimeout(() => setCopied(null), 1600);
    }
  }, [code, isZh, json, markdown, readyAssets]);

  const tabs: { id: UISplitTab; label: string; icon: IconName }[] = [
    { id: 'map', label: isZh ? '区域图' : 'Region Map', icon: 'layout' },
    { id: 'assets', label: isZh ? '贴图资产' : 'Assets', icon: 'image' },
    { id: 'json', label: 'JSON', icon: 'code' },
    { id: 'code', label: isZh ? '代码骨架' : 'Code Scaffold', icon: 'code' },
  ];

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
              {spec.title} / {spec.resolution} / {spec.layoutType}
            </p>
          </div>
          <div className="flex items-center gap-2">
            {copied && <span className="hidden sm:inline text-xs text-teal-600 dark:text-teal-300">{copied}</span>}
            <button
              type="button"
              onClick={handleDownloadPackage}
              disabled={isPackaging}
              className="min-h-9 px-3 rounded-lg border border-stone-200 dark:border-stone-700 text-xs text-stone-600 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800 disabled:opacity-50 flex items-center gap-2"
            >
              <IconLoader name="download" size={14} />
              {isZh ? '导出包' : 'Package'}
            </button>
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
          {tabs.map(tab => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`min-h-9 px-3 rounded-lg text-xs font-bold flex items-center gap-2 transition-colors ${
                activeTab === tab.id
                  ? 'bg-white dark:bg-stone-800 text-teal-700 dark:text-teal-300 shadow-sm'
                  : 'text-stone-500 dark:text-stone-400 hover:bg-white/70 dark:hover:bg-stone-800/70'
              }`}
            >
              <IconLoader name={tab.icon} size={14} />
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
            <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_360px] gap-4">
              <div className="rounded-lg bg-stone-100 dark:bg-stone-950 border border-stone-200 dark:border-stone-800 p-3">
                <div
                  className="relative mx-auto overflow-hidden rounded-lg border border-stone-300 dark:border-stone-700 bg-white"
                  style={{ aspectRatio: `${artboard.width} / ${artboard.height}`, maxHeight: '68vh' }}
                >
                  <img src={artboard.image.url} alt="" className="h-full w-full object-contain" draggable={false} />
                  {spec.regions.map((item, index) => {
                    const label = implementationLabels[item.implementation];

                    return (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => setSelectedId(item.id)}
                        className={`absolute border-2 text-left transition-colors ${
                          selectedId === item.id
                            ? 'border-teal-400 bg-teal-500/20'
                            : item.implementation === 'code'
                              ? 'border-emerald-400/80 bg-emerald-500/10 hover:bg-emerald-500/20'
                              : item.implementation === 'texture'
                                ? 'border-amber-400/80 bg-amber-500/10 hover:bg-amber-500/20'
                                : 'border-sky-400/80 bg-sky-500/10 hover:bg-sky-500/20'
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
                        <span className="absolute bottom-1 left-1 max-w-[calc(100%-8px)] truncate rounded bg-black/70 px-1.5 py-0.5 text-[10px] font-bold text-white">
                          {isZh ? label.zh : label.en}
                        </span>
                      </button>
                    );
                  })}
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
                      <span className={`rounded border px-2 py-1 text-[10px] font-bold ${implementationLabels[selectedRegion.implementation].className}`}>
                        {isZh ? implementationLabels[selectedRegion.implementation].zh : implementationLabels[selectedRegion.implementation].en}
                      </span>
                    </div>
                    <p className="mt-3 text-xs leading-relaxed text-stone-600 dark:text-stone-300">
                      {selectedRegion.implementationReason}
                    </p>
                    <div className="mt-3 rounded-lg bg-stone-50 dark:bg-stone-900 p-3 text-xs text-stone-600 dark:text-stone-300">
                      {selectedRegion.cssStrategy}
                    </div>
                    {selectedAsset && (
                      <div className="mt-3 rounded-lg border border-stone-200 dark:border-stone-800 overflow-hidden">
                        <div className="flex items-center justify-between gap-2 px-3 py-2 bg-stone-50 dark:bg-stone-900">
                          <span className="text-[10px] font-bold uppercase text-stone-500">
                            {isZh ? '贴图预览' : 'Asset Preview'}
                          </span>
                          <span className="text-[10px] text-stone-500">
                            {selectedAsset.status === 'ready'
                              ? `${selectedAsset.pixelWidth}x${selectedAsset.pixelHeight}`
                              : selectedAsset.status}
                          </span>
                        </div>
                        <div className="min-h-28 bg-stone-100 dark:bg-stone-950 flex items-center justify-center">
                          {selectedAsset.status === 'ready' && selectedAsset.dataUrl && (
                            <img src={selectedAsset.dataUrl} alt="" className="max-h-40 max-w-full object-contain" />
                          )}
                          {selectedAsset.status === 'pending' && (
                            <div className="flex items-center gap-2 text-xs text-stone-500">
                              <IconLoader name="loader" size={14} className="animate-spin" />
                              {isZh ? '正在裁剪贴图' : 'Extracting asset'}
                            </div>
                          )}
                          {selectedAsset.status === 'error' && (
                            <p className="p-3 text-xs leading-relaxed text-red-500">
                              {isZh ? '无法裁剪：图片源可能禁止跨域读取。' : 'Cannot crop: the image source may block cross-origin canvas access.'}
                            </p>
                          )}
                        </div>
                      </div>
                    )}
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
                        <span className={`float-right rounded border px-1.5 py-0.5 text-[10px] ${implementationLabels[item.implementation].className}`}>
                          {isZh ? implementationLabels[item.implementation].zh : implementationLabels[item.implementation].en}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'assets' && (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
              {extractedAssets.length === 0 && (
                <div className="col-span-full rounded-lg border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-950 p-6 text-sm text-stone-500">
                  {isZh ? '当前拆分结果不需要贴图资产，所有区域都可以用代码实现。' : 'This split does not need texture assets; every region can be implemented in code.'}
                </div>
              )}
              {extractedAssets.map(asset => (
                <div key={asset.id} className="rounded-lg border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-950 overflow-hidden">
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedId(asset.regionId);
                      setActiveTab('map');
                    }}
                    className="w-full text-left px-3 py-2 border-b border-stone-200 dark:border-stone-800 hover:bg-stone-50 dark:hover:bg-stone-900"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-xs font-bold text-stone-900 dark:text-stone-100">
                        {isZh ? asset.nameZh : asset.name}
                      </span>
                      <span className="rounded bg-stone-100 dark:bg-stone-800 px-2 py-1 text-[10px] text-stone-500">
                        {isZh ? assetKindLabels[asset.kind].zh : assetKindLabels[asset.kind].en}
                      </span>
                    </div>
                    <p className="mt-1 truncate text-[10px] font-mono text-teal-700 dark:text-teal-300">{asset.filename}</p>
                  </button>

                  <div className="aspect-video bg-stone-100 dark:bg-stone-900 flex items-center justify-center">
                    {asset.status === 'ready' && asset.dataUrl && (
                      <img src={asset.dataUrl} alt="" className="h-full w-full object-contain" />
                    )}
                    {asset.status === 'pending' && (
                      <div className="flex items-center gap-2 text-xs text-stone-500">
                        <IconLoader name="loader" size={14} className="animate-spin" />
                        {isZh ? '生成中' : 'Generating'}
                      </div>
                    )}
                    {asset.status === 'error' && (
                      <p className="p-3 text-xs leading-relaxed text-red-500">
                        {asset.error || (isZh ? '裁剪失败' : 'Crop failed')}
                      </p>
                    )}
                  </div>

                  <div className="flex items-center gap-2 p-3">
                    <button
                      type="button"
                      onClick={() => handleDownloadAsset(asset)}
                      disabled={asset.status !== 'ready'}
                      className="min-h-9 flex-1 rounded-lg border border-stone-200 dark:border-stone-700 text-xs font-bold text-stone-600 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800 disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                      <IconLoader name="download" size={14} />
                      PNG
                    </button>
                    <button
                      type="button"
                      onClick={() => handleCopyAsset(asset)}
                      disabled={asset.status !== 'ready'}
                      className="min-h-9 flex-1 rounded-lg border border-stone-200 dark:border-stone-700 text-xs font-bold text-stone-600 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800 disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                      <IconLoader name="copy" size={14} />
                      {isZh ? '复制' : 'Copy'}
                    </button>
                  </div>
                </div>
              ))}
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
