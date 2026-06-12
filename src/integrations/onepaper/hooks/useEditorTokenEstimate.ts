import { useEffect, useState } from 'react';
import type { PageRequest } from '../types';

interface UseEditorTokenEstimateParams {
  description: string;
  pageName: string;
  keywords: string[];
  colorImage: File | null;
  referenceImages: string[];
  layoutImage: string | null;
  isBatchMode: boolean;
  batchOutputMode: 'separate' | 'grid';
  pages: PageRequest[];
}

export function useEditorTokenEstimate({
  description,
  pageName,
  keywords,
  colorImage,
  referenceImages,
  layoutImage,
  isBatchMode,
  batchOutputMode,
  pages,
}: UseEditorTokenEstimateParams) {
  const [estimatedTokens, setEstimatedTokens] = useState(0);

  useEffect(() => {
    let base = 500 + (description.length + pageName.length + keywords.join(' ').length) * 0.5;
    const imgTokens = ((colorImage ? 1 : 0) + referenceImages.length + (layoutImage ? 1 : 0)) * 258;
    base += imgTokens;

    if (isBatchMode) {
      setEstimatedTokens(
        Math.round(batchOutputMode === 'separate' ? base * Math.max(1, pages.length) : base + pages.length * 100),
      );
    } else {
      setEstimatedTokens(Math.round(base));
    }
  }, [
    batchOutputMode,
    colorImage,
    description,
    isBatchMode,
    keywords,
    layoutImage,
    pageName,
    pages,
    referenceImages,
  ]);

  return estimatedTokens;
}
