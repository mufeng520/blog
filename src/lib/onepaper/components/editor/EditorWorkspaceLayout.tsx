import React, { Suspense, lazy } from 'react';
import type { OnePaperAppActions, OnePaperAppState } from '../../hooks/useAppLogic';

const CanvasBoard = lazy(() => import('../CanvasBoard'));
const EditorSidebarPanel = lazy(() => import('./EditorSidebarPanel'));

type Props = {
  state: OnePaperAppState;
  actions: OnePaperAppActions;
};

export default function EditorWorkspaceLayout({
  state,
  actions,
}: Props) {
  return (
    <div className="flex-1 flex overflow-hidden">
      <Suspense fallback={<div className="w-[360px] shrink-0 border-r border-stone-200 bg-white dark:border-stone-800 dark:bg-stone-900" />}>
        <EditorSidebarPanel state={state} actions={actions} />
      </Suspense>
      <div id="main-canvas-area" className="flex-1 bg-stone-50 dark:bg-stone-950 relative flex flex-col min-w-0">
        <Suspense fallback={null}>
          <CanvasBoard
            artboards={state.artboards}
            groups={state.artboardGroups}
            onSelectArtboard={(id) => actions.handleOpenRegen(id)}
            onInspectArtboard={(image) => actions.setInspectImage(image)}
            onMoveArtboard={(id, x, y) => actions.setArtboards(prev => prev.map(ab => (ab.id === id ? { ...ab, x, y } : ab)))}
            onDeleteArtboard={(id) => actions.setArtboards(prev => prev.filter(ab => ab.id !== id))}
            onUploadImage={(file, x, y) => actions.handleCanvasDrop(file, x, y)}
            onAutoArrange={actions.handleAutoArrange}
            onRegenerateArtboard={(id) => actions.handleOpenRegen(id)}
            onUpdateArtboard={(id, updates) => actions.setArtboards(prev => prev.map(ab => (ab.id === id ? { ...ab, ...updates } : ab)))}
            lang={state.lang}
            regeneratingId={state.regeneratingId}
            devMode={state.devMode}
            onRequestConfirm={actions.requestConfirm}
            onDeleteHistoryItem={actions.handleDeleteHistoryItem}
            onCopyImage={actions.onCopyImage}
            scale={state.scale}
            setScale={actions.setScale}
            position={state.position}
            setPosition={actions.setPosition}
          />
        </Suspense>
      </div>
    </div>
  );
}
