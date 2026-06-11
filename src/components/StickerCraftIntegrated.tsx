import React, { useEffect, useState } from 'react';
import { ToolLoading, ToolRuntimeBoundary } from './ToolRuntimeBoundary';

type ToolComponent = React.ComponentType;

function AsyncRuntimeError({ error }: { error: Error }) {
  throw error;
}

export default function StickerCraftIntegrated() {
  const [mounted, setMounted] = useState(false);
  const [StickerCraftRuntime, setStickerCraftRuntime] = useState<ToolComponent | null>(null);
  const [loadError, setLoadError] = useState<Error | null>(null);

  useEffect(() => {
    let isActive = true;

    setMounted(true);
    Promise.all([
      import('../integrations/stickercraft/App'),
      import('../integrations/stickercraft/contexts/LanguageContext'),
    ])
      .then(([appModule, languageModule]) => {
        if (!isActive) return;

        const StickerCraftApp = appModule.default;
        const { LanguageProvider } = languageModule;
        const Runtime = () => (
          <LanguageProvider>
            <StickerCraftApp />
          </LanguageProvider>
        );

        setStickerCraftRuntime(() => Runtime);
      })
      .catch((error: unknown) => {
        if (isActive) {
          setLoadError(error instanceof Error ? error : new Error(String(error)));
        }
      });

    return () => {
      isActive = false;
    };
  }, []);

  if (loadError) {
    return (
      <ToolRuntimeBoundary toolName="StickerCraft AI">
        <AsyncRuntimeError error={loadError} />
      </ToolRuntimeBoundary>
    );
  }

  if (!mounted || !StickerCraftRuntime) {
    return <ToolLoading toolName="StickerCraft AI" />;
  }

  return (
    <ToolRuntimeBoundary toolName="StickerCraft AI">
      <StickerCraftRuntime />
    </ToolRuntimeBoundary>
  );
}
