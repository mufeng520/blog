import React from 'react';
import '../integrations/onepaper/globals.css';
import OnePaperApp from '../integrations/onepaper/App';
import type { OnePaperAppView } from '../integrations/onepaper/App';
import { ToolRuntimeBoundary } from './ToolRuntimeBoundary';

type Props = {
  view?: OnePaperAppView;
  projectId?: string;
};

export default function OnePaperIsland({ view = 'home', projectId }: Props) {
  return (
    <ToolRuntimeBoundary toolName="OnePaper">
      <OnePaperApp view={view} projectId={projectId} />
    </ToolRuntimeBoundary>
  );
}
