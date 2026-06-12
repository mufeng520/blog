import React from 'react';
import MainApp from './components/MainApp';
import LivePreviewDemo from './components/LivePreviewDemo';
import HomePage from './components/HomePage';

export type OnePaperAppView = 'home' | 'editor' | 'live-preview';

type Props = {
  view?: OnePaperAppView;
  projectId?: string;
};

export default function App({ view = 'home', projectId }: Props) {
  if (view === 'editor') {
    return <MainApp projectId={projectId} />;
  }

  if (view === 'live-preview') {
    return <LivePreviewDemo />;
  }

  return <HomePage />;
}
