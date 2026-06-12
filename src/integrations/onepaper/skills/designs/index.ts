import claudeMd from './claude.md?raw';
import cohereMd from './cohere.md?raw';
import elevenlabsMd from './elevenlabs.md?raw';
import minimaxMd from './minimax.md?raw';
import mistral_aiMd from './mistral-ai.md?raw';
import ollamaMd from './ollama.md?raw';
import opencode_aiMd from './opencode-ai.md?raw';
import replicateMd from './replicate.md?raw';
import runwaymlMd from './runwayml.md?raw';
import together_aiMd from './together-ai.md?raw';
import voltagentMd from './voltagent.md?raw';
import x_aiMd from './x-ai.md?raw';
import cursorMd from './cursor.md?raw';
import expoMd from './expo.md?raw';
import linear_appMd from './linear-app.md?raw';
import lovableMd from './lovable.md?raw';
import mintlifyMd from './mintlify.md?raw';
import posthogMd from './posthog.md?raw';
import raycastMd from './raycast.md?raw';
import resendMd from './resend.md?raw';
import sentryMd from './sentry.md?raw';
import supabaseMd from './supabase.md?raw';
import vercelMd from './vercel.md?raw';
import warpMd from './warp.md?raw';
import zapierMd from './zapier.md?raw';
import clickhouseMd from './clickhouse.md?raw';
import composioMd from './composio.md?raw';
import hashicorpMd from './hashicorp.md?raw';
import mongodbMd from './mongodb.md?raw';
import sanityMd from './sanity.md?raw';
import stripeMd from './stripe.md?raw';
import airtableMd from './airtable.md?raw';
import calMd from './cal.md?raw';
import clayMd from './clay.md?raw';
import figmaMd from './figma.md?raw';
import framerMd from './framer.md?raw';
import intercomMd from './intercom.md?raw';
import miroMd from './miro.md?raw';
import notionMd from './notion.md?raw';
import pinterestMd from './pinterest.md?raw';
import webflowMd from './webflow.md?raw';
import binanceMd from './binance.md?raw';
import coinbaseMd from './coinbase.md?raw';
import krakenMd from './kraken.md?raw';
import revolutMd from './revolut.md?raw';
import wiseMd from './wise.md?raw';
import airbnbMd from './airbnb.md?raw';
import appleMd from './apple.md?raw';
import bmwMd from './bmw.md?raw';
import ferrariMd from './ferrari.md?raw';
import ibmMd from './ibm.md?raw';
import metaMd from './meta.md?raw';
import lamborghiniMd from './lamborghini.md?raw';
import nikeMd from './nike.md?raw';
import nvidiaMd from './nvidia.md?raw';
import renaultMd from './renault.md?raw';
import shopifyMd from './shopify.md?raw';
import spacexMd from './spacex.md?raw';
import teslaMd from './tesla.md?raw';
import spotifyMd from './spotify.md?raw';
import uberMd from './uber.md?raw';
import superhumanMd from './superhuman.md?raw';
import bugattiMd from './bugatti.md?raw';
import playstationMd from './playstation.md?raw';
import thevergeMd from './theverge.md?raw';
import wiredMd from './wired.md?raw';
import mastercardMd from './mastercard.md?raw';
import vodafoneMd from './vodafone.md?raw';
import starbucksMd from './starbucks.md?raw';

export interface DesignMdTemplate {
    id: string;
    name: string;
    name_zh: string;
    category: 'Tech' | 'Finance' | 'Creative' | 'Minimal' | 'Bold' | 'Custom';
    description: string;
    description_zh: string;
    content: string;
}

