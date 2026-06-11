import React from 'react';
import { Routes, Route, useParams } from 'react-router-dom';
import MainApp from './components/MainApp';
import LivePreviewDemo from './components/LivePreviewDemo';

function EditorPage() {
  const { projectId } = useParams<{ projectId: string }>();
  return <MainApp projectId={projectId!} />;
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<MainApp />} />
      <Route path="/editor/:projectId" element={<EditorPage />} />
      <Route path="/live-preview" element={<LivePreviewDemo />} />
    </Routes>
  );
}
