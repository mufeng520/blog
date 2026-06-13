import React, { Suspense, lazy, useState } from 'react';
import type { OnePaperAppActions, OnePaperAppState } from '../../hooks/useAppLogic';
import IconLoader from '../IconLoader';

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
  const [mobilePane, setMobilePane] = useState<'settings' | 'canvas'>('settings');

  return (
    <div className="flex-1 flex flex-col md:flex-row overflow-hidden min-h-0">
      <div className="md:hidden shrink-0 border-b border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 px-3 py-2">
        <div className="grid grid-cols-2 gap-2 rounded-xl bg-stone-100 dark:bg-stone-800 p-1">
          <button
            type="button"
            onClick={() => setMobilePane('settings')}
            className={`min-h-10 rounded-lg text-sm font-bold flex items-center justify-center gap-2 transition-colors ${
              mobilePane === 'settings'
                ? 'bg-white dark:bg-stone-700 text-teal-700 dark:text-teal-300 shadow-sm'
                : 'text-stone-500 dark:text-stone-400'
            }`}
          >
            <IconLoader name="settings" size={16} />
            {state.lang === 'zh' ? '参数' : 'Settings'}
          </button>
          <button
            type="button"
            onClick={() => setMobilePane('canvas')}
            className={`min-h-10 rounded-lg text-sm font-bold flex items-center justify-center gap-2 transition-colors ${
              mobilePane === 'canvas'
                ? 'bg-white dark:bg-stone-700 text-teal-700 dark:text-teal-300 shadow-sm'
                : 'text-stone-500 dark:text-stone-400'
            }`}
          >
            <IconLoader name="palette" size={16} />
            {state.lang === 'zh' ? '画布' : 'Canvas'}
          </button>
        </div>
      </div>

      <div className={`${mobilePane === 'settings' ? 'flex' : 'hidden'} md:flex flex-1 md:flex-none md:w-[360px] min-h-0`}>
        <Suspense fallback={<div className="w-full md:w-[360px] h-full shrink-0 border-r border-stone-200 bg-white dark:border-stone-800 dark:bg-stone-900" />}>
          <EditorSidebarPanel state={state} actions={actions} />
        </Suspense>
      </div>

      <div id="main-canvas-area" className={`${mobilePane === 'canvas' ? 'flex' : 'hidden'} md:flex flex-1 bg-stone-50 dark:bg-stone-950 relative flex-col min-w-0 min-h-0`}>
        <Suspense fallback={null}>
          <CanvasBoard
            artboards={state.artboards}
            groups={state.artboardGroups}
            onSelectArtboard={(id) => actions.handleOpenRegen(id)}
            onInspectArtboard={(image) => actions.setInspectImage(image)}
            onMoveArtboard={(id, x, y) => actions.setArtboards(prev => prev.map(ab => (ab.id === id ? { ...ab, x, y } : ab)))}
            onMoveGroup={(id, dx, dy) => {
              actions.setArtboardGroups(prev => prev.map(group => (group.id === id ? { ...group, x: group.x + dx, y: group.y + dy } : group)));
              actions.setArtboards(prev => prev.map(ab => (ab.groupId === id ? { ...ab, x: ab.x + dx, y: ab.y + dy } : ab)));
            }}
            onDeleteArtboard={(id) => {
              actions.setArtboards(prev => {
                const target = prev.find(ab => ab.id === id);
                const next = prev.filter(ab => ab.id !== id);
                if (target?.groupId && !next.some(ab => ab.groupId === target.groupId)) {
                  actions.setArtboardGroups(groups => groups.filter(group => group.id !== target.groupId));
                }
                return next;
              });
            }}
            onDeleteGroup={(id) => {
              actions.setArtboards(prev => prev.filter(ab => ab.groupId !== id));
              actions.setArtboardGroups(prev => prev.filter(group => group.id !== id));
            }}
            onUploadImage={(file, x, y) => actions.handleCanvasDrop(file, x, y)}
            onAddImagesToCanvas={actions.handleAddGeneratedImagesToCanvas}
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
