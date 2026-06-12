import type { LangType } from '../types';

export const HOME_LANG_EVENT = 'onepaper-home-lang-change';
export const HOME_PROJECT_COUNT_EVENT = 'onepaper-home-project-count-change';

export const emitHomeLangChange = (lang: LangType) => {
  if (typeof window === 'undefined') return;
  window.dispatchEvent(new CustomEvent<{ lang: LangType }>(HOME_LANG_EVENT, { detail: { lang } }));
};

export const emitHomeProjectCountChange = (count: number) => {
  if (typeof window === 'undefined') return;
  window.dispatchEvent(new CustomEvent<{ count: number }>(HOME_PROJECT_COUNT_EVENT, { detail: { count } }));
};

export const readHomeLang = (): LangType => {
  if (typeof localStorage === 'undefined') return 'zh';
  return (localStorage.getItem('onepaper-lang') as LangType) || 'zh';
};
