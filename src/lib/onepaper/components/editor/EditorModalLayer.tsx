import React, { Suspense, lazy } from 'react';
import type { OnePaperAppActions, OnePaperAppState } from '../../hooks/useAppLogic';

const BatchConfirmationModal = lazy(() => import('../modals/BatchConfirmationModal'));
const ChangelogModal = lazy(() => import('../modals/ChangelogModal'));
const DevReviewModal = lazy(() => import('../modals/DevReviewModal'));
const ImageDetailsModal = lazy(() => import('../modals/ImageDetailsModal'));
const ProjectManagerModal = lazy(() => import('../modals/ProjectManagerModal'));
const RegenModal = lazy(() => import('../modals/RegenModal'));
const SpecReviewModal = lazy(() => import('../modals/SpecReviewModal'));

type Props = {
  state: OnePaperAppState;
  actions: OnePaperAppActions;
  isChangelogOpen: boolean;
  setIsChangelogOpen: (open: boolean) => void;
  targetImage: string | null;
};

export default function EditorModalLayer({
  state,
  actions,
  isChangelogOpen,
  setIsChangelogOpen,
  targetImage,
}: Props) {
  return (
    <Suspense fallback={null}>
      {state.specReviewImage && (
        <SpecReviewModal
          specReviewImage={state.specReviewImage}
          onClose={() => actions.setSpecReviewImage(null)}
          lang={state.lang}
          specFeedback={state.specFeedback}
          setSpecFeedback={actions.setSpecFeedback}
          onRefine={() => actions.startBatchGenerationFlow(state.specFeedback)}
          onConfirm={actions.continueBatchGeneration}
        />
      )}

      {state.regenState.isOpen && (
        <RegenModal
          isOpen={state.regenState.isOpen}
          onClose={() => actions.setRegenState(prev => ({ ...prev, isOpen: false }))}
          lang={state.lang}
          mode={state.regenState.mode}
          setMode={(mode) => actions.setRegenState(prev => ({ ...prev, mode }))}
          prompt={state.regenState.prompt}
          setPrompt={(prompt) => actions.setRegenState(prev => ({ ...prev, prompt }))}
          referenceImage={state.regenState.referenceImage}
          onReferenceUpload={(event) => {
            const file = event.target.files?.[0];
            if (file) {
              const reader = new FileReader();
              reader.onload = (readerEvent) => actions.setRegenState(prev => ({
                ...prev,
                referenceImage: readerEvent.target?.result as string,
              }));
              reader.readAsDataURL(file);
            }
          }}
          onRemoveReference={() => actions.setRegenState(prev => ({ ...prev, referenceImage: null }))}
          layoutImage={state.regenState.layoutImage}
          onOpenBuilder={() => {
            actions.setRegenState(prev => ({ ...prev, isOpen: false }));
            actions.onOpenPageBuilder(`REGEN_${state.regenState.artboardId || 'new'}`);
          }}
          onRemoveLayout={() => actions.setRegenState(prev => ({ ...prev, layoutImage: null }))}
          onConfirm={(mask) => {
            if (state.regenState.artboardId) {
              actions.handleRegenerateArtboard(
                state.regenState.artboardId,
                state.regenState.prompt,
                state.regenState.referenceImage,
                state.regenState.layoutImage,
                mask,
              );
            }
            actions.setRegenState(prev => ({ ...prev, isOpen: false }));
          }}
          targetImage={targetImage}
        />
      )}

      {state.batchConfirmation && (
        <BatchConfirmationModal
          batchConfirmation={state.batchConfirmation}
          setBatchConfirmation={actions.setBatchConfirmation}
          lang={state.lang}
        />
      )}
      {state.reviewData && <DevReviewModal reviewData={state.reviewData} onClose={() => actions.setReviewData(null)} />}
      {state.inspectImage && <ImageDetailsModal image={state.inspectImage} onClose={() => actions.setInspectImage(null)} lang={state.lang} />}

      {state.isProjectManagerOpen && (
        <ProjectManagerModal
          isOpen={state.isProjectManagerOpen}
          onClose={() => actions.setIsProjectManagerOpen(false)}
          projects={state.projects}
          onSaveProject={actions.handleSaveProject}
          onCreateBlankProject={actions.handleCreateBlankProject}
          onUpdateProjectName={actions.handleUpdateProjectName}
          onUpdateProjectContent={actions.handleUpdateProjectContent}
          onLoadProject={actions.handleLoadProject}
          onDeleteProject={actions.handleDeleteProject}
          currentProjectId={state.currentProjectId}
          lang={state.lang}
          onRequestConfirm={actions.requestConfirm}
        />
      )}

      {isChangelogOpen && (
        <ChangelogModal lang={state.lang} onClose={() => setIsChangelogOpen(false)} />
      )}
    </Suspense>
  );
}
