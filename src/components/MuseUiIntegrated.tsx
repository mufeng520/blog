import React, { useEffect, useState } from 'react';
import { BrowserRouter } from 'react-router-dom';
import '../integrations/muse-ui/globals.css';
import { ToolLoading, ToolRuntimeBoundary } from './ToolRuntimeBoundary';

type ToolComponent = React.ComponentType;

function AsyncRuntimeError({ error }: { error: Error }) {
  throw error;
}

export default function MuseUiIntegrated() {
  const [mounted, setMounted] = useState(false);
  const [MuseUiApp, setMuseUiApp] = useState<ToolComponent | null>(null);
  const [loadError, setLoadError] = useState<Error | null>(null);

  useEffect(() => {
    let isActive = true;

    setMounted(true);
    import('../integrations/muse-ui/App')
      .then((module) => {
        if (isActive) {
          setMuseUiApp(() => module.default);
        }
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
      <ToolRuntimeBoundary toolName="MuseUI">
        <AsyncRuntimeError error={loadError} />
      </ToolRuntimeBoundary>
    );
  }

  if (!mounted || !MuseUiApp) {
    return <ToolLoading toolName="MuseUI" />;
  }

  return (
    <ToolRuntimeBoundary toolName="MuseUI">
      <BrowserRouter basename="/tools/muse-ui">
        <MuseUiApp />
      </BrowserRouter>
    </ToolRuntimeBoundary>
  );
}
