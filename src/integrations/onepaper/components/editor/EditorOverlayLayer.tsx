import React from 'react';

type Props = {
  lang: 'zh' | 'en';
  showFirstUseTips: boolean;
  isLoadingProject: boolean;
  onCloseFirstUseTips: () => void;
};

const COPY = {
  zh: {
    tipsTitle: '\u4f7f\u7528\u5c0f\u8d34\u58eb',
    tipsIntro: '\u5f00\u59cb\u751f\u6210\u524d\uff0c\u5148\u786e\u8ba4\u4e0b\u9762\u8fd9\u51e0\u4ef6\u4e8b\u3002',
    freeTip: '\u672c\u5de5\u5177\u5b8c\u5168\u514d\u8d39\u3002',
    apiTip: '\u9700\u8981\u5728\u53f3\u4e0a\u89d2\u914d\u7f6e\u751f\u56fe API \u4e4b\u540e\uff0c\u624d\u80fd\u591f\u6b63\u5e38\u4f7f\u7528\u3002',
    gotIt: '\u77e5\u9053\u4e86',
    loadingProject: '\u6b63\u5728\u52a0\u8f7d\u9879\u76ee...',
  },
  en: {
    tipsTitle: 'Quick Tips',
    tipsIntro: 'Before generating, please note these basics.',
    freeTip: 'This tool is completely free.',
    apiTip: 'You need to configure an image-generation API in the top-right corner before normal use.',
    gotIt: 'Got it',
    loadingProject: 'Loading Project...',
  },
} as const;

export default function EditorOverlayLayer({
  lang,
  showFirstUseTips,
  isLoadingProject,
  onCloseFirstUseTips,
}: Props) {
  const copy = COPY[lang];

  return (
    <>
      {showFirstUseTips && (
        <div className="fixed inset-0 z-[320] bg-black/50 backdrop-blur-sm flex items-center justify-center p-4" onMouseDown={onCloseFirstUseTips}>
          <div
            className="w-full max-w-md rounded-2xl border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-900 shadow-2xl p-6"
            role="dialog"
            aria-modal="true"
            aria-labelledby="first-use-tips-title"
            onMouseDown={(event) => event.stopPropagation()}
          >
            <div className="flex items-start gap-3 mb-5">
              <div className="w-10 h-10 rounded-xl bg-teal-100 dark:bg-teal-900/40 text-teal-600 dark:text-teal-300 flex items-center justify-center shrink-0">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 2v4" />
                  <path d="M12 18v4" />
                  <path d="m4.93 4.93 2.83 2.83" />
                  <path d="m16.24 16.24 2.83 2.83" />
                  <path d="M2 12h4" />
                  <path d="M18 12h4" />
                  <path d="m4.93 19.07 2.83-2.83" />
                  <path d="m16.24 7.76 2.83-2.83" />
                </svg>
              </div>
              <div>
                <h2 id="first-use-tips-title" className="text-base font-bold text-stone-900 dark:text-white">
                  {copy.tipsTitle}
                </h2>
                <p className="text-xs text-stone-500 dark:text-stone-400 mt-1 leading-relaxed">
                  {copy.tipsIntro}
                </p>
              </div>
            </div>

            <div className="space-y-3">
              {[copy.freeTip, copy.apiTip].map((tip, index) => (
                <div key={tip} className="flex items-start gap-3 rounded-xl border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-800/60 p-3">
                  <span className="w-5 h-5 rounded-full bg-teal-500 text-white text-[11px] font-bold flex items-center justify-center shrink-0 mt-0.5">
                    {index + 1}
                  </span>
                  <p className="text-sm text-stone-700 dark:text-stone-200 leading-relaxed">{tip}</p>
                </div>
              ))}
            </div>

            <div className="mt-6 flex justify-end">
              <button
                type="button"
                onClick={onCloseFirstUseTips}
                className="px-5 py-2 rounded-lg bg-teal-600 hover:bg-teal-500 text-white text-sm font-medium transition-colors"
              >
                {copy.gotIt}
              </button>
            </div>
          </div>
        </div>
      )}

      {isLoadingProject && (
        <div className="fixed inset-0 z-[200] bg-black/50 backdrop-blur-sm flex items-center justify-center flex-col gap-4 text-white">
          <svg className="animate-spin -ml-1 mr-3 h-12 w-12 text-teal-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <span className="font-bold text-lg">{copy.loadingProject}</span>
        </div>
      )}
    </>
  );
}
