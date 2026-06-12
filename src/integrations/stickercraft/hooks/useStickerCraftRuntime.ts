import { useEffect, useState } from 'react';
import { STICKER_STYLES } from '../constants';
import { AspectRatio, ModelType } from '../types';
import type { CropAdjustments, GeneratedImage, StickerRequest, StickerStyle } from '../types';
import { generateStickers } from '../services/geminiService';
import {
  recropStickerFromSource,
  repairStickerTransparency,
  splitStickerCollectionByGridDetailed,
  splitStickerCollectionDetailed,
} from '../services/imageProcessing';
import type { SplitStickerCollectionResult } from '../services/imageProcessing';
import {
  loadPersistedStickerCraftData,
  saveCustomStyles,
  saveGeneratedImages,
} from '../services/storageService';
import type { PersistedStickerCraftData } from '../services/storageService';

type Options = {
  genericErrorText: string;
  persistence?: StickerCraftPersistence;
};

export interface StickerCraftPersistence {
  load: () => Promise<PersistedStickerCraftData>;
  saveImages: (images: GeneratedImage[]) => Promise<void>;
  saveCustomStyles: (customStyles: StickerStyle[]) => Promise<void>;
}

const defaultStickerCraftPersistence: StickerCraftPersistence = {
  load: loadPersistedStickerCraftData,
  saveImages: saveGeneratedImages,
  saveCustomStyles,
};

function buildCollectionItems(
  image: GeneratedImage,
  result: SplitStickerCollectionResult,
  method: 'auto' | 'manual',
): GeneratedImage[] {
  const now = Date.now();

  return result.pieces.map((piece, index) => ({
    id: crypto.randomUUID(),
    dataUrl: piece.dataUrl,
    prompt: image.prompt,
    createdAt: now + index,
    styleName: image.styleName,
    backgroundRemoved: true,
    backgroundColor: undefined,
    hasStickerBorder: image.hasStickerBorder,
    hasText: image.hasText,
    hasReferenceImage: image.hasReferenceImage,
    isThreeViews: false,
    isStickerCollection: false,
    stickerCollectionCount: undefined,
    sourceType: image.sourceType,
    splitMethod: method,
    splitIndex: index + 1,
    splitSource: {
      box: piece.box,
      sourceWidth: piece.sourceWidth,
      sourceHeight: piece.sourceHeight,
    },
  }));
}

