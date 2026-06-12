import React, { useEffect, useState } from 'react';
import { Eye, EyeOff, KeyRound, RotateCcw, Settings2, X } from 'lucide-react';
import { useLanguage } from '../../../stickercraft/contexts/LanguageContext';
import {
  getActiveProviderSettings,
  getProviderDefaultEndpoint,
  getProviderDefaultImageModel,
  getProviderDefaultTextModel,
  getProviderImageModels,
  getProviderLabel,
  getProviderTextModels,
  isProviderConfigured,
  loadAPISettings,
  resetAPISettings,
  saveAPISettings,
} from '../../../stickercraft/services/apiConfig';
import { APIProvider } from '../../../stickercraft/types';
import type { APISettings, ProviderAPISettings } from '../../../stickercraft/types';

const StickerApiSettingsButton: React.FC = () => {
  const { language } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const [settings, setSettings] = useState<APISettings>(() => loadAPISettings());
  const [draft, setDraft] = useState<APISettings>(() => loadAPISettings());
  const [isApiKeyVisible, setIsApiKeyVisible] = useState(false);

  useEffect(() => {
    const handleSettingsUpdated = () => {
      const next = loadAPISettings();
      setSettings(next);
      setDraft(next);
    };

    window.addEventListener('stickerCraft:api-settings-updated', handleSettingsUpdated);
    return () => window.removeEventListener('stickerCraft:api-settings-updated', handleSettingsUpdated);
  }, []);

  const copy = language === 'zh'
    ? {
        button: '贴纸 API',
        configured: '已配置',
        missing: '未配置',
        title: '贴纸生成 API',
        provider: '当前 API',
        gemini: 'Gemini',
        gpt: 'GPT / OpenAI',
        apiKey: 'API Key',
        endpoint: 'Endpoint',
        imageModel: '图片模型',
        textModel: '文本模型',
        apiKeyPlaceholder: '输入当前 API 的 Key',
        save: '保存',
        reset: '恢复默认',
        showApiKey: '显示 API Key',
        hideApiKey: '隐藏 API Key',
      }
    : {
        button: 'Sticker API',
        configured: 'Configured',
        missing: 'Missing',
        title: 'Sticker Generation API',
        provider: 'Active API',
        gemini: 'Gemini',
        gpt: 'GPT / OpenAI',
        apiKey: 'API Key',
        endpoint: 'Endpoint',
        imageModel: 'Image model',
        textModel: 'Text model',
        apiKeyPlaceholder: 'Enter the selected API key',
        save: 'Save',
        reset: 'Reset defaults',
        showApiKey: 'Show API Key',
        hideApiKey: 'Hide API Key',
      };

  const activeSettings = getActiveProviderSettings(settings);
  const activeDraft = draft[draft.activeProvider];
  const activeProviderConfigured = isProviderConfigured(activeSettings);
  const activeProviderLabel = getProviderLabel(draft.activeProvider);
  const activeImageModels = getProviderImageModels(draft.activeProvider);
  const activeTextModels = getProviderTextModels(draft.activeProvider);

  const updateProviderDraft = (
    provider: APIProvider,
    nextProviderSettings: Partial<ProviderAPISettings>,
  ) => {
    setDraft((prev) => ({
      ...prev,
      [provider]: {
        ...prev[provider],
        ...nextProviderSettings,
      },
    }));
  };

  const openSettings = () => {
    const next = loadAPISettings();
    setSettings(next);
    setDraft(next);
    setIsApiKeyVisible(false);
    setIsOpen(true);
  };

  const handleSave = () => {
    saveAPISettings(draft);
    setSettings(loadAPISettings());
    setIsOpen(false);
  };

  const handleReset = () => {
    const defaults = resetAPISettings();
    setSettings(defaults);
    setDraft(defaults);
  };

  return (
    <>
      <button
        type="button"
        onClick={openSettings}
        className={`flex w-full items-center justify-between gap-3 rounded-xl border px-3 py-2.5 text-left text-xs font-black transition-colors ${
          activeProviderConfigured
            ? 'border-emerald-100 bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
            : 'border-amber-100 bg-amber-50 text-amber-700 hover:bg-amber-100'
        }`}
      >
        <span className="inline-flex items-center gap-2">
          <KeyRound size={15} />
          {copy.button}
        </span>
        <span>{activeProviderConfigured ? copy.configured : copy.missing}</span>
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-[90] flex items-center justify-center bg-stone-900/35 px-4 py-6 backdrop-blur-sm" onMouseDown={() => setIsOpen(false)}>
          <div
            className="flex max-h-[calc(100vh-3rem)] w-full max-w-lg flex-col overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-2xl"
            onMouseDown={(event) => event.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-stone-100 p-5">
              <div className="flex items-center gap-3">
                <span className="rounded-xl bg-orange-50 p-2 text-orange-600">
                  <Settings2 size={18} />
                </span>
                <div>
                  <h2 className="text-sm font-black text-stone-900">{copy.title}</h2>
                  <p className="text-xs font-semibold text-stone-400">{activeProviderLabel}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="rounded-full p-2 text-stone-400 hover:bg-stone-100 hover:text-stone-700"
              >
                <X size={18} />
              </button>
            </div>

            <div className="space-y-4 overflow-y-auto p-5">
              <div className="space-y-2">
                <span className="text-xs font-bold uppercase tracking-wide text-stone-500">{copy.provider}</span>
                <div className="grid grid-cols-2 gap-2 rounded-xl bg-stone-100 p-1">
                  {[APIProvider.GEMINI, APIProvider.GPT].map((provider) => (
                    <button
                      key={provider}
                      type="button"
                      onClick={() => setDraft((prev) => ({ ...prev, activeProvider: provider }))}
                      className={`rounded-lg px-3 py-2 text-xs font-black transition-colors ${
                        draft.activeProvider === provider
                          ? 'bg-white text-orange-700 shadow-sm'
                          : 'text-stone-500 hover:text-stone-800'
                      }`}
                    >
                      {provider === APIProvider.GPT ? copy.gpt : copy.gemini}
                    </button>
                  ))}
                </div>
              </div>

              <label className="block space-y-1.5">
                <span className="text-xs font-bold uppercase tracking-wide text-stone-500">
                  {activeProviderLabel} {copy.apiKey}
                </span>
                <div className="relative">
                  <input
                    type={isApiKeyVisible ? 'text' : 'password'}
                    value={activeDraft.apiKey}
                    onChange={(event) => updateProviderDraft(draft.activeProvider, { apiKey: event.target.value })}
                    placeholder={copy.apiKeyPlaceholder}
                    className="w-full rounded-xl border-2 border-stone-200 bg-stone-50 p-3 pr-12 text-sm font-bold text-stone-800 outline-none focus:border-orange-400 focus:bg-white"
                  />
                  <button
                    type="button"
                    onClick={() => setIsApiKeyVisible((prev) => !prev)}
                    className="absolute right-2 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-lg text-stone-400 hover:bg-orange-50 hover:text-orange-600"
                    aria-label={isApiKeyVisible ? copy.hideApiKey : copy.showApiKey}
                    title={isApiKeyVisible ? copy.hideApiKey : copy.showApiKey}
                  >
                    {isApiKeyVisible ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </label>

              <label className="block space-y-1.5">
                <span className="text-xs font-bold uppercase tracking-wide text-stone-500">{copy.endpoint}</span>
                <input
                  type="url"
                  value={activeDraft.endpoint}
                  onChange={(event) => updateProviderDraft(draft.activeProvider, { endpoint: event.target.value })}
                  placeholder={getProviderDefaultEndpoint(draft.activeProvider)}
                  className="w-full rounded-xl border-2 border-stone-200 bg-stone-50 p-3 text-sm font-bold text-stone-800 outline-none focus:border-orange-400 focus:bg-white"
                />
              </label>

              <label className="block space-y-1.5">
                <span className="text-xs font-bold uppercase tracking-wide text-stone-500">{copy.imageModel}</span>
                <input
                  type="text"
                  value={activeDraft.imageModel}
                  onChange={(event) => updateProviderDraft(draft.activeProvider, { imageModel: event.target.value })}
                  placeholder={getProviderDefaultImageModel(draft.activeProvider)}
                  list="sticker-api-image-models"
                  className="w-full rounded-xl border-2 border-stone-200 bg-stone-50 p-3 text-sm font-bold text-stone-800 outline-none focus:border-orange-400 focus:bg-white"
                />
                <datalist id="sticker-api-image-models">
                  {activeImageModels.map((model) => (
                    <option key={model.value} value={model.value}>{model.label}</option>
                  ))}
                </datalist>
              </label>

              <label className="block space-y-1.5">
                <span className="text-xs font-bold uppercase tracking-wide text-stone-500">{copy.textModel}</span>
                <input
                  type="text"
                  value={activeDraft.textModel}
                  onChange={(event) => updateProviderDraft(draft.activeProvider, { textModel: event.target.value })}
                  placeholder={getProviderDefaultTextModel(draft.activeProvider)}
                  list="sticker-api-text-models"
                  className="w-full rounded-xl border-2 border-stone-200 bg-stone-50 p-3 text-sm font-bold text-stone-800 outline-none focus:border-orange-400 focus:bg-white"
                />
                <datalist id="sticker-api-text-models">
                  {activeTextModels.map((model) => (
                    <option key={model.value} value={model.value}>{model.label}</option>
                  ))}
                </datalist>
              </label>
            </div>

            <div className="flex flex-col gap-2 border-t border-stone-100 bg-stone-50 p-5 sm:flex-row sm:justify-between">
              <button
                type="button"
                onClick={handleReset}
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-stone-200 bg-white px-4 py-2.5 text-xs font-bold text-stone-600 hover:text-stone-900"
              >
                <RotateCcw size={14} />
                {copy.reset}
              </button>
              <button
                type="button"
                onClick={handleSave}
                className="rounded-xl bg-orange-500 px-5 py-2.5 text-xs font-black text-white shadow-lg shadow-orange-200 hover:bg-orange-600"
              >
                {copy.save}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default StickerApiSettingsButton;
