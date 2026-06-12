import React, { useEffect, useMemo, useState } from 'react';
import { CheckCircle2, ListFilter, Search, Star, X } from 'lucide-react';
import type { LangType } from '../../../types';

export interface SelectorOption {
  id: string;
  name: string;
  name_zh: string;
  description: string;
  description_zh: string;
  content?: string;
  category?: string;
}

interface Props {
  selectedId: string | null;
  onSelect: (id: string | null, content: string | null) => void;
  lang: LangType;
  options: SelectorOption[];
  label: string;
  label_zh: string;
  modalTitle?: string;
  modalTitle_zh?: string;
  modalSubtitle?: string;
  modalSubtitle_zh?: string;
  showPreview?: boolean;
  showFavorites?: boolean;
  showSearch?: boolean;
  showClear?: boolean;
  confirmOnSelect?: boolean;
  favoritesKey?: string;
}

const getFavorites = (key: string): string[] => {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
};

const setFavorites = (key: string, ids: string[]) => {
  localStorage.setItem(key, JSON.stringify(ids));
};

const toggleFavorite = (key: string, id: string): boolean => {
  const favs = getFavorites(key);
  if (favs.includes(id)) {
    setFavorites(key, favs.filter(f => f !== id));
    return false;
  }
  setFavorites(key, [id, ...favs]);
  return true;
};

