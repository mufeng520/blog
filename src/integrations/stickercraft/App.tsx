import React from 'react';
import Header from './components/Header';
import ControlPanel from './components/ControlPanel';
import GeneratedGrid from './components/GeneratedGrid';
import type { GeneratedImage } from './types';
import { X, Download, BadgeCheck, FileImage, Layers3, ShieldCheck } from 'lucide-react';
import { useLanguage } from './contexts/LanguageContext';
import { useStickerCraftRuntime } from './hooks/useStickerCraftRuntime';
import type { StickerCraftPersistence } from './hooks/useStickerCraftRuntime';

export interface StickerCraftWorkspaceProps {
  embedded?: boolean;
  persistence?: StickerCraftPersistence;
}

export const StickerCraftWorkspace: React.FC<StickerCraftWorkspaceProps> = ({
  embedded = false,
  persistence,
}) => {
  const { t, language } = useLanguage();
  const runtime = useStickerCraftRuntime({ genericErrorText: t('error_generic'), persistence });
  const {
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
  } = runtime;

  const assetCopy = language === 'zh'
    ? {
        galleryDescription: '快快准备，获得你的贴纸',
        transparent: '透明 PNG',
        backgroundKept: '保留背景',
        uploaded: '上传素材',
        whiteBorder: '白边',
        noBorder: '无白边',
        collection: '贴纸集合',
        text: '含文字',
        reference: '参考图',
        assetReadiness: '素材状态',
        transparentNote: '透明结果由纯色背景生成后处理得到；复杂发光、头发或半透明边缘仍建议复查。',
        backgroundNote: '该素材保留了生成背景，适合海报、卡片或需要背景的贴纸图。',
        uploadedNote: '这是手动上传到图库的素材，透明状态取决于原始文件。',
        apiTrust: 'API Key 保存在浏览器本地配置中；公开部署前请加后端代理和额度保护。',
        galleryTitlePrefix: '贴纸',
        galleryTitleAccent: '图库',
      }
    : {
        galleryDescription: 'Review generated assets, transparency state, and batch export readiness.',
        transparent: 'Transparent PNG',
        backgroundKept: 'Background kept',
        uploaded: 'Uploaded asset',
        whiteBorder: 'White border',
        noBorder: 'No border',
        collection: 'Sticker set',
        text: 'Text',
        reference: 'Reference image',
        assetReadiness: 'Asset readiness',
        transparentNote: 'Transparency is created from a controlled solid-background workflow; inspect glow, hair, or soft edges before print use.',
        backgroundNote: 'This asset keeps its generated background for posters, cards, or sticker art that needs a scene.',
        uploadedNote: 'This was uploaded manually; transparency depends on the original file.',
        apiTrust: 'API keys stay in browser settings; add a backend proxy and quota protection before public shared deployments.',
        galleryTitlePrefix: 'Sticker',
        galleryTitleAccent: 'Gallery',
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
    <div className={`${embedded ? 'h-full' : 'h-screen'} bg-stone-50 flex flex-col font-sans text-stone-900 overflow-hidden`}>
      <Header />

      {/* Main Layout: Flex-col-reverse for mobile (Controls bottom), Flex-row for desktop (Controls Left) */}
      <main className="flex-1 flex flex-col-reverse md:flex-row overflow-hidden">
        
        {/* Left Area (Desktop): Palette / Control Panel */}
        <aside className="w-full md:w-[360px] lg:w-[400px] bg-white border-r border-orange-100 shadow-2xl shadow-orange-100/50 z-20 flex flex-col h-[50vh] md:h-auto overflow-hidden flex-shrink-0">
          <div className="p-5 border-b border-orange-50 bg-white sticky top-0 z-10">
            <h3 className="text-lg font-black text-stone-800 uppercase tracking-wide flex items-center gap-2">
               <span className="w-2 h-6 bg-orange-500 rounded-full"></span>
               Creation Palette
            </h3>
          </div>
          
          <div className="flex-1 overflow-y-auto custom-scrollbar p-5">
            <ControlPanel 
              onGenerate={handleGenerate} 
              isGenerating={isGenerating}
              customStyles={customStyles}
              onAddCustomStyle={handleAddCustomStyle}
              onRemoveCustomStyle={handleRemoveCustomStyle}
            />
             {error && (
              <div className="mt-6 p-4 bg-rose-50 border border-rose-100 rounded-xl text-rose-600 text-sm animate-fade-in text-center">
                <p className="font-bold">Oops!</p>
                <p>{error}</p>
              </div>
            )}
          </div>
        </aside>

        {/* Right Area (Desktop): Sticker Canvas / Gallery */}
        <div className="flex-1 bg-stone-100/50 relative overflow-y-auto custom-scrollbar p-4 md:p-8">
           <div className="max-w-7xl mx-auto min-h-full flex flex-col">
             {/* Header for the canvas area */}
             <div className="mb-6">
                <h2 className="text-3xl font-extrabold text-stone-800 tracking-tight">
                  {assetCopy.galleryTitlePrefix} <span className="text-orange-500">{assetCopy.galleryTitleAccent}</span>
                </h2>
                <p className="text-stone-500 mt-1">
                  {assetCopy.galleryDescription}
                </p>
             </div>

             <div className="flex-grow">
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
           </div>
        </div>

      </main>

      {/* Full Screen Image Preview Modal */}
      {previewImage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-stone-900/90 backdrop-blur-sm p-4" onClick={closePreview}>
          <div 
            className="relative bg-white rounded-3xl overflow-hidden max-w-4xl w-full max-h-[90vh] shadow-2xl flex flex-col md:flex-row animate-scale-in"
            onClick={e => e.stopPropagation()}
          >
            {/* Image Side */}
            <div className="flex-1 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] bg-stone-100 flex items-center justify-center p-8 min-h-[300px]">
              <img 
                src={previewImage.dataUrl} 
                alt={previewImage.prompt}
                className="max-w-full max-h-[70vh] object-contain drop-shadow-2xl"
              />
            </div>

            {/* Info Side */}
            <div className="w-full md:w-80 bg-white p-6 md:p-8 flex flex-col border-l border-stone-100">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h3 className="font-bold text-xl text-stone-900 mb-1">{t('sticker_details')}</h3>
                  <span className="text-xs font-bold text-orange-600 bg-orange-50 px-2 py-1 rounded-full uppercase tracking-wide border border-orange-100">
                    {previewImage.styleName}
                  </span>
                </div>
                <button 
                  onClick={closePreview}
                  className="text-stone-400 hover:text-stone-800 transition-colors"
                >
                  <X size={24} />
                </button>
              </div>

              <div className="flex-grow space-y-4">
                <div>
                  <label className="text-xs font-bold text-stone-400 uppercase">Prompt</label>
                  <p className="text-stone-700 leading-relaxed text-sm font-medium">
                    {previewImage.prompt}
                  </p>
                </div>
                <div className="rounded-2xl border border-orange-100 bg-orange-50/60 p-3">
                  <div className="flex items-center gap-2 text-xs font-black text-orange-800 uppercase tracking-wide mb-2">
                    <BadgeCheck size={14} />
                    {assetCopy.assetReadiness}
                  </div>
                  <div className="flex flex-wrap gap-1.5 mb-2">
                    {getPreviewBadges(previewImage).map((badge) => (
                      <span key={badge} className="rounded-full bg-white px-2 py-1 text-[10px] font-bold text-orange-700 border border-orange-100">
                        {badge}
                      </span>
                    ))}
                  </div>
                  <p className="text-xs leading-relaxed text-orange-800">
                    {getPreviewAssetNote(previewImage)}
                  </p>
                </div>
                <div>
                  <label className="text-xs font-bold text-stone-400 uppercase">{t('created')}</label>
                  <p className="text-stone-700 text-sm font-mono">
                    {new Date(previewImage.createdAt).toLocaleString()}
                  </p>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <div className="rounded-xl bg-stone-50 border border-stone-100 p-2 text-center">
                    <FileImage size={15} className="mx-auto mb-1 text-stone-500" />
                    <p className="text-[10px] font-bold text-stone-500">PNG</p>
                  </div>
                  <div className="rounded-xl bg-stone-50 border border-stone-100 p-2 text-center">
                    <Layers3 size={15} className="mx-auto mb-1 text-stone-500" />
                    <p className="text-[10px] font-bold text-stone-500">ZIP</p>
                  </div>
                  <div className="rounded-xl bg-stone-50 border border-stone-100 p-2 text-center" title={assetCopy.apiTrust}>
                    <ShieldCheck size={15} className="mx-auto mb-1 text-stone-500" />
                    <p className="text-[10px] font-bold text-stone-500">BYOK</p>
                  </div>
                </div>
              </div>

              <div className="mt-8 pt-6 border-t border-stone-100 space-y-3">
                <a 
                  href={previewImage.dataUrl} 
                  download={`sticker-${previewImage.id}.png`}
                  className="flex items-center justify-center gap-2 w-full py-3 bg-orange-500 hover:bg-orange-600 text-white font-bold rounded-xl transition-colors shadow-lg shadow-orange-200"
                >
                  <Download size={20} />
                  {t('download_png')}
                </a>
                
                <button
                   onClick={() => handleDeleteImage(previewImage.id)}
                   className="flex items-center justify-center gap-2 w-full py-3 bg-stone-100 hover:bg-rose-50 text-stone-600 hover:text-rose-600 font-bold rounded-xl transition-colors"
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

const App: React.FC = () => <StickerCraftWorkspace />;

export default App;
