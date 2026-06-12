import React from 'react';
import { ConfirmationDialog, ToastContainer } from '../Toast';
import type { OnePaperAppActions, OnePaperAppState } from '../../hooks/useAppLogic';

type Props = {
  state: OnePaperAppState;
  actions: OnePaperAppActions;
};

export default function EditorFeedbackLayer({ state, actions }: Props) {
  return (
    <>
      <ToastContainer notifications={state.notifications} onClose={actions.removeNotification} />
      <ConfirmationDialog
        isOpen={!!state.confirmDialog}
        title={state.confirmDialog?.title || ''}
        message={state.confirmDialog?.message || ''}
        onConfirm={() => {
          const callback = state.confirmDialog?.onConfirm;
          actions.closeConfirm();
          if (callback) callback();
        }}
        onCancel={actions.closeConfirm}
        lang={state.lang}
      />
    </>
  );
}