const GenericOptionSelector: React.FC<Props> = ({
  selectedId,
  onSelect,
  lang,
  options,
  label,
  label_zh,
  modalTitle,
  modalTitle_zh,
  modalSubtitle,
  modalSubtitle_zh,
  showPreview = false,
  showFavorites = true,
  showSearch = true,
  showClear = true,
  confirmOnSelect = true,
  favoritesKey,
}) => {
  const isZh = lang === 'zh';
  const labelText = isZh ? label_zh : label;
  const selected = selectedId ? options.find(option => option.id === selectedId) ?? null : null;
  const storageKey = favoritesKey || `skill-option-${label}`;

  const [isOpen, setIsOpen] = useState(false);
  const [activeOption, setActiveOption] = useState<SelectorOption | null>(null);
  const [search, setSearch] = useState('');
  const [tab, setTab] = useState<'all' | 'favorites'>('all');
  const [favoriteIds, setFavoriteIds] = useState<string[]>(() => (showFavorites ? getFavorites(storageKey) : []));

  useEffect(() => {
    if (!isOpen) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const handleKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsOpen(false);
        setActiveOption(null);
      }
    };
    document.addEventListener('keydown', handleKey);

    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener('keydown', handleKey);
    };
  }, [isOpen]);

  const filteredOptions = useMemo(() => {
    let list = [...options];

    if (showFavorites && tab === 'favorites') {
      list = list.filter(option => favoriteIds.includes(option.id));
    }

    const q = search.trim().toLowerCase();
    if (showSearch && q) {
      list = list.filter(option =>
        option.id.toLowerCase().includes(q) ||
        option.name.toLowerCase().includes(q) ||
        option.name_zh.toLowerCase().includes(q) ||
        option.description.toLowerCase().includes(q) ||
        option.description_zh.toLowerCase().includes(q)
      );
    }

    return list.sort((a, b) => {
      if (showFavorites) {
        const favDiff = Number(favoriteIds.includes(b.id)) - Number(favoriteIds.includes(a.id));
        if (favDiff !== 0) return favDiff;
      }
      return (isZh ? a.name_zh : a.name).localeCompare(isZh ? b.name_zh : b.name);
    });
  }, [favoriteIds, isZh, options, search, showFavorites, showSearch, tab]);

  const closeModal = () => {
    setIsOpen(false);
    setActiveOption(null);
    setSearch('');
    setTab('all');
  };

  const handleConfirm = (option: SelectorOption) => {
    onSelect(option.id, option.content || null);
    closeModal();
  };

  const handleClear = () => {
    onSelect(null, null);
    closeModal();
  };

  const handleCardClick = (option: SelectorOption) => {
    if (confirmOnSelect) {
      handleConfirm(option);
      return;
    }
    setActiveOption(option);
  };

  const handleToggleFavorite = (event: React.SyntheticEvent, id: string) => {
    event.stopPropagation();
    if (!showFavorites) return;

    const isNowFavorite = toggleFavorite(storageKey, id);
    setFavoriteIds(getFavorites(storageKey));
    if (!isNowFavorite && tab === 'favorites' && activeOption?.id === id) {
      setActiveOption(null);
    }
  };

  return (
    <div className="space-y-2 relative">
      <label className="block text-sm font-medium text-stone-400 dark:text-stone-500">
        {labelText}
      </label>

      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="w-full flex items-center justify-between gap-3 p-3 bg-stone-100 dark:bg-stone-800 border border-stone-300 dark:border-stone-700 rounded-lg text-stone-800 dark:text-stone-200 hover:border-stone-400 dark:hover:border-stone-600 focus:outline-none focus:ring-2 focus:ring-teal-500/50 transition-all"
      >
        <div className="flex flex-col items-start min-w-0 text-left">
          <span className="text-sm font-medium truncate max-w-full">
            {selected ? (isZh ? selected.name_zh : selected.name) : (isZh ? '未选择' : 'None')}
          </span>
          {selected && (
            <span className="text-xs text-stone-500 dark:text-stone-400 mt-0.5 line-clamp-1">
              {isZh ? (selected.description_zh || selected.description) : selected.description}
            </span>
          )}
        </div>
        <ListFilter className="w-4 h-4 text-stone-400 shrink-0" aria-hidden="true" />
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-4">
          <button
            type="button"
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            aria-label={isZh ? '关闭选择器' : 'Close selector'}
            onClick={closeModal}
          />

          <div className={`relative z-10 ${showPreview ? 'w-[1040px]' : 'w-[720px]'} max-w-[97vw] max-h-[85vh] bg-white dark:bg-stone-900 rounded-2xl shadow-2xl flex flex-col overflow-hidden`}>
            <div className="flex items-start justify-between gap-4 px-5 py-4 border-b border-stone-200 dark:border-stone-800 shrink-0">
              <div className="min-w-0">
                <h2 className="text-base font-bold text-stone-900 dark:text-stone-100">
                  {isZh ? (modalTitle_zh || modalTitle || label_zh) : (modalTitle || label)}
                </h2>
                {(modalSubtitle || modalSubtitle_zh) && (
                  <p className="text-xs text-stone-500 dark:text-stone-400 mt-1">
                    {isZh ? (modalSubtitle_zh || modalSubtitle) : (modalSubtitle || modalSubtitle_zh)}
                  </p>
                )}
              </div>
              <div className="flex items-center gap-1.5 shrink-0">
                {showClear && selected && (
                  <button
                    type="button"
                    onClick={handleClear}
                    className="text-xs px-3 py-1.5 rounded-lg text-stone-500 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                  >
                    {isZh ? '清除' : 'Clear'}
                  </button>
                )}
                <button
                  type="button"
                  onClick={closeModal}
                  className="p-2 rounded-lg text-stone-400 hover:text-stone-600 dark:hover:text-stone-200 hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors"
                  aria-label={isZh ? '关闭' : 'Close'}
                >
                  <X className="w-5 h-5" aria-hidden="true" />
                </button>
              </div>
            </div>

            {(showSearch || showFavorites) && (
              <div className="px-5 py-3 border-b border-stone-200 dark:border-stone-800 flex flex-col sm:flex-row sm:items-center gap-3 bg-stone-50/50 dark:bg-stone-950/50 shrink-0">
                {showSearch && (
                  <div className="relative flex-1 min-w-0">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" aria-hidden="true" />
                    <input
                      type="text"
                      value={search}
                      onChange={event => setSearch(event.target.value)}
                      placeholder={isZh ? '搜索...' : 'Search...'}
                      className="w-full pl-9 pr-9 py-2 text-sm bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-lg text-stone-800 dark:text-stone-200 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-teal-500/40 focus:border-teal-400 transition-all"
                    />
                    {search && (
                      <button
                        type="button"
                        onClick={() => setSearch('')}
                        className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-stone-400 hover:text-stone-600 dark:hover:text-stone-200"
                        aria-label={isZh ? '清空搜索' : 'Clear search'}
                      >
                        <X className="w-3.5 h-3.5" aria-hidden="true" />
                      </button>
                    )}
                  </div>
                )}

                {showFavorites && (
                  <div className="flex items-center gap-1 bg-stone-100 dark:bg-stone-800 rounded-lg p-0.5 shrink-0">
                    <button
                      type="button"
                      onClick={() => setTab('all')}
                      className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                        tab === 'all'
                          ? 'bg-white dark:bg-stone-700 text-stone-800 dark:text-stone-200 shadow-sm'
                          : 'text-stone-500 dark:text-stone-400 hover:text-stone-700 dark:hover:text-stone-300'
                      }`}
                    >
                      {isZh ? '全部' : 'All'}
                    </button>
                    <button
                      type="button"
                      onClick={() => setTab('favorites')}
                      className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors flex items-center gap-1 ${
                        tab === 'favorites'
                          ? 'bg-white dark:bg-stone-700 text-stone-800 dark:text-stone-200 shadow-sm'
                          : 'text-stone-500 dark:text-stone-400 hover:text-stone-700 dark:hover:text-stone-300'
                      }`}
                    >
                      <Star className={`w-3.5 h-3.5 ${tab === 'favorites' ? 'fill-current' : ''}`} aria-hidden="true" />
                      {isZh ? '收藏' : 'Favorites'}
                      {favoriteIds.length > 0 && (
                        <span className="text-[10px] px-1 py-0.5 rounded-full bg-teal-100 dark:bg-teal-900/40 text-teal-600 dark:text-teal-400">
                          {favoriteIds.length}
                        </span>
                      )}
                    </button>
                  </div>
                )}
              </div>
            )}

            <div className={`flex-1 min-h-0 overflow-hidden ${showPreview ? 'flex' : ''}`}>
              <div className={`overflow-y-auto custom-scrollbar p-5 ${showPreview ? 'flex-1' : 'w-full h-full'}`}>
                {filteredOptions.length === 0 ? (
                  <div className="min-h-56 flex flex-col items-center justify-center text-stone-400 dark:text-stone-600">
                    <Search className="w-10 h-10 mb-3 opacity-50" aria-hidden="true" />
                    <p className="text-sm font-medium">{isZh ? '没有找到匹配项' : 'No matches found'}</p>
                    <p className="text-xs mt-1">{isZh ? '试试其他关键词' : 'Try a different keyword'}</p>
                  </div>
                ) : (
                  <div className={`grid gap-3 ${showPreview ? 'grid-cols-2 lg:grid-cols-3' : 'grid-cols-1 sm:grid-cols-2'}`}>
                    {filteredOptions.map(option => {
                      const isSelected = selectedId === option.id;
                      const isActive = activeOption?.id === option.id || isSelected;
                      const description = isZh ? (option.description_zh || option.description) : option.description;

                      return (
                        <div
                          key={option.id}
                          role="button"
                          tabIndex={0}
                          onClick={() => handleCardClick(option)}
                          onKeyDown={event => {
                            if (event.key === 'Enter' || event.key === ' ') {
                              event.preventDefault();
                              handleCardClick(option);
                            }
                          }}
                          className={`relative min-h-[92px] text-left p-4 rounded-xl border transition-all duration-200 group ${
                            isActive
                              ? 'border-teal-500 bg-teal-50 dark:bg-teal-900/20 shadow-md'
                              : 'border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800 hover:border-teal-300 dark:hover:border-teal-700 hover:shadow-md'
                          }`}
                        >
                          {showFavorites && (
                            <button
                              type="button"
                              onClick={event => handleToggleFavorite(event, option.id)}
                              onKeyDown={event => {
                                if (event.key === 'Enter' || event.key === ' ') {
                                  event.preventDefault();
                                  handleToggleFavorite(event, option.id);
                                }
                              }}
                              className="absolute top-3 right-3 p-1 rounded-full transition-colors z-10 hover:bg-stone-100 dark:hover:bg-stone-700"
                              title={favoriteIds.includes(option.id) ? (isZh ? '取消收藏' : 'Unfavorite') : (isZh ? '收藏' : 'Favorite')}
                            >
                              <Star
                                className={`w-4 h-4 transition-colors ${
                                  favoriteIds.includes(option.id)
                                    ? 'text-teal-400 fill-teal-400'
                                    : 'text-stone-300 dark:text-stone-600 group-hover:text-teal-300'
                                }`}
                                aria-hidden="true"
                              />
                            </button>
                          )}

                          {isActive && (
                            <CheckCircle2 className={`absolute top-3 ${showFavorites ? 'right-10' : 'right-3'} w-5 h-5 text-teal-500`} aria-hidden="true" />
                          )}

                          <h3 className={`text-sm font-semibold mb-1.5 ${showFavorites || isActive ? 'pr-14' : 'pr-0'} ${
                            isActive
                              ? 'text-teal-700 dark:text-teal-400'
                              : 'text-stone-800 dark:text-stone-200 group-hover:text-teal-600 dark:group-hover:text-teal-400'
                          }`}>
                            {isZh ? option.name_zh : option.name}
                          </h3>
                          {description && (
                            <p className="text-xs text-stone-500 dark:text-stone-400 line-clamp-2 leading-relaxed">
                              {description}
                            </p>
                          )}
                          {option.category && (
                            <div className="mt-3">
                              <span className="text-[10px] px-1.5 py-0.5 rounded bg-stone-100 dark:bg-stone-700 text-stone-500 dark:text-stone-400">
                                {option.category}
                              </span>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {showPreview && (
                <div className="w-[340px] border-l border-stone-200 dark:border-stone-800 bg-stone-50 dark:bg-stone-950 flex flex-col shrink-0">
                  <div className="px-4 py-3 border-b border-stone-200 dark:border-stone-800">
                    <span className="text-xs font-semibold text-stone-500 dark:text-stone-400 uppercase tracking-wider">
                      {isZh ? '内容预览' : 'Content Preview'}
                    </span>
                  </div>
                  <div className="flex-1 min-h-0 overflow-y-auto custom-scrollbar p-4">
                    {activeOption ? (
                      <div className="space-y-3">
                        <div>
                          <h4 className="text-sm font-bold text-stone-800 dark:text-stone-200 mb-1">
                            {isZh ? activeOption.name_zh : activeOption.name}
                          </h4>
                          <p className="text-xs text-stone-500 dark:text-stone-400">
                            {isZh ? (activeOption.description_zh || activeOption.description) : activeOption.description}
                          </p>
                        </div>
                        {activeOption.content && (
                          <pre className="text-[11px] text-stone-600 dark:text-stone-400 whitespace-pre-wrap font-mono leading-relaxed bg-white dark:bg-stone-900 rounded-lg p-3 border border-stone-200 dark:border-stone-800 max-h-[50vh] overflow-y-auto custom-scrollbar">
                            {activeOption.content.slice(0, 1200)}
                            {activeOption.content.length > 1200 ? '\n...' : ''}
                          </pre>
                        )}
                      </div>
                    ) : (
                      <div className="h-full min-h-56 flex flex-col items-center justify-center text-stone-400 dark:text-stone-600">
                        <ListFilter className="w-10 h-10 mb-2 opacity-50" aria-hidden="true" />
                        <span className="text-xs">
                          {isZh ? '点击左侧卡片预览内容' : 'Click a card to preview'}
                        </span>
                      </div>
                    )}
                  </div>
                  {activeOption && (
                    <div className="p-4 border-t border-stone-200 dark:border-stone-800">
                      <button
                        type="button"
                        onClick={() => handleConfirm(activeOption)}
                        className="w-full py-2.5 rounded-lg bg-teal-600 hover:bg-teal-500 text-white text-sm font-semibold transition-colors"
                      >
                        {isZh ? '使用此选项' : 'Use This Option'}
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GenericOptionSelector;
