import type { GeneratedImage as OnePaperGeneratedImage } from '../types';
import { getDB } from './db';
import type { GeneratedImage as StickerGeneratedImage, StickerStyle } from '../../stickercraft/types';
import type { StickerCraftPersistence } from '../../stickercraft/hooks/useStickerCraftRuntime';
import {
  clearStickerCraftLegacyLocalStorage,
  loadStickerCraftMigrationData,
} from '../../stickercraft/services/storageService';

const PLATFORM = 'StickerCraft';
const STICKER_META_VERSION = 1;
const ONEPAPER_STICKER_CUSTOM_STYLES_KEY = 'onepaper-sticker-custom-styles';

type OnePaperAsset = {
  id: string;
  projectId: string | null;
  artboardId: string | null;
  imageData: string;
  prompt: string | null;
  platform: string | null;
  designStyle: string | null;
  tags: string[];
  metaData: any;
  isFavorite: boolean;
  createdAt: string;
};

const safeTimestamp = (timestamp: number | undefined): number => (
  typeof timestamp === 'number' && Number.isFinite(timestamp) ? timestamp : Date.now()
);

const toIsoDate = (timestamp: number | undefined): string => (
  new Date(safeTimestamp(timestamp)).toISOString()
);

const isStickerCraftAsset = (asset: OnePaperAsset): boolean => (
  asset.platform === PLATFORM || Boolean(asset.metaData?.stickerCraft)
);

const mergeById = <T extends { id: string }>(primary: T[], secondary: T[]): T[] => {
  const knownIds = new Set(primary.map((item) => item.id));
  const merged = [...primary];

  secondary.forEach((item) => {
    if (!knownIds.has(item.id)) {
      knownIds.add(item.id);
      merged.push(item);
    }
  });

  return merged;
};

const sortStickersNewestFirst = (images: StickerGeneratedImage[]) => (
  [...images].sort((a, b) => safeTimestamp(b.createdAt) - safeTimestamp(a.createdAt))
);

const readOnePaperStickerCustomStyles = (): StickerStyle[] => {
  if (typeof localStorage === 'undefined') return [];

  try {
    const saved = localStorage.getItem(ONEPAPER_STICKER_CUSTOM_STYLES_KEY);
    if (!saved) return [];

    const parsed = JSON.parse(saved);
    return Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    console.warn('Failed to read OnePaper StickerCraft custom styles.', error);
    return [];
  }
};

const writeOnePaperStickerCustomStyles = (customStyles: StickerStyle[]) => {
  if (typeof localStorage === 'undefined') return;
  localStorage.setItem(ONEPAPER_STICKER_CUSTOM_STYLES_KEY, JSON.stringify(customStyles));
};

export const stickerToOnePaperImage = (image: StickerGeneratedImage): OnePaperGeneratedImage => {
  const {
    dataUrl,
    prompt,
    createdAt,
    styleName,
    collectionItems,
    ...stickerFields
  } = image;

  return {
    id: image.id,
    url: dataUrl,
    prompt: prompt || '',
    timestamp: safeTimestamp(createdAt),
    details: {
      platform: PLATFORM,
      resolution: '1024x1024',
      style: styleName || 'Sticker',
      tokens: {} as any,
      fullPrompt: prompt || '',
      originalDescription: prompt || '',
      stickerCraft: {
        schemaVersion: STICKER_META_VERSION,
        ...stickerFields,
        collectionItems: collectionItems ? collectionItems.map((item) => ({ ...item })) : undefined,
      },
    },
  };
};

export const onePaperImageToSticker = (image: OnePaperGeneratedImage): StickerGeneratedImage | null => {
  if (image.details?.platform !== PLATFORM && !image.details?.stickerCraft) {
    return null;
  }

  const stickerCraft = image.details?.stickerCraft || {};

  return {
    ...stickerCraft,
    id: image.id,
    dataUrl: image.url,
    prompt: image.prompt || '',
    createdAt: safeTimestamp(image.timestamp),
    styleName: image.details?.style || stickerCraft.styleName || 'Sticker',
    collectionItems: stickerCraft.collectionItems,
  };
};

