import React, { useState, useRef, useEffect } from 'react';
import { UI_STYLES, I18N } from '../constants';
import type { UIStyle, LangType } from '../types';

import IconLoader from './IconLoader';

interface Props {
  selectedStyle: UIStyle;
  onSelectStyle: (style: UIStyle) => void;
  customStyles: UIStyle[];
  onAddCustomStyle: (style: UIStyle) => void;
  lang: LangType;
}

const StyleSelector: React.FC<Props> = ({ selectedStyle, onSelectStyle, customStyles, onAddCustomStyle, lang }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isCreating, setIsCreating] = useState(false);

  // New Style Form State
  const [newStyleName, setNewStyleName] = useState('');
  const [newStyleDesc, setNewStyleDesc] = useState('');
  const [newStylePrompt, setNewStylePrompt] = useState('');

  const dropdownRef = useRef<HTMLDivElement>(null);

  // Merge built-in styles with custom styles
  const allStyles = [...customStyles, ...UI_STYLES];
  const categories = Array.from(new Set(allStyles.map(s => s.category)));
  const t = I18N[lang];

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setIsCreating(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (style: UIStyle) => {
    onSelectStyle(style);
    setIsOpen(false);
    setIsCreating(false);
  };

  const handleCreateStyle = () => {
    if (!newStyleName.trim() || !newStylePrompt.trim()) return;

    const newStyle: UIStyle = {
      id: `custom-${Date.now()}`,
      name: newStyleName,
      category: 'Custom',
      description: newStyleDesc || 'Custom user style',
      promptModifier: newStylePrompt
    };

    onAddCustomStyle(newStyle);
    onSelectStyle(newStyle);

    // Reset
    setNewStyleName('');
    setNewStyleDesc('');
    setNewStylePrompt('');
    setIsCreating(false);
    setIsOpen(false);
  };

  return (
    <div className="space-y-2 relative" ref={dropdownRef}>
      <label className="block text-sm font-medium text-stone-400 dark:text-stone-500">{t.designStyle}</label>

      {/* Trigger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-3 bg-stone-100 dark:bg-stone-800 border border-stone-300 dark:border-stone-700 rounded-lg text-stone-800 dark:text-stone-200 hover:border-stone-400 dark:hover:border-stone-600 focus:outline-none focus:ring-2 focus:ring-teal-500/50 transition-all"
      >
        <div className="flex flex-col items-start pr-8">
          <span className="font-medium text-sm text-teal-600 dark:text-teal-300">
            {lang === 'zh' && selectedStyle.name_zh ? selectedStyle.name_zh : selectedStyle.name}
          </span>
          <span className="text-[10px] text-stone-500 mt-1 text-left line-clamp-2 leading-tight">
            {lang === 'zh' && selectedStyle.description_zh ? selectedStyle.description_zh : selectedStyle.description}
          </span>
        </div>
        <div className={`transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}>
          <IconLoader name="chevron-down" size={16} className="text-stone-500" />
        </div>
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute z-50 w-full mt-1 bg-white dark:bg-stone-900 border border-stone-300 dark:border-stone-700 rounded-lg shadow-2xl max-h-[500px] overflow-hidden animate-in fade-in zoom-in-95 duration-100 origin-top flex flex-col">

          {isCreating ? (
            <div className="p-3 space-y-3 bg-stone-50 dark:bg-stone-900">
              <h4 className="text-xs font-bold text-stone-500 uppercase">{t.createStyle}</h4>

              <div>
                <label className="block text-[10px] text-stone-400 mb-1">{t.styleName}</label>
                <input
                  type="text"
                  value={newStyleName}
                  onChange={(e) => setNewStyleName(e.target.value)}
                  className="w-full text-sm p-2 rounded border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 text-stone-800 dark:text-stone-200"
                />
              </div>

              <div>
                <label className="block text-[10px] text-stone-400 mb-1">{t.styleDesc}</label>
                <input
                  type="text"
                  value={newStyleDesc}
                  onChange={(e) => setNewStyleDesc(e.target.value)}
                  className="w-full text-sm p-2 rounded border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 text-stone-800 dark:text-stone-200"
                />
              </div>

              <div>
                <label className="block text-[10px] text-stone-400 mb-1">{t.stylePrompt}</label>
                <textarea
                  value={newStylePrompt}
                  onChange={(e) => setNewStylePrompt(e.target.value)}
                  rows={2}
                  className="w-full text-sm p-2 rounded border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 text-stone-800 dark:text-stone-200"
                  placeholder="e.g. neon colors, glitch effects..."
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  onClick={() => setIsCreating(false)}
                  className="flex-1 py-1.5 text-xs text-stone-500 hover:text-stone-700 dark:hover:text-stone-300"
                >
                  {t.cancel}
                </button>
                <button
                  onClick={handleCreateStyle}
                  className="flex-1 py-1.5 text-xs bg-teal-600 text-white rounded hover:bg-teal-500"
                >
                  {t.addStyle}
                </button>
              </div>
            </div>
          ) : (
            <>
              <div className="flex-1 overflow-y-auto custom-scrollbar p-2 space-y-4">
                {categories.map(category => (
                  <div key={category}>
                    <h4 className="px-2 text-[10px] font-bold text-stone-400 uppercase tracking-widest mb-1 mt-1 border-b border-stone-100 dark:border-stone-800 pb-1">
                      {t.categories[category] || category}
                    </h4>
                    <div className="grid grid-cols-1 gap-1">
                      {allStyles.filter(s => s.category === category).map(style => (
                        <button
                          key={style.id}
                          onClick={() => handleSelect(style)}
                          className={`w-full text-left px-3 py-3 rounded-lg transition-all border flex items-start justify-between gap-3 group ${selectedStyle.id === style.id
                              ? 'bg-teal-50 dark:bg-teal-900/10 border-teal-200 dark:border-teal-800/50 shadow-sm'
                              : 'bg-transparent border-transparent hover:bg-stone-100 dark:hover:bg-stone-800'
                            }`}
                        >
                          <div className="flex flex-col gap-1">
                            <span className={`text-sm font-medium ${selectedStyle.id === style.id ? 'text-teal-700 dark:text-teal-400' : 'text-stone-700 dark:text-stone-300'}`}>
                              {lang === 'zh' && style.name_zh ? style.name_zh : style.name}
                            </span>
                            <span className="text-[10px] text-stone-500 leading-tight">
                              {lang === 'zh' && style.description_zh ? style.description_zh : style.description}
                            </span>
                          </div>
                          {selectedStyle.id === style.id && (
                            <IconLoader name="check" size={16} className="text-teal-500 mt-1" />
                          )}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              <div className="p-2 border-t border-stone-200 dark:border-stone-800 bg-stone-50 dark:bg-stone-900/50">
                <button
                  onClick={() => setIsCreating(true)}
                  className="w-full py-2 flex items-center justify-center gap-2 text-xs font-bold text-stone-500 hover:text-teal-500 transition-colors bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded"
                >
                  <IconLoader name="plus" size={12} /> {t.createStyle}
                </button>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default StyleSelector;