export const DESIGN_MD_TEMPLATES: DesignMdTemplate[] = [
    {
        id: 'claude',
        name: 'Claude — Warm Literary Salon',
        name_zh: 'Claude — 温暖文学沙龙',
        category: 'Tech',
        description: 'A warm parchment canvas with terracotta accents, custom serif typography, and editorial pacing that feels like reading a thoughtful essay rather than scanning a product page.',
        description_zh: '温暖的羊皮纸质画布，搭配赤陶色点缀和定制衬线字体，编辑节奏如同阅读一篇深思熟虑的文章，而非浏览产品页面。',
        content: claudeMd,
    },
    {
        id: 'cohere',
        name: 'Cohere — Enterprise Command Deck',
        name_zh: 'Cohere — 企业指挥甲板',
        category: 'Tech',
        description: 'A polished white canvas with cloud-like rounded cards, dual-typeface authority, and restrained purple-violet accents that signal serious AI infrastructure.',
        description_zh: '抛光白色画布，云状圆角卡片，双字体权威感，克制的紫罗兰点缀彰显严肃的 AI 基础设施气质。',
        content: cohereMd,
    },
    {
        id: 'elevenlabs',
        name: 'ElevenLabs — Premium Audio Brochure',
        name_zh: 'ElevenLabs — 高端音频手册',
        category: 'Tech',
        description: 'A near-white canvas where whisper-thin Waldenburg display type and multi-layered micro-shadows create the ethereal elegance of a premium audio product.',
        description_zh: '近白色画布，轻若耳语的 Waldenburg 展示字体与多层微阴影共同营造出高端音频产品的空灵优雅。',
        content: elevenlabsMd,
    },
    {
        id: 'minimax',
        name: 'MiniMax — Playful AI Gallery',
        name_zh: 'MiniMax — 活泼的 AI 画廊',
        category: 'Tech',
        description: 'A white-space-driven showcase with vibrant gradient product cards, multi-font variety, and pill-shaped geometry that makes AI technology feel approachable.',
        description_zh: '以留白为驱动的展示空间，充满活力的渐变产品卡片、多字体组合，以及药丸形几何让 AI 技术倍感亲切。',
        content: minimaxMd,
    },
    {
        id: 'mistral_ai',
        name: 'Mistral AI — Sun-Drenched Frontier',
        name_zh: 'Mistral AI — 阳光浸润的前沿',
        category: 'Tech',
        description: 'A golden-amber universe flowing from pale cream to burnt orange, with massive billboard headlines and warm-tinted shadows that feel more European luxury brand than tech company.',
        description_zh: '从淡乳白到焦橙色的金色琥珀宇宙，巨幅广告牌式标题与暖色调阴影，更像欧洲奢侈品牌而非科技公司。',
        content: mistral_aiMd,
    },
    {
        id: 'ollama',
        name: 'Ollama — Radical Minimalism',
        name_zh: 'Ollama — 激进极简主义',
        category: 'Tech',
        description: 'A pure-white void with zero chromatic color, SF Pro Rounded letterforms, and exclusively pill-shaped geometry — minimalism with warmth, not cold Swiss grids.',
        description_zh: '纯白虚空，零彩色，SF Pro Rounded 字形，全药丸形几何——温暖极简，而非冰冷的瑞士网格。',
        content: ollamaMd,
    },
    {
        id: 'opencode_ai',
        name: 'OpenCode — Terminal-Native Craft',
        name_zh: 'OpenCode — 终端原生工艺',
        category: 'Tech',
        description: 'A warm dark canvas with Berkeley Mono as the sole typeface, creating an unapologetic monospace identity where every element reads like code.',
        description_zh: '温暖的深色画布，Berkeley Mono 作为唯一字体，打造毫不妥协的等宽字身份，每个元素都像代码般阅读。',
        content: opencode_aiMd,
    },
    {
        id: 'replicate',
        name: 'Replicate — Creative Developer Playground',
        name_zh: 'Replicate — 创意开发者乐园',
        category: 'Tech',
        description: 'An explosive orange-red-magenta gradient hero, massive display typography, and exclusively pill-shaped geometry that shouts with creative energy.',
        description_zh: '爆炸性的橙红洋红渐变英雄区、巨幅展示字体，以及全药丸形几何，洋溢着创意能量。',
        content: replicateMd,
    },
    {
        id: 'runwayml',
        name: 'Runway — Cinematic Reel',
        name_zh: 'Runway — 电影卷轴',
        category: 'Tech',
        description: 'A dark editorial canvas where full-bleed photography and video are the primary UI elements, with single-font uniformity letting visual content speak louder than text.',
        description_zh: '深色编辑画布，全出血摄影与视频是主要 UI 元素，单字体统一性让视觉内容比文字更响亮。',
        content: runwaymlMd,
    },
    {
        id: 'together_ai',
        name: 'Together AI — Pastel Cloud Infrastructure',
        name_zh: 'Together AI — 粉彩云基础设施',
        category: 'Tech',
        description: 'Soft pink-blue-lavender gradients against white canvas, with a deep midnight-blue technical world for research content — enterprise AI that feels light and optimistic.',
        description_zh: '白色画布上的柔和粉蓝薰衣草渐变，搭配深邃午夜蓝的技术世界——轻盈乐观的企业 AI。',
        content: together_aiMd,
    },
    {
        id: 'voltagent',
        name: 'VoltAgent — Deep-Space Command Terminal',
        name_zh: 'VoltAgent — 深空指挥终端',
        category: 'Tech',
        description: 'A carbon-black canvas with warm-neutral grays and an electric emerald-green pulse that glows like a circuit board carrying a signal at 2am.',
        description_zh: '碳黑画布，暖中性灰，电光翠绿脉冲如凌晨两点的电路板信号般闪烁。',
        content: voltagentMd,
    },
    {
        id: 'x_ai',
        name: 'xAI — Brutalist Infrastructure',
        name_zh: 'xAI — 野蛮主义基础设施',
        category: 'Tech',
        description: 'An almost-black canvas with GeistMono as display typeface at 320px, sharp architectural edges, and a terminal-inspired aesthetic that signals deep technical credibility.',
        description_zh: '近黑色画布，GeistMono 作为 320px 展示字体，锋利建筑边缘，终端灵感美学彰显深厚技术可信度。',
        content: x_aiMd,
    },
    {
        id: 'cursor',
        name: 'Cursor — Warm Code Editor Elegance',
        name_zh: 'Cursor — 温暖代码编辑器优雅',
        category: 'Tech',
        description: 'A warm off-white canvas with CursorGothic display type, a three-font typographic system, and oklab-based organic borders that feel like premium print.',
        description_zh: '温暖米白画布，CursorGothic 展示字体，三字体排版系统，基于 oklab 的有机边框如高级印刷品般质感。',
        content: cursorMd,
    },
    {
        id: 'expo',
        name: 'Expo — React Native Precision',
        name_zh: 'Expo — React Native 精准度',
        category: 'Tech',
        description: 'A dark-themed developer platform with tight letter-spacing, code-centric presentation, and the precision of a native mobile toolkit.',
        description_zh: '深色主题开发者平台，紧凑字距，代码中心展示，原生移动工具包的精准度。',
        content: expoMd,
    },
    {
        id: 'linear_app',
        name: 'Linear — Dark-Native Precision',
        name_zh: 'Linear — 深色原生精准',
        category: 'Tech',
        description: 'A near-black canvas where content emerges from darkness like starlight, with Inter Variable at signature weight 510 and indigo-violet as the sole chromatic accent.',
        description_zh: '近黑色画布，内容如星光般从黑暗中浮现，Inter Variable 标志性 510 字重，靛蓝紫罗兰作为唯一彩色点缀。',
        content: linear_appMd,
    },
    {
        id: 'lovable',
        name: 'Lovable — Approachable Craft',
        name_zh: 'Lovable — 亲切工艺',
        category: 'Tech',
        description: 'A creamy parchment-toned background with the humanist warmth of Camera Plain Variable, and an opacity-driven depth model where every gray is the same hue at different transparencies.',
        description_zh: '奶油色羊皮纸质感背景，Camera Plain Variable 的人文温暖，基于透明度的深度模型让每种灰色都是同一色相的不同透明度。',
        content: lovableMd,
    },
    {
        id: 'mintlify',
        name: 'Mintlify — Documentation Luminescence',
        name_zh: 'Mintlify — 文档辉光',
        category: 'Tech',
        description: 'A luminous white canvas with an ethereal green-to-white gradient hero, Inter with tight tracking, and generous card radii that make documentation feel like a premium product.',
        description_zh: '明亮白色画布，空灵绿白渐变英雄区，Inter 紧凑字距，宽大卡片圆角让文档体验如高端产品。',
        content: mintlifyMd,
    },
    {
        id: 'posthog',
        name: 'PostHog — Garden Shed Analytics',
        name_zh: 'PostHog — 花园棚屋分析',
        category: 'Tech',
        description: 'A warm sage-tinted cream canvas with hand-drawn hedgehog illustrations, hidden orange hover surprises, and an anti-corporate personality that makes analytics feel human.',
        description_zh: '温暖鼠尾草色调奶油画布，手绘刺猬插画，隐藏的橙色悬停惊喜，反企业人格让分析倍感人性化。',
        content: posthogMd,
    },
    {
        id: 'raycast',
        name: 'Raycast — macOS Obsidian Instrument',
        name_zh: 'Raycast — macOS 黑曜石仪器',
        category: 'Tech',
        description: 'A near-black blue-tinted canvas with macOS-native layered shadow system, Raycast Red diagonal stripes, and the precision of a Swiss watch carved from obsidian.',
        description_zh: '近黑蓝调画布，macOS 原生分层阴影系统，Raycast Red 对角条纹，如黑曜石雕刻的瑞士手表般精准。',
        content: raycastMd,
    },
    {
        id: 'resend',
        name: 'Resend — Theatrical Email Gallery',
        name_zh: 'Resend — 戏剧邮件画廊',
        category: 'Tech',
        description: 'A pure black canvas with Domaine Display serif heroes, ABC Favorit geometric sections, and icy blue-tinted borders that give every container a cold, crystalline quality.',
        description_zh: '纯黑画布，Domaine Display 衬线英雄区，ABC Favorit 几何区块，冰蓝调边框让每个容器都带有冷冽水晶质感。',
        content: resendMd,
    },
    {
        id: 'sentry',
        name: 'Sentry — Late-Night Debugging',
        name_zh: 'Sentry — 深夜调试',
        category: 'Tech',
        description: 'Deep purple-black backgrounds with warm purple tones, a distinctive lime-green accent, and Dammit Sans display font that matches an irreverent brand voice.',
        description_zh: '深紫黑色背景，温暖紫色调，独特的酸橙绿点缀，Dammit Sans 展示字体匹配不羁的品牌声音。',
        content: sentryMd,
    },
    {
        id: 'supabase',
        name: 'Supabase — Terminal Elegance',
        name_zh: 'Supabase — 终端优雅',
        category: 'Tech',
        description: 'A near-black developer platform with emerald-green accents, Circular geometric sans, and a sophisticated HSL-based color token system for translucent layering.',
        description_zh: '近黑色开发者平台，翠绿色点缀，Circular 几何无衬线，基于 HSL 的复杂色彩令牌系统实现半透明分层。',
        content: supabaseMd,
    },
    {
        id: 'vercel',
        name: 'Vercel — Compiler Aesthetic',
        name_zh: 'Vercel — 编译器美学',
        category: 'Tech',
        description: 'An overwhelmingly white canvas with Geist Sans at extreme negative tracking, Geist Mono for code, and a signature shadow-as-border technique that replaces traditional borders entirely.',
        description_zh: '极致白色画布，Geist Sans 极端负字距，Geist Mono 代码字体，标志性的阴影即边框技术完全替代传统边框。',
        content: vercelMd,
    },
    {
        id: 'warp',
        name: 'Warp — Campfire Terminal',
        name_zh: 'Warp — 篝火终端',
        category: 'Tech',
        description: 'A warm near-black canvas with Warm Parchment text, the approachable Matter geometric sans, and nature photography woven between terminal screenshots.',
        description_zh: '温暖近黑画布，暖羊皮纸色文字，亲切的 Matter 几何无衬线，自然摄影穿插于终端截图之间。',
        content: warpMd,
    },
    {
        id: 'zapier',
        name: 'Zapier — Organized Notebook',
        name_zh: 'Zapier — 井井有条的笔记本',
        category: 'Tech',
        description: 'A cream-tinted canvas with Degular Display block headlines, GT Alpina serif moments, and a vivid red-orange accent that feels energetic without being aggressive.',
        description_zh: '奶油色调画布，Degular Display 块状标题，GT Alpina 衬线时刻，鲜艳红橙点缀充满活力却不具攻击性。',
        content: zapierMd,
    },
    {
        id: 'clickhouse',
        name: 'ClickHouse — High-Performance Cockpit',
        name_zh: 'ClickHouse — 高性能驾驶舱',
        category: 'Tech',
        description: 'A pure black canvas with neon yellow-green accents slashing across CTAs like a highlighter on a dark console, and Inter Black at 96px creating text with physical mass.',
        description_zh: '纯黑画布，霓虹黄绿色点缀如荧光笔划过暗黑控制台，Inter Black 96px 创造具有物理质感的文字。',
        content: clickhouseMd,
    },
    {
        id: 'composio',
        name: 'Composio — Nocturnal Command Center',
        name_zh: 'Composio — 夜间指挥中心',
        category: 'Tech',
        description: 'A pitch-black canvas with barely-visible containment borders, electric cyan gradient glows, and hard-offset brutalist shadows — a high-tech control panel for developers.',
        description_zh: '漆黑画布，几乎不可见的容器边框，电光青色渐变辉光，硬偏移野蛮主义阴影——开发者的科技控制面板。',
        content: composioMd,
    },
    {
        id: 'hashicorp',
        name: 'HashiCorp — Infrastructure Day/Night',
        name_zh: 'HashiCorp — 基础设施昼夜',
        category: 'Tech',
        description: 'A day/night duality design with clean white information sections and dramatic dark product showcases, each product injecting its own chromatic identity into a token-driven system.',
        description_zh: '昼夜二元设计，干净的白色信息区与戏剧化的深色产品展示，每个产品向令牌驱动系统注入自己的色彩身份。',
        content: hashicorpMd,
    },
    {
        id: 'mongodb',
        name: 'MongoDB — Bioluminescent Forest',
        name_zh: 'MongoDB — 生物发光森林',
        category: 'Tech',
        description: 'Deep teal-black backgrounds with neon green accents that feel alive, MongoDB Value Serif for editorial authority at 96px, and teal-tinted shadows that carry the forest color everywhere.',
        description_zh: '深青黑背景，霓虹绿色点缀充满生命力，MongoDB Value Serif 衬线在 96px 处彰显编辑权威，青色调阴影将森林色彩带向每一处。',
        content: mongodbMd,
    },
    {
        id: 'sanity',
        name: 'Sanity — Structured Content Stage',
        name_zh: 'Sanity — 结构化内容舞台',
        category: 'Tech',
        description: 'A near-black canvas with precision-cut waldenburgNormal headlines at 112px, pure achromatic grays, and neon green and electric blue accents that land like signal lights in a dark control room.',
        description_zh: '近黑色画布，112px 精密切割 waldenburgNormal 标题，纯中性灰色，霓虹绿与电光蓝点缀如暗室中的信号灯般醒目。',
        content: sanityMd,
    },
    {
        id: 'stripe',
        name: 'Stripe — Financial Type Foundry',
        name_zh: 'Stripe — 金融字体工坊',
        category: 'Finance',
        description: 'A clean white canvas with deep navy headings, sohne-var at weight 300, and blue-tinted multi-layer shadows that make elevation feel like twilight atmospheric depth.',
        description_zh: '干净白色画布，深海军蓝标题，sohne-var 300 字重，蓝调多层阴影让 elevation 如暮光大气深度。',
        content: stripeMd,
    },
    {
        id: 'airtable',
        name: 'Airtable — Sophisticated Simplicity',
        name_zh: 'Airtable — 精致的简约',
        category: 'Creative',
        description: 'A clean white canvas with deep navy text, Airtable Blue accent, and the Swiss-precision Haas font family creating an enterprise-friendly structured data aesthetic.',
        description_zh: '干净白色画布，深海军蓝文字，Airtable Blue 点缀，Haas 字体家族以瑞士精准度打造企业友好的结构化数据美学。',
        content: airtableMd,
    },
    {
        id: 'cal',
        name: 'Cal.com — Monochrome Confidence',
        name_zh: 'Cal.com — 单色自信',
        category: 'Creative',
        description: 'A purely grayscale world where boldness comes from Cal Sans at extreme closeness, 11 shadow definitions creating nuanced depth, and color treated as a foreign substance.',
        description_zh: '纯粹灰度世界，Cal Sans 极致紧凑带来力量感，11 层阴影定义创造微妙深度，色彩被视为外来物质。',
        content: calMd,
    },
    {
        id: 'clay',
        name: 'Clay — Artisanal Data Craft',
        name_zh: 'Clay — 手工数据工艺',
        category: 'Creative',
        description: 'A warm cream canvas with oat-toned borders, a vivid flavor-named color palette, and playful hover micro-animations where buttons tilt and jump on interaction.',
        description_zh: '温暖奶油画布，燕麦色调边框，以口味命名的鲜活色彩面板，以及俏皮的悬停微动画让按钮在交互时倾斜跳跃。',
        content: clayMd,
    },
    {
        id: 'figma',
        name: 'Figma — Typographic Precision',
        name_zh: 'Figma — 排版精准度',
        category: 'Creative',
        description: 'A strictly black-and-white interface chrome with a custom variable font at unusual weight stops, while the hero explodes with vibrant multi-color gradients — a white gallery wall displaying colorful art.',
        description_zh: '严格黑白界面外壳，自定义可变字体在不寻常的字重停顿，而英雄区爆发出充满活力的多色渐变——展示彩色艺术的白墙画廊。',
        content: figmaMd,
    },
    {
        id: 'framer',
        name: 'Framer — Design Nightclub',
        name_zh: 'Framer — 设计夜总会',
        category: 'Creative',
        description: 'An absolute black void with GT Walsheim headlines compressed like spring-loaded words, Framer Blue electric throughlines, and the seductive confidence of a tool built by designers for designers.',
        description_zh: '绝对黑色虚空，GT Walsheim 标题如弹簧加载般压缩，Framer Blue 电光贯穿线，设计师为设计师打造的工具的魅惑自信。',
        content: framerMd,
    },
    {
        id: 'intercom',
        name: 'Intercom — AI-First Helpdesk',
        name_zh: 'Intercom — AI 优先服务台',
        category: 'Creative',
        description: 'A warm off-white canvas with Fin Orange as singular vibrant accent, ultra-compressed Saans headlines, and sharp 4px geometry that feels industrial yet approachable.',
        description_zh: '温暖米白色画布，Fin Orange 作为唯一鲜艳点缀，超压缩 Saans 标题，4px 锋利几何感工业且亲切。',
        content: intercomMd,
    },
    {
        id: 'miro',
        name: 'Miro — Visual Thinking Canvas',
        name_zh: 'Miro — 视觉思维画布',
        category: 'Creative',
        description: 'A predominantly white canvas with a distinctive pastel palette — coral, rose, teal, orange — and Roobert PRO Medium creating a collaborative tool-forward geometric voice.',
        description_zh: '以白色为主的画布，独特的粉彩调色板——珊瑚、玫瑰、蓝绿、橙色——Roobert PRO Medium 打造协作工具导向的几何声音。',
        content: miroMd,
    },
    {
        id: 'notion',
        name: 'Notion — Approachable Blank Canvas',
        name_zh: 'Notion — 亲切空白画布',
        category: 'Creative',
        description: 'A pure white canvas with warm yellow-brown undertones, NotionInter with aggressive negative tracking, and ultra-thin whisper borders that create structure without weight.',
        description_zh: '纯白色画布，温暖黄棕底色，NotionInter 激进负字距，超薄耳语边框在无需重量的情况下创造结构。',
        content: notionMd,
    },
    {
        id: 'pinterest',
        name: 'Pinterest — Inspiration Lifestyle',
        name_zh: 'Pinterest — 灵感生活方式',
        category: 'Creative',
        description: 'A soft warm-white canvas with olive-sand neutrals, Pinterest Red as bold singular accent, and generous border-radius creating a handcrafted, personal atmosphere.',
        description_zh: '柔和暖白色画布，橄榄沙色中性色，Pinterest Red 作为大胆唯一点缀，宽大圆角营造手工制作的个人氛围。',
        content: pinterestMd,
    },
    {
        id: 'webflow',
        name: 'Webflow — Design Without Code',
        name_zh: 'Webflow — 无代码设计',
        category: 'Creative',
        description: 'A clean white canvas with Webflow Blue as primary anchor, a rich secondary palette of purple, pink, green and orange, and conservative 4-8px geometry.',
        description_zh: '干净白色画布，Webflow Blue 作为主锚点，丰富的紫色、粉色、绿色和橙色辅色，保守的 4-8px 几何。',
        content: webflowMd,
    },
    {
        id: 'binance',
        name: 'Binance.US — Digital Trading Floor',
        name_zh: 'Binance.US — 数字交易大厅',
        category: 'Finance',
        description: 'A two-tone composition alternating between stark white and deep near-black, with Binance Yellow cutting through like a gold ingot on a steel desk — polished crypto urgency.',
        description_zh: ' stark 白色与深近黑色交替的双色组合，Binance Yellow 如钢桌上的金锭般划破——打磨过的加密紧迫感。',
        content: binanceMd,
    },
    {
        id: 'coinbase',
        name: 'Coinbase — Trustworthy Crypto',
        name_zh: 'Coinbase — 可信加密',
        category: 'Finance',
        description: 'A clean blue-and-white binary palette with Coinbase Blue as singular brand accent, a comprehensive four-font proprietary family, and financial-grade institutional reliability.',
        description_zh: '干净的蓝白二元调色板，Coinbase Blue 作为唯一品牌点缀，全面的四字体专有家族，金融级机构可靠性。',
        content: coinbaseMd,
    },
    {
        id: 'kraken',
        name: 'Kraken — Purple Crypto Authority',
        name_zh: 'Kraken — 紫色加密权威',
        category: 'Finance',
        description: 'A clean white canvas with Kraken Purple creating a distinctive professional crypto identity, dual-font system, and whisper-level shadows.',
        description_zh: '干净白色画布，Kraken Purple 打造独特的专业加密身份，双字体系统，耳语级阴影。',
        content: krakenMd,
    },
    {
        id: 'revolut',
        name: 'Revolut — Stadium-Scale Fintech',
        name_zh: 'Revolut — 体育场级金融科技',
        category: 'Finance',
        description: 'Massive Aeonik Pro headlines at 136px with billboard-scale negative tracking, a comprehensive semantic token system, and pill-everything button geometry — banking for the modern era.',
        description_zh: '136px 巨幅 Aeonik Pro 标题，广告牌级负字距，全面的语义令牌系统，全药丸按钮几何——现代时代的银行。',
        content: revolutMd,
    },
    {
        id: 'wise',
        name: 'Wise — Money Without Borders',
        name_zh: 'Wise — 无国界货币',
        category: 'Finance',
        description: 'A warm off-white canvas with Wise Sans at weight 900 and 0.85 line-height creating protest-sign density, and a fresh lime-green accent that feels alive and optimistic.',
        description_zh: '温暖米白色画布，Wise Sans 900 字重、0.85 行高创造抗议标语般的密度，清新酸橙绿点缀充满活力与乐观。',
        content: wiseMd,
    },
    {
        id: 'airbnb',
        name: 'Airbnb — Travel Magazine',
        name_zh: 'Airbnb — 旅行杂志',
        category: 'Minimal',
        description: 'A pristine white canvas where full-bleed photography dominates, Rausch coral-pink accents guide every action, and 3D rendered category icons add tactile warmth to the travel experience.',
        description_zh: ' pristine 白色画布，全出血摄影主导，Rausch 珊瑚粉点缀引导每个动作，3D 渲染分类图标为旅行体验增添触觉温暖。',
        content: airbnbMd,
    },
    {
        id: 'apple',
        name: 'Apple — Cinematic Product Gallery',
        name_zh: 'Apple — 电影产品画廊',
        category: 'Minimal',
        description: 'Vast expanses of pure black and near-white serve as cinematic backdrops for product photography, with SF Pro\'s optical sizing and a single Apple Blue for interactive precision.',
        description_zh: '纯黑与近白的广阔空间作为产品摄影的电影背景，SF Pro 光学字号和单一的 Apple Blue 实现交互精准度。',
        content: appleMd,
    },
    {
        id: 'bmw',
        name: 'BMW — German Engineering Precision',
        name_zh: 'BMW — 德国工程精准',
        category: 'Bold',
        description: 'Dark premium surfaces with BMWTypeNextLatin Light at 60px whispering authority, zero border-radius expressing industrial geometry, and BMW Blue as singular interactive signal.',
        description_zh: '深色高端表面，BMWTypeNextLatin Light 60px 低语权威，零圆角表达工业几何，BMW Blue 作为唯一交互信号。',
        content: bmwMd,
    },
    {
        id: 'ferrari',
        name: 'Ferrari — Digital Editorial',
        name_zh: 'Ferrari — 数字编辑',
        category: 'Bold',
        description: 'A chiaroscuro rhythm alternating between inky-dark cinematic sections and crisp white editorial panels, with Ferrari Red used with surgical sparseness for maximum brand weight.',
        description_zh: '明暗对比节奏，墨黑电影感区块与 crisp 白色编辑面板交替，Ferrari Red 以手术般的克制使用以最大化品牌重量。',
        content: ferrariMd,
    },
    {
        id: 'ibm',
        name: 'IBM — Enterprise Engineering Spec',
        name_zh: 'IBM — 企业工程规范',
        category: 'Bold',
        description: 'A stark white canvas with IBM Plex Sans at weight 300 creating airy corporate gravitas, IBM Blue 60 as unwavering accent, and Carbon\'s token-driven component architecture.',
        description_zh: ' stark 白色画布，IBM Plex Sans 300 字重创造空灵的企业庄重感，IBM Blue 60 坚定不移的点缀，Carbon 令牌驱动组件架构。',
        content: ibmMd,
    },
    {
        id: 'meta',
        name: 'Meta Store — Product Retail Gallery',
        name_zh: 'Meta Store — 产品零售画廊',
        category: 'Bold',
        description: 'A photography-first retail experience with expansive white canvas framing hero product shots, the warm Optimistic typeface, and pill-shaped Meta Blue CTAs.',
        description_zh: '摄影优先的零售体验，广阔白色画布框住英雄产品镜头，温暖的 Optimistic 字体，药丸形 Meta Blue CTA。',
        content: metaMd,
    },
    {
        id: 'lamborghini',
        name: 'Lamborghini — Nocturnal Motorsport',
        name_zh: 'Lamborghini — 夜间赛车',
        category: 'Bold',
        description: 'A cathedral of true black with LamboType\'s 12-degree angled terminals, Lamborghini Gold as sole accent igniting against the void, and hexagonal motifs echoing brand geometry.',
        description_zh: '真正黑色的殿堂，LamboType 12 度倾斜终端，Lamborghini Gold 作为唯一点缀在虚空中点燃，六边形图案呼应品牌几何。',
        content: lamborghiniMd,
    },
    {
        id: 'nike',
        name: 'Nike — Kinetic Retail Cathedral',
        name_zh: 'Nike — 动感零售大教堂',
        category: 'Bold',
        description: 'A monochromatic UI that lets product photography be the only color source, with Nike Futura ND at 96px and line-height 0.90 punching through hero imagery like a typographic shockwave.',
        description_zh: '单色 UI 让产品摄影成为唯一色彩来源，Nike Futura ND 96px、0.90 行高如排版冲击波般穿透英雄图像。',
        content: nikeMd,
    },
    {
        id: 'nvidia',
        name: 'NVIDIA — Computational Power',
        name_zh: 'NVIDIA — 计算力量',
        category: 'Bold',
        description: 'A stark black-and-white foundation with NVIDIA\'s signature electric green as pure accent signal, industrial DIN heritage typography, and precision engineering hardware rendered in pixels.',
        description_zh: ' stark 黑白基础，NVIDIA 标志性电光绿作为纯点缀信号，工业 DIN 传承字体，像素中渲染的精密工程硬件。',
        content: nvidiaMd,
    },
    {
        id: 'renault',
        name: 'Renault — Vibrant Digital Showroom',
        name_zh: 'Renault — 活力数字展厅',
        category: 'Bold',
        description: 'A vibrant digital showroom with sweeping aurora gradients, NouvelR\'s 28-degree radical r, and Renault Yellow on sharp zero-radius buttons expressing French automotive elegance.',
        description_zh: '活力数字展厅， sweeping 极光渐变，NouvelR 28 度激进 r，Renault Yellow 在锋利零圆角按钮上表达法国汽车优雅。',
        content: renaultMd,
    },
    {
        id: 'shopify',
        name: 'Shopify — Nocturnal Commerce Theatre',
        name_zh: 'Shopify — 夜间商业剧场',
        category: 'Bold',
        description: 'A dark-first digital theatre with deep forest-teal undertones, NeueHaasGrotesk at monumental 96px weight 330, and Shopify Neon Green pulsing like bioluminescence against the dark canvas.',
        description_zh: '深色优先的数字剧场，深森林青底色，NeueHaasGrotesk 96px 330 字重，Shopify Neon Green 如生物发光般在暗色画布上脉动。',
        content: shopifyMd,
    },
    {
        id: 'spacex',
        name: 'SpaceX — Aerospace Film',
        name_zh: 'SpaceX — 航空电影',
        category: 'Bold',
        description: 'A full-screen cinematic experience with D-DIN uppercase text stenciled like mission briefing titles, radical minimalism with no cards or shadows, and photography as the sole visual element.',
        description_zh: '全屏电影体验，D-DIN 大写文字如任务简报标题般模版印刷，激进极简无卡片无阴影，摄影作为唯一视觉元素。',
        content: spacexMd,
    },
    {
        id: 'tesla',
        name: 'Tesla — Radical Subtraction',
        name_zh: 'Tesla — 激进减法',
        category: 'Bold',
        description: 'A digital showroom where the product is everything and the interface is almost nothing — cinematic car photography, a single Electric Blue CTA, and Universal Sans unifying all surfaces.',
        description_zh: '产品即一切、界面几乎为零的数字展厅——电影感汽车摄影，单一电光蓝 CTA，Universal Sans 统一所有表面。',
        content: teslaMd,
    },
    {
        id: 'spotify',
        name: 'Spotify — Content-First Darkness',
        name_zh: 'Spotify — 内容优先黑暗',
        category: 'Minimal',
        description: 'A near-black immersive cocoon where the UI recedes into shadow so music and album art can glow, with Spotify Green as singular functional accent and pill-and-circle geometry.',
        description_zh: '近黑色沉浸式茧房，UI 隐入阴影让音乐与专辑封面发光，Spotify Green 作为唯一功能点缀，药丸与圆形几何。',
        content: spotifyMd,
    },
    {
        id: 'uber',
        name: 'Uber — Confident Transit Map',
        name_zh: 'Uber — 自信的 Transit 地图',
        category: 'Minimal',
        description: 'A stark black-and-white universe with UberMove geometric sans, pill-shaped everything, and warm human illustrations that inject humanity into monochrome confidence.',
        description_zh: ' stark 黑白宇宙，UberMove 几何无衬线，全药丸形状，温暖人文插画为单色自信注入人性。',
        content: uberMd,
    },
    {
        id: 'superhuman',
        name: 'Superhuman — Luxury Envelope',
        name_zh: 'Superhuman — 奢华信封',
        category: 'Minimal',
        description: 'A predominantly white, immaculately clean canvas with a dramatic twilight purple gradient hero, Super Sans VF at unconventional weight stops, and lavender Mysteria accent.',
        description_zh: '以白色为主、一尘不染的干净画布，戏剧化暮光紫渐变英雄区，Super Sans VF 非常规字重停顿，薰衣草 Mysteria 点缀。',
        content: superhumanMd,
    },
    {
        id: 'bugatti',
        name: 'Bugatti — Feature-Length Car Film',
        name_zh: 'Bugatti — 汽车长片',
        category: 'Bold',
        description: 'A cinema-black canvas with Bugatti Display at 288px creating architectural headlines, monochrome-only palette, and pill-shaped transparent CTAs — a black velvet display stand for hypercars.',
        description_zh: '电影黑画布，Bugatti Display 288px 创造建筑级标题，纯单色调色板，药丸形透明 CTA——超跑的黑色天鹅绒展示台。',
        content: bugattiMd,
    },
    {
        id: 'playstation',
        name: 'PlayStation — Consumer Electronics Channel',
        name_zh: 'PlayStation — 消费电子频道',
        category: 'Bold',
        description: 'A vertical channel of near-black hero, paper-white editorial, and cobalt-blue footer, with SST weight 300 whispering quiet authority and a signature 1.2x hover-scale power-on animation.',
        description_zh: '近黑英雄区、纸白编辑区、钴蓝页脚的垂直频道，SST 300 字重低语安静权威，标志性的 1.2 倍悬停放大开机动画。',
        content: playstationMd,
    },
    {
        id: 'theverge',
        name: 'The Verge — Developer Club Night',
        name_zh: 'The Verge — 开发者夜店',
        category: 'Bold',
        description: 'A near-black editorial canvas with acid-mint and ultraviolet hazard-tape accents, massive Manuka display headlines up to 107px, and saturated color-block story tiles arranged in a StoryStream timeline.',
        description_zh: '近黑色编辑画布，酸薄荷与紫罗兰危险胶带点缀，107px 巨幅 Manuka 展示标题，饱和色块故事卡片按 StoryStream 时间线排列。',
        content: thevergeMd,
    },
    {
        id: 'wired',
        name: 'WIRED — Plugged-In Broadsheet',
        name_zh: 'WIRED — 通电的大报',
        category: 'Bold',
        description: 'A dense paper-white broadsheet grid held together by typographic weight and hairline rules, with WiredDisplay serif headlines and mono uppercase kickers with wide letter-spacing.',
        description_zh: '密集的纸白大报网格，由排版重量和发丝线规则维系，WiredDisplay 衬线标题和宽字距等宽大写眉批。',
        content: wiredMd,
    },
    {
        id: 'mastercard',
        name: 'Mastercard — Orbit and Trajectory',
        name_zh: 'Mastercard — 轨道与轨迹',
        category: 'Finance',
        description: 'A muted putty-cream canvas where everything that matters is shaped like a stadium, pill, or circle, with circular portraits connected by hand-drawn orange arcs implying constellations of services.',
        description_zh: '柔和腻子奶油画布，重要元素皆为体育场、药丸或圆形，圆形肖像由手绘橙色弧线连接，暗示服务星座。',
        content: mastercardMd,
    },
    {
        id: 'vodafone',
        name: 'Vodafone — Broadcast-Scale Telecom',
        name_zh: 'Vodafone — 广播级电信',
        category: 'Bold',
        description: 'A corporate web system with cinematic dark heroes, monumental 144px uppercase display headlines, and Vodafone Red full-width chapter bands creating a corporate newsroom feeling.',
        description_zh: '企业网络系统，电影感深色英雄区，144px 巨幅大写展示标题，Vodafone Red 全宽章节带营造企业新闻编辑室氛围。',
        content: vodafoneMd,
    },
    {
        id: 'starbucks',
        name: 'Starbucks — Warm Retail Flagship',
        name_zh: 'Starbucks — 温暖零售旗舰店',
        category: 'Bold',
        description: 'A warm cream canvas referencing cafe materials, four calibrated green shades each mapped to surface roles, SoDoSans with tight tracking, and a floating circular Frap CTA as signature depth move.',
        description_zh: '参考咖啡馆材质的温暖奶油画布，四种校准绿色各映射表面角色，SoDoSans 紧凑字距，浮动圆形 Frap CTA 作为标志性深度动作。',
        content: starbucksMd,
    }
];

export const getDesignMdList = () =>
    DESIGN_MD_TEMPLATES.map(({ content, ...meta }) => meta);

export const getDesignMdById = (id: string): DesignMdTemplate | undefined =>
    DESIGN_MD_TEMPLATES.find(t => t.id === id);
