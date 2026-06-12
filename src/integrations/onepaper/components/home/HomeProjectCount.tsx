import React from 'react';
import type { LangType } from '../../types';
import { getHomeCopy } from './homeCopy';

type Props = {
  lang: LangType;
  count: number;
};

export default function HomeProjectCount({ lang, count }: Props) {
  const copy = getHomeCopy(lang);

  return (
    <p className="text-stone-500 dark:text-stone-400 text-sm">
      {copy.projectMeta(count)}
    </p>
  );
}
