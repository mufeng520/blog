import React from 'react';
import ApiKeyConfig from '../ApiKeyConfig';
import IconLoader from '../IconLoader';

type Props = {
  isOpen: boolean;
  onClose: () => void;
};

export default function HomeApiSettingsModal({ isOpen, onClose }: Props) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-stone-900 rounded-2xl shadow-2xl relative">
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 text-stone-400 hover:text-white"
          aria-label="Close API settings"
        >
          <IconLoader name="x" size={20} />
        </button>
        <ApiKeyConfig onConfigured={onClose} />
      </div>
    </div>
  );
}
