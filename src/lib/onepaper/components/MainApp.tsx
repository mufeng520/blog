

import React, { Suspense, lazy } from 'react';

import { useEditorRuntime } from '../hooks/useEditorRuntime';

const EditorChromeLayer = lazy(() => import('./editor/EditorChromeLayer'));
const EditorFeedbackLayer = lazy(() => import('./editor/EditorFeedbackLayer'));
const EditorOverlayLayer = lazy(() => import('./editor/EditorOverlayLayer'));
const EditorWorkspaceLayout = lazy(() => import('./editor/EditorWorkspaceLayout'));
const EditorBuilderLayer = lazy(() => import('./editor/EditorBuilderLayer'));
const EditorGalleryLayer = lazy(() => import('./editor/EditorGalleryLayer'));
const EditorModalLayer = lazy(() => import('./editor/EditorModalLayer'));

interface Props {
    projectId?: string;
    showBreadcrumb?: boolean;
}

const HeaderFallback = () => (
    <div className="h-14 shrink-0 border-b border-stone-200 bg-white dark:border-stone-800 dark:bg-stone-900" />
);

const WorkspaceFallback = () => (
    <div className="flex-1 flex overflow-hidden">
        <div className="w-[360px] shrink-0 border-r border-stone-200 bg-white dark:border-stone-800 dark:bg-stone-900" />
        <div className="flex-1 bg-stone-50 dark:bg-stone-950" />
    </div>
);

const MainApp: React.FC<Props> = ({ projectId, showBreadcrumb = true }) => {
    const runtime = useEditorRuntime(projectId);
    const {
        state,
        actions,
        isChangelogOpen,
        setIsChangelogOpen,
        showFirstUseTips,
        closeFirstUseTips,
        targetImage,
    } = runtime;
    const shouldRenderModalLayer = Boolean(
        state.specReviewImage ||
        state.regenState.isOpen ||
        state.batchConfirmation ||
        state.reviewData ||
        state.inspectImage ||
        state.isProjectManagerOpen ||
        isChangelogOpen,
    );

    return (
        <div className={`w-full h-screen flex flex-col overflow-hidden ${state.theme}`}>
            <Suspense fallback={<HeaderFallback />}>
                <EditorChromeLayer state={state} actions={actions} showBreadcrumb={showBreadcrumb} />
            </Suspense>

            <Suspense fallback={<WorkspaceFallback />}>
                <EditorWorkspaceLayout
                    state={state}
                    actions={actions}
                />
            </Suspense>

            <Suspense fallback={null}>
                <EditorFeedbackLayer state={state} actions={actions} />
            </Suspense>
            <Suspense fallback={null}>
                {state.isGalleryOpen && <EditorGalleryLayer state={state} actions={actions} />}
                {state.isBuilderOpen && <EditorBuilderLayer state={state} actions={actions} />}

                {shouldRenderModalLayer && (
                    <EditorModalLayer
                        state={state}
                        actions={actions}
                        isChangelogOpen={isChangelogOpen}
                        setIsChangelogOpen={setIsChangelogOpen}
                        targetImage={targetImage}
                    />
                )}
            </Suspense>

            <Suspense fallback={null}>
                <EditorOverlayLayer
                    lang={state.lang}
                    showFirstUseTips={showFirstUseTips}
                    isLoadingProject={state.isLoadingProject}
                    onCloseFirstUseTips={closeFirstUseTips}
                />
            </Suspense>
        </div>
    );
};

export default MainApp;
