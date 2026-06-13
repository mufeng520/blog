import ApiKeyConfig from '../ApiKeyConfig';

type Props = {
  isOpen: boolean;
  onClose: () => void;
};

export default function HomeApiSettingsModal({ isOpen, onClose }: Props) {
  if (!isOpen) return null;

  return <ApiKeyConfig onConfigured={onClose} onClose={onClose} />;
}
