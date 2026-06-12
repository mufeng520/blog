import { Sandpack } from '@codesandbox/sandpack-react';
import { monokaiPro } from '@codesandbox/sandpack-themes';

type Props = {
  code: string;
};

export default function SandpackPreviewSurface({ code }: Props) {
  return (
    <Sandpack
      template="react"
      theme={monokaiPro}
      files={{
        '/App.js': code,
      }}
      options={{
        showNavigator: false,
        showLineNumbers: true,
        showTabs: true,
        editorHeight: '80vh',
        externalResources: ['https://cdn.tailwindcss.com'],
      }}
      customSetup={{
        dependencies: {
          'lucide-react': 'latest',
        },
      }}
    />
  );
}
