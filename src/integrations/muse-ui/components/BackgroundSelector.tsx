import React, { useRef } from 'react';
import { I18N } from '../constants';
import type { LangType, BackgroundConfig } from '../types';

interface Props {
  background: BackgroundConfig;
  onChange: (bg: BackgroundConfig) => void;
  lang: LangType;
}

const BackgroundSelector: React.FC<Props> = ({ background, onChange, lang }) => {
  const t = I18N[lang];
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          onChange({
            type: 'image',
            value: event.target.result as string
          });
        }
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="space-y-4">
      <label className="block text-sm font-medium text-stone-400 dark:text-stone-500">{t.appBackground}</label>
      
      <div className="flex gap-2">
        <button
          onClick={() => onChange({ type: 'color', value: '#FFFFFF' })}
          className={`flex-1 py-2 px-3 rounded-lg border text-xs font-medium transition-colors ${
            background.type === 'color' 
              ? 'bg-teal-500/10 border-teal-500 text-teal-600 dark:text-teal-200' 
              : 'bg-stone-100 dark:bg-stone-800 border-stone-300 dark:border-stone-700 text-stone-600 dark:text-stone-400 hover:bg-stone-200 dark:hover:bg-stone-700'
          }`}
        >
          {t.solidColor}
        </button>
        
        <button
          onClick={() => fileInputRef.current?.click()}
          className={`flex-1 py-2 px-3 rounded-lg border text-xs font-medium transition-colors ${
            background.type === 'image' 
              ? 'bg-teal-500/10 border-teal-500 text-teal-600 dark:text-teal-200' 
              : 'bg-stone-100 dark:bg-stone-800 border-stone-300 dark:border-stone-700 text-stone-600 dark:text-stone-400 hover:bg-stone-200 dark:hover:bg-stone-700'
          }`}
        >
          {t.bgImage}
        </button>
        <input 
          type="file" 
          ref={fileInputRef} 
          className="hidden" 
          accept="image/*" 
          onChange={handleImageUpload}
        />
      </div>

      {background.type === 'color' && (
        <div className="flex items-center gap-2 bg-stone-100 dark:bg-stone-800/50 p-2 rounded-lg border border-stone-300 dark:border-stone-700">
           {/* Color Picker Container to mask default appearance */}
           <div 
             className="w-8 h-8 rounded border border-stone-300 dark:border-stone-600 overflow-hidden relative cursor-pointer"
             style={{ backgroundColor: background.value }}
           >
              <input 
                  type="color" 
                  value={background.value.startsWith('#') ? background.value : '#ffffff'}
                  onChange={(e) => onChange({ ...background, value: e.target.value })}
                  className="opacity-0 absolute inset-0 w-full h-full cursor-pointer p-0 border-0"
               />
           </div>
           <input 
              type="text" 
              value={background.value}
              onChange={(e) => onChange({ ...background, value: e.target.value })}
              className="bg-transparent border-none text-stone-800 dark:text-stone-200 text-sm focus:ring-0 w-full uppercase font-mono"
              placeholder="#HEX"
           />
        </div>
      )}

      {background.type === 'image' && (
        <div className="relative w-full h-24 bg-stone-200 dark:bg-stone-800 rounded-lg overflow-hidden border border-stone-300 dark:border-stone-700 group">
           {background.value ? (
             <img src={background.value} alt="Background" className="w-full h-full object-cover" />
           ) : (
             <div className="flex items-center justify-center h-full text-stone-500 text-xs">{t.upload}</div>
           )}
           <button 
             onClick={() => fileInputRef.current?.click()}
             className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-xs"
           >
             {t.edit}
           </button>
        </div>
      )}
    </div>
  );
};

export default BackgroundSelector;