export function useStickerCraftRuntime({
  genericErrorText,
  persistence = defaultStickerCraftPersistence,
}: Options) {
  const [images, setImages] = useState<GeneratedImage[]>([]);
  const [customStyles, setCustomStyles] = useState<StickerStyle[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [regeneratingIds, setRegeneratingIds] = useState<Set<string>>(new Set());
  const [transparencyRepairIds, setTransparencyRepairIds] = useState<Set<string>>(new Set());
  const [splittingCollectionIds, setSplittingCollectionIds] = useState<Set<string>>(new Set());
  const [pendingQuantity, setPendingQuantity] = useState(0);
  const [previewImage, setPreviewImage] = useState<GeneratedImage | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [hasHydratedStorage, setHasHydratedStorage] = useState(false);

  useEffect(() => {
    let isMounted = true;

    persistence.load()
      .then(({ images: persistedImages, customStyles: persistedCustomStyles }) => {
        if (!isMounted) return;
        setImages(persistedImages);
        setCustomStyles(persistedCustomStyles);
      })
      .catch((storageError) => {
        console.error('Failed to load persisted StickerCraft data', storageError);
        if (isMounted) {
          setError('Could not load saved stickers from browser storage.');
        }
      })
      .finally(() => {
        if (isMounted) {
          setHasHydratedStorage(true);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [persistence]);

  useEffect(() => {
    if (!hasHydratedStorage) return;

    persistence.saveCustomStyles(customStyles).catch((storageError) => {
      console.error('Failed to save custom styles to IndexedDB', storageError);
      setError('Custom styles could not be saved to browser storage.');
    });
  }, [customStyles, hasHydratedStorage, persistence]);

  useEffect(() => {
    if (!hasHydratedStorage) return;

    persistence.saveImages(images).catch((storageError) => {
      console.error('Failed to save images to IndexedDB', storageError);
      setError('Generated stickers could not be saved to browser storage.');
    });
  }, [images, hasHydratedStorage, persistence]);

  useEffect(() => {
    if (!previewImage) return;

    const latestPreviewImage = images.find((image) => image.id === previewImage.id);
    if (latestPreviewImage && latestPreviewImage !== previewImage) {
      setPreviewImage(latestPreviewImage);
    } else if (hasHydratedStorage && !latestPreviewImage) {
      setPreviewImage(null);
    }
  }, [images, previewImage, hasHydratedStorage]);

  const handleAddCustomStyle = (style: StickerStyle) => {
    setCustomStyles((prev) => [...prev, style]);
  };

  const handleRemoveCustomStyle = (id: string) => {
    setCustomStyles((prev) => prev.filter((style) => style.id !== id));
  };

  const handleGenerate = async (requests: StickerRequest[]) => {
    const totalQty = requests.reduce((acc, req) => acc + req.quantity, 0);
    setPendingQuantity(totalQty);
    setIsGenerating(true);
    setError(null);

    try {
      const allStyles = [...STICKER_STYLES, ...customStyles];
      const batchResults = await Promise.all(
        requests.map((request) => generateStickers(request, allStyles)),
      );

      setImages((prev) => [...batchResults.flat(), ...prev]);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : genericErrorText);
    } finally {
      setIsGenerating(false);
      setPendingQuantity(0);
    }
  };

  const handleRepairTransparency = async (image: GeneratedImage) => {
    setError(null);
    setTransparencyRepairIds((prev) => new Set(prev).add(image.id));

    try {
      const repairedDataUrl = await repairStickerTransparency(image.dataUrl, {
        backgroundColor: image.backgroundColor,
        hasStickerBorder: image.hasStickerBorder,
      });

      setImages((prev) => prev.map((img) => (
        img.id === image.id
          ? {
              ...img,
              dataUrl: repairedDataUrl,
              backgroundRemoved: true,
              backgroundColor: undefined,
              createdAt: repairedDataUrl === image.dataUrl ? img.createdAt : Date.now(),
            }
          : img
      )));
    } catch (err: unknown) {
      setError(`Transparency repair failed: ${err instanceof Error ? err.message : 'Please try again.'}`);
    } finally {
      setTransparencyRepairIds((prev) => {
        const next = new Set(prev);
        next.delete(image.id);
        return next;
      });
    }
  };

  const applyCollectionSplit = (
    image: GeneratedImage,
    result: SplitStickerCollectionResult,
    method: 'auto' | 'manual',
  ) => {
    const collectionItems = buildCollectionItems(image, result, method);

    setImages((prev) => prev.map((img) => (
      img.id === image.id
        ? {
            ...img,
            dataUrl: result.sourceDataUrl,
            backgroundRemoved: true,
            backgroundColor: undefined,
            splitMethod: method,
            collectionItems,
          }
        : img
    )));
  };

  const handleSplitCollection = async (image: GeneratedImage) => {
    setError(null);
    setSplittingCollectionIds((prev) => new Set(prev).add(image.id));

    try {
      const result = await splitStickerCollectionDetailed(image.dataUrl, {
        backgroundColor: image.backgroundColor,
        expectedCount: image.stickerCollectionCount || 6,
        hasStickerBorder: image.hasStickerBorder,
      });

      if (result.pieces.length === 0) {
        throw new Error('No separated stickers were detected.');
      }

      applyCollectionSplit(image, result, 'auto');
      return true;
    } catch (err: unknown) {
      setError(`Sticker split failed: ${err instanceof Error ? err.message : 'Please try again.'}`);
      return false;
    } finally {
      setSplittingCollectionIds((prev) => {
        const next = new Set(prev);
        next.delete(image.id);
        return next;
      });
    }
  };

  const handleManualSplitCollection = async (image: GeneratedImage, rows: number, columns: number) => {
    setError(null);
    setSplittingCollectionIds((prev) => new Set(prev).add(image.id));

    try {
      const result = await splitStickerCollectionByGridDetailed(image.dataUrl, {
        backgroundColor: image.backgroundColor,
        rows,
        columns,
        hasStickerBorder: image.hasStickerBorder,
      });

      if (result.pieces.length === 0) {
        throw new Error('No stickers were detected in the selected grid.');
      }

      applyCollectionSplit(image, result, 'manual');
    } catch (err: unknown) {
      setError(`Manual split failed: ${err instanceof Error ? err.message : 'Please try again.'}`);
    } finally {
      setSplittingCollectionIds((prev) => {
        const next = new Set(prev);
        next.delete(image.id);
        return next;
      });
    }
  };

  const handleCropCollectionItem = async (
    collectionId: string,
    itemId: string,
    adjustments: CropAdjustments,
  ) => {
    const collection = images.find((image) => image.id === collectionId);
    const item = collection?.collectionItems?.find((splitItem) => splitItem.id === itemId);

    if (!collection || !item?.splitSource) {
      setError('Could not find the original sticker collection for recropping.');
      return;
    }

    setError(null);

    try {
      const recroppedDataUrl = await recropStickerFromSource(
        collection.dataUrl,
        item.splitSource.box,
        adjustments,
      );

      setImages((prev) => prev.map((image) => (
        image.id === collectionId
          ? {
              ...image,
              collectionItems: image.collectionItems?.map((splitItem) => (
                splitItem.id === itemId
                  ? {
                      ...splitItem,
                      dataUrl: recroppedDataUrl,
                      createdAt: Date.now(),
                      splitSource: {
                        ...splitItem.splitSource!,
                        cropAdjustments: adjustments,
                      },
                    }
                  : splitItem
              )),
            }
          : image
      )));
    } catch (err: unknown) {
      setError(`Recrop failed: ${err instanceof Error ? err.message : 'Please try again.'}`);
    }
  };

  const handleDeleteCollectionItem = (collectionId: string, itemId: string) => {
    setImages((prev) => prev.map((image) => (
      image.id === collectionId
        ? {
            ...image,
            collectionItems: image.collectionItems?.filter((splitItem) => splitItem.id !== itemId),
          }
        : image
    )));
  };

  const handleRegenerate = async (image: GeneratedImage) => {
    const allStyles = [...STICKER_STYLES, ...customStyles];
    const originalStyle = allStyles.find((style) => style.name === image.styleName) || STICKER_STYLES[0];

    setRegeneratingIds((prev) => new Set(prev).add(image.id));

    try {
      const request: StickerRequest = {
        prompt: image.prompt,
        styleId: originalStyle.id,
        quantity: 1,
        model: ModelType.NANO_BANANA_2,
        aspectRatio: AspectRatio.SQUARE,
        textConfig: { enabled: false, content: '', font: '', hasBorder: false },
        backgroundConfig: { enabled: false, color: 'white' },
        useThreeViews: Boolean(image.isThreeViews),
        useStickerCollection: Boolean(image.isStickerCollection),
        stickerCollectionCount: image.stickerCollectionCount || 6,
        useStickerBorder: true,
        useFacialFeatures: true,
        referenceImage: image.dataUrl,
      };

      const newImages = await generateStickers(request, allStyles);
      const newImage = newImages[0];

      if (newImage) {
        setImages((prev) => prev.map((img) => (
          img.id === image.id ? { ...newImage, id: image.id, createdAt: Date.now() } : img
        )));
      }
    } catch (err: unknown) {
      setError(`Regeneration failed: ${err instanceof Error ? err.message : 'Please try again.'}`);
    } finally {
      setRegeneratingIds((prev) => {
        const next = new Set(prev);
        next.delete(image.id);
        return next;
      });
    }
  };

  const handleImageUpload = (dataUrl: string, prompt: string, styleName: string) => {
    const newImage: GeneratedImage = {
      id: crypto.randomUUID(),
      dataUrl,
      prompt,
      createdAt: Date.now(),
      styleName,
      sourceType: 'uploaded',
    };

    setImages((prev) => [newImage, ...prev]);
  };

  const closePreview = () => setPreviewImage(null);

  const handleDeleteImage = (id: string) => {
    setImages((prev) => prev.filter((img) => img.id !== id));
    if (previewImage?.id === id) {
      closePreview();
    }
  };

  const handleDeleteImages = (ids: string[]) => {
    const idSet = new Set(ids);
    setImages((prev) => prev.filter((img) => !idSet.has(img.id)));
    if (previewImage && idSet.has(previewImage.id)) {
      closePreview();
    }
  };

  return {
    images,
    customStyles,
    isGenerating,
    regeneratingIds,
    transparencyRepairIds,
    splittingCollectionIds,
    pendingQuantity,
    previewImage,
    error,
    setPreviewImage,
    closePreview,
    handleAddCustomStyle,
    handleRemoveCustomStyle,
    handleGenerate,
    handleRepairTransparency,
    handleSplitCollection,
    handleManualSplitCollection,
    handleCropCollectionItem,
    handleDeleteCollectionItem,
    handleRegenerate,
    handleImageUpload,
    handleDeleteImage,
    handleDeleteImages,
  };
}

export type StickerCraftRuntime = ReturnType<typeof useStickerCraftRuntime>;
