import React from 'react';
import { BadgeCheck, Download, FileImage, Layers3, ShieldCheck, X } from 'lucide-react';
import GeneratedGrid from '../../stickercraft/components/GeneratedGrid';
import { useLanguage } from '../../stickercraft/contexts/LanguageContext';
import type { GeneratedImage } from '../../stickercraft/types';
import type { StickerCraftRuntime } from '../../stickercraft/hooks/useStickerCraftRuntime';

interface Props {
  runtime: StickerCraftRuntime;
}

const StickerWorkspace: React.FC<Props> = ({ runtime }) => {
  const { t, language } = useLanguage();
  const {
    images,
    isGenerating,
    regeneratingIds,
    transparencyRepairIds,
    splittingCollectionIds,
    pendingQuantity,
    previewImage,
    setPreviewImage,
    closePreview,
    handleRepairTransparency,
    handleSplitCollection,
    handleManualSplitCollection,
    handleCropCollectionItem,
    handleDeleteCollectionItem,
    handleRegenerate,
    handleImageUpload,
    handleDeleteImage,
    handleDeleteImages,
  } = runtime;

  const assetCopy = language === 'zh'
    ? {
        title: '贴纸工作区',
        count: '张贴纸',
        galleryDescription: 'OnePaper 统一图库',
        transparent: '透明 PNG',
        backgroundKept: '保留背景',
        uploaded: '上传素材',
        whiteBorder: '白边',
        noBorder: '无白边',
        collection: '贴纸集合',
        text: '含文字',
        reference: '参考图',
        assetReadiness: '素材状态',
        transparentNote: '透明结果来自生成后的背景处理，复杂发光、毛发或半透明边缘仍建议复查。',
        backgroundNote: '该素材保留了生成背景，适合海报、卡片或需要背景的贴纸图。',
        uploadedNote: '这是手动上传到图库的素材，透明状态取决于原始文件。',
      }
    : {
        title: 'Sticker Workspace',
        count: 'stickers',
        galleryDescription: 'OnePaper unified gallery',
        transparent: 'Transparent PNG',
        backgroundKept: 'Background kept',
        uploaded: 'Uploaded asset',
        whiteBorder: 'White border',
        noBorder: 'No border',
        collection: 'Sticker set',
        text: 'Text',
        reference: 'Reference image',
        assetReadiness: 'Asset readiness',
        transparentNote: 'Transparency is created by post-processing the generated background; inspect glow, hair, or soft edges before print use.',
        backgroundNote: 'This asset keeps its generated background for posters, cards, or sticker art that needs a scene.',
        uploadedNote: 'This was uploaded manually; transparency depends on the original file.',
      };

  const getPreviewAssetNote = (image: GeneratedImage) => {
    if (image.sourceType === 'uploaded') return assetCopy.uploadedNote;
    if (image.backgroundRemoved === false) return assetCopy.backgroundNote;
    return assetCopy.transparentNote;
  };

  const getPreviewBadges = (image: GeneratedImage) => {
    const badges = [
      image.sourceType === 'uploaded'
        ? assetCopy.uploaded
        : image.backgroundRemoved === false
          ? assetCopy.backgroundKept
          : assetCopy.transparent,
    ];

    if (image.sourceType !== 'uploaded') {
      badges.push(image.hasStickerBorder ? assetCopy.whiteBorder : assetCopy.noBorder);
    }
    if (image.isStickerCollection) {
      badges.push(`${assetCopy.collection}${image.stickerCollectionCount ? ` x${image.stickerCollectionCount}` : ''}`);
    }
    if (image.hasText) badges.push(assetCopy.text);
    if (image.hasReferenceImage) badges.push(assetCopy.reference);

    return badges;
  };

  return (
    <div className="flex h-full min-w-0 flex-col bg-stone-50 text-stone-900">
      <div className="flex items-center justify-between gap-4 border-b border-stone-200 bg-white px-6 py-4">
        <div className="min-w-0">
          <h2 className="text-lg font-black text-stone-900">{assetCopy.title}</h2>
          <p className="text-xs font-semibold text-stone-400">{assetCopy.galleryDescription}</p>
        </div>
        <div className="rounded-full border border-orange-100 bg-orange-50 px-3 py-1 text-xs font-black text-orange-700">
          {images.length} {assetCopy.count}
        </div>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto p-4 md:p-6">
        <GeneratedGrid
          images={images}
          isGenerating={isGenerating}
          pendingQuantity={pendingQuantity}
          onPreview={setPreviewImage}
          onDelete={handleDeleteImage}
          onDeleteMany={handleDeleteImages}
          onRegenerate={handleRegenerate}
          onRepairTransparency={handleRepairTransparency}
          onSplitCollection={handleSplitCollection}
          onManualSplitCollection={handleManualSplitCollection}
          onCropCollectionItem={handleCropCollectionItem}
          onDeleteCollectionItem={handleDeleteCollectionItem}
          regeneratingIds={regeneratingIds}
          transparencyRepairIds={transparencyRepairIds}
          splittingCollectionIds={splittingCollectionIds}
          onUploadImage={handleImageUpload}
        />
      </div>

      {previewImage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-stone-900/90 p-4 backdrop-blur-sm" onClick={closePreview}>
          <div
            className="relative flex max-h-[90vh] w-full max-w-4xl flex-col overflow-hidden rounded-3xl bg-white shadow-2xl md:flex-row"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex min-h-[300px] flex-1 items-center justify-center bg-stone-100 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] p-8">
              <img
                src={previewImage.dataUrl}
                alt={previewImage.prompt}
                className="max-h-[70vh] max-w-full object-contain drop-shadow-2xl"
              />
            </div>

            <div className="flex w-full flex-col border-l border-stone-100 bg-white p-6 md:w-80 md:p-8">
              <div className="mb-6 flex items-start justify-between">
                <div>
                  <h3 className="mb-1 text-xl font-bold text-stone-900">{t('sticker_details')}</h3>
                  <span className="rounded-full border border-orange-100 bg-orange-50 px-2 py-1 text-xs font-bold uppercase tracking-wide text-orange-600">
                    {previewImage.styleName}
                  </span>
                </div>
                <button
                  onClick={closePreview}
                  className="text-stone-400 transition-colors hover:text-stone-800"
                >
                  <X size={24} />
                </button>
              </div>

              <div className="flex-grow space-y-4">
                <div>
                  <label className="text-xs font-bold uppercase text-stone-400">Prompt</label>
                  <p className="text-sm font-medium leading-relaxed text-stone-700">{previewImage.prompt}</p>
                </div>
                <div className="rounded-2xl border border-orange-100 bg-orange-50/60 p-3">
                  <div className="mb-2 flex items-center gap-2 text-xs font-black uppercase tracking-wide text-orange-800">
                    <BadgeCheck size={14} />
                    {assetCopy.assetReadiness}
                  </div>
                  <div className="mb-2 flex flex-wrap gap-1.5">
                    {getPreviewBadges(previewImage).map((badge) => (
                      <span key={badge} className="rounded-full border border-orange-100 bg-white px-2 py-1 text-[10px] font-bold text-orange-700">
                        {badge}
                      </span>
                    ))}
                  </div>
                  <p className="text-xs leading-relaxed text-orange-800">{getPreviewAssetNote(previewImage)}</p>
                </div>
                <div>
                  <label className="text-xs font-bold uppercase text-stone-400">{t('created')}</label>
                  <p className="font-mono text-sm text-stone-700">{new Date(previewImage.createdAt).toLocaleString()}</p>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <div className="rounded-xl border border-stone-100 bg-stone-50 p-2 text-center">
                    <FileImage size={15} className="mx-auto mb-1 text-stone-500" />
                    <p className="text-[10px] font-bold text-stone-500">PNG</p>
                  </div>
                  <div className="rounded-xl border border-stone-100 bg-stone-50 p-2 text-center">
                    <Layers3 size={15} className="mx-auto mb-1 text-stone-500" />
                    <p className="text-[10px] font-bold text-stone-500">ZIP</p>
                  </div>
                  <div className="rounded-xl border border-stone-100 bg-stone-50 p-2 text-center">
                    <ShieldCheck size={15} className="mx-auto mb-1 text-stone-500" />
                    <p className="text-[10px] font-bold text-stone-500">BYOK</p>
                  </div>
                </div>
              </div>

              <div className="mt-8 space-y-3 border-t border-stone-100 pt-6">
                <a
                  href={previewImage.dataUrl}
                  download={`sticker-${previewImage.id}.png`}
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-orange-500 py-3 font-bold text-white shadow-lg shadow-orange-200 transition-colors hover:bg-orange-600"
                >
                  <Download size={20} />
                  {t('download_png')}
                </a>

                <button
                  onClick={() => handleDeleteImage(previewImage.id)}
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-stone-100 py-3 font-bold text-stone-600 transition-colors hover:bg-rose-50 hover:text-rose-600"
                >
                  <X size={20} />
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StickerWorkspace;
