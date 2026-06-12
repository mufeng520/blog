import React from 'react';
import type { LangType } from '../../../types';

type Props = {
  lang: LangType;
};

const zh = {
  aria: '\u5f53\u524d\u4f4d\u7f6e',
  homeLabel: '\u8fd4\u56de\u9996\u9875',
  brand: '\u6728\u98ce',
  tools: '\u5de5\u5177\u7bb1',
  type: 'AI \u89c6\u89c9\u8bbe\u8ba1',
};

export default function EditorBreadcrumb({ lang }: Props) {
  return (
    <nav
      className="mufeng-tool-bar mufeng-tool-bar--inline"
      style={{ '--mufeng-tool-accent': '#0f766e' } as React.CSSProperties}
      aria-label={lang === 'zh' ? zh.aria : 'Current location'}
    >
      <a className="mufeng-tool-bar__home" href="/" aria-label={lang === 'zh' ? zh.homeLabel : 'Back to home'}>
        <img src="/favicon.ico" alt="" width="22" height="22" />
        <span>{zh.brand}</span>
      </a>
      <span className="mufeng-tool-bar__sep">.</span>
      <a className="mufeng-tool-bar__crumb" href="/tools/">
        {lang === 'zh' ? zh.tools : 'Tools'}
      </a>
      <span className="mufeng-tool-bar__sep">/</span>
      <span className="mufeng-tool-bar__title" aria-current="page">OnePaper</span>
      <span className="mufeng-tool-bar__type">{lang === 'zh' ? zh.type : 'AI visual design'}</span>
    </nav>
  );
}
