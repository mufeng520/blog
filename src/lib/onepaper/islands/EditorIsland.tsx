import React from 'react';
import '../globals.css';
import { ToolRuntimeBoundary } from '../../../components/ToolRuntimeBoundary';
import MainApp from '../components/MainApp';

type Props = {
  projectId?: string;
  showBreadcrumb?: boolean;
};

export default function EditorIsland({ projectId, showBreadcrumb = true }: Props) {
  return (
    <ToolRuntimeBoundary toolName="OnePaper">
      <MainApp projectId={projectId} showBreadcrumb={showBreadcrumb} />
    </ToolRuntimeBoundary>
  );
}