const stickerToOnePaperAsset = (image: StickerGeneratedImage): OnePaperAsset => {
  const onePaperImage = stickerToOnePaperImage(image);

  return {
    id: onePaperImage.id,
    projectId: null,
    artboardId: null,
    imageData: onePaperImage.url,
    prompt: onePaperImage.prompt || null,
    platform: PLATFORM,
    designStyle: image.styleName || null,
    tags: ['stickercraft', 'sticker'],
    metaData: onePaperImage.details || {},
    isFavorite: false,
    createdAt: toIsoDate(image.createdAt),
  };
};

const assetToSticker = (asset: OnePaperAsset): StickerGeneratedImage | null => {
  if (!isStickerCraftAsset(asset)) return null;

  const timestamp = Date.parse(asset.createdAt);
  const stickerCraft = asset.metaData?.stickerCraft || {};

  return {
    ...stickerCraft,
    id: asset.id,
    dataUrl: asset.imageData,
    prompt: asset.prompt || stickerCraft.prompt || '',
    createdAt: Number.isFinite(timestamp) ? timestamp : safeTimestamp(stickerCraft.createdAt),
    styleName: asset.designStyle || asset.metaData?.style || stickerCraft.styleName || 'Sticker',
    collectionItems: stickerCraft.collectionItems,
  };
};

export const loadOnePaperStickerImages = async (): Promise<StickerGeneratedImage[]> => {
  const db = await getDB();
  const assets = await db.getAll('generatedAssets') as OnePaperAsset[];
  return sortStickersNewestFirst(assets.map(assetToSticker).filter(Boolean) as StickerGeneratedImage[]);
};

export const saveOnePaperStickerImages = async (images: StickerGeneratedImage[]) => {
  const db = await getDB();
  const currentIds = new Set(images.map((image) => image.id));
  const existingAssets = await db.getAll('generatedAssets') as OnePaperAsset[];
  const staleStickerAssets = existingAssets.filter((asset) => (
    isStickerCraftAsset(asset) && !currentIds.has(asset.id)
  ));

  await Promise.all(images.map((image) => db.put('generatedAssets', stickerToOnePaperAsset(image))));
  await Promise.all(staleStickerAssets.map((asset) => db.delete('generatedAssets', asset.id)));
};

export const migrateLegacyStickerCraftToOnePaperGallery = async (): Promise<number> => {
  const legacyData = await loadStickerCraftMigrationData();
  const db = await getDB();
  const existingAssets = await db.getAll('generatedAssets') as OnePaperAsset[];
  const existingIds = new Set(existingAssets.map((asset) => asset.id));
  const stickersToImport = legacyData.images.filter((image) => !existingIds.has(image.id));

  await Promise.all(stickersToImport.map((image) => db.put('generatedAssets', stickerToOnePaperAsset(image))));

  if (legacyData.customStyles.length > 0) {
    const nextCustomStyles = mergeById(readOnePaperStickerCustomStyles(), legacyData.customStyles);
    writeOnePaperStickerCustomStyles(nextCustomStyles);
  }

  clearStickerCraftLegacyLocalStorage();
  return stickersToImport.length;
};

export const loadOnePaperStickerCraftData = async () => {
  await migrateLegacyStickerCraftToOnePaperGallery();

  return {
    images: await loadOnePaperStickerImages(),
    customStyles: readOnePaperStickerCustomStyles(),
  };
};

export const saveOnePaperStickerCustomStyles = async (customStyles: StickerStyle[]) => {
  writeOnePaperStickerCustomStyles(customStyles);
};

export const onePaperStickerCraftPersistence: StickerCraftPersistence = {
  load: loadOnePaperStickerCraftData,
  saveImages: saveOnePaperStickerImages,
  saveCustomStyles: saveOnePaperStickerCustomStyles,
};
