import type {
  MediaAspectRatio,
  MediaResolutionPreset,
  PlatformType,
  ResolutionPreset,
  UIStyle,
} from '../types';

export const DEFAULT_RESOLUTION: ResolutionPreset = {
  id: 'mobile-md',
  name: 'Mobile Medium (iOS Standard)',
  name_zh: '标准手机 (390x844)',
  width: 390,
  height: 844,
  type: 'mobile',
};

const DEFAULT_RESOLUTION_BY_PLATFORM: Record<PlatformType, ResolutionPreset> = {
  mobile: {
    id: 'mobile-sm',
    name: 'Mobile Small (iPhone SE)',
    name_zh: '小屏手机 (375x667)',
    width: 375,
    height: 667,
    type: 'mobile',
  },
  tablet: {
    id: 'tablet-sm',
    name: 'Tablet Small (iPad Mini)',
    name_zh: '小平板 (744x1133)',
    width: 744,
    height: 1133,
    type: 'tablet',
  },
  pc: {
    id: 'laptop-sm',
    name: 'Laptop (13")',
    name_zh: '笔记本 13" (1280x800)',
    width: 1280,
    height: 800,
    type: 'pc',
  },
  browser: {
    id: 'browser-hd',
    name: 'Browser Window HD',
    name_zh: '浏览器窗口 HD',
    width: 1280,
    height: 720,
    type: 'browser',
  },
};

export const DEFAULT_STYLE: UIStyle = {
  id: 'minimalist',
  name: 'Modern Minimalist',
  name_zh: '现代极简',
  category: 'Mainstream',
  description: 'Clean lines, whitespace, neutral.',
  description_zh: '线条简洁，留白充足，中性色调。',
  promptModifier: 'minimalist, clean, modern, whitespace, sans-serif typography, subtle shadows, professional corporate look',
};

const DEFAULT_MEDIA_RESOLUTION_BY_RATIO: Record<MediaAspectRatio, MediaResolutionPreset> = {
  '1:1': {
    id: '1-1-sm',
    name: '1:1 Small',
    name_zh: '1:1 小尺寸',
    width: 800,
    height: 800,
    ratio: '1:1',
  },
  '3:4': {
    id: '3-4-sm',
    name: '3:4 Small',
    name_zh: '3:4 小尺寸',
    width: 750,
    height: 1000,
    ratio: '3:4',
  },
  '4:3': {
    id: '4-3-sm',
    name: '4:3 Small',
    name_zh: '4:3 小尺寸',
    width: 1000,
    height: 750,
    ratio: '4:3',
  },
  '9:16': {
    id: '9-16-sm',
    name: '9:16 Small',
    name_zh: '9:16 小尺寸',
    width: 720,
    height: 1280,
    ratio: '9:16',
  },
  '16:9': {
    id: '16-9-sm',
    name: '16:9 Small',
    name_zh: '16:9 小尺寸',
    width: 1280,
    height: 720,
    ratio: '16:9',
  },
  '2:3': {
    id: '2-3-sm',
    name: '2:3 Small',
    name_zh: '2:3 小尺寸',
    width: 800,
    height: 1200,
    ratio: '2:3',
  },
  '3:2': {
    id: '3-2-sm',
    name: '3:2 Small',
    name_zh: '3:2 小尺寸',
    width: 1200,
    height: 800,
    ratio: '3:2',
  },
};

export function getDefaultResolutionForPlatform(platform: PlatformType): ResolutionPreset {
  return DEFAULT_RESOLUTION_BY_PLATFORM[platform] || DEFAULT_RESOLUTION;
}

export function getDefaultMediaResolutionForRatio(ratio: MediaAspectRatio): MediaResolutionPreset {
  return DEFAULT_MEDIA_RESOLUTION_BY_RATIO[ratio] || DEFAULT_MEDIA_RESOLUTION_BY_RATIO['3:4'];
}
