import { Sandpack } from "@codesandbox/sandpack-react";
import { monokaiPro } from "@codesandbox/sandpack-themes";
import { toolRoutes } from '../../../lib/tool-routes';

export default function LivePreviewDemo() {
  const code = `import React from "react";

export default function App() {
  return (
    <div className="p-10 bg-gradient-to-r from-cyan-500 to-cyan-500 min-h-screen text-white flex flex-col items-center justify-center font-sans">
      <h1 className="text-6xl font-extrabold mb-6 drop-shadow-lg">
        Hello World!
      </h1>
      <p className="text-2xl mb-8 bg-white/20 px-6 py-3 rounded-full backdrop-blur-sm">
        This is running LIVE in your browser.
      </p>
      <button 
        className="bg-white text-cyan-600 px-8 py-4 rounded-xl font-bold text-xl hover:scale-105 transition-all shadow-xl"
        onClick={() => alert("It works!")}
      >
        Click Me (Interactive)
      </button>
      
      <div className="mt-12 text-sm opacity-80 max-w-lg text-center leading-relaxed">
        This is the "Magic" behind Lovable/v0. 
        It is just a browser-based bundler called Sandpack.
        We can inject any AI-generated code here.
      </div>
    </div>
  );
}`;

  return (
    <div className="min-h-screen bg-stone-900 flex flex-col">
      <div className="p-6 border-b border-stone-800 flex justify-between items-center">
        <div>
           <h1 className="text-2xl font-bold text-white mb-1">Live Preview Engine (Demo)</h1>
           <p className="text-stone-400 text-sm">Tech Stack: Sandpack + React (Client-side Bundling)</p>
        </div>
        <a href={toolRoutes.onePaper.home} className="px-4 py-2 bg-stone-800 hover:bg-stone-700 text-stone-300 rounded-lg text-sm transition-colors">
          Back to Home
        </a>
      </div>
      
      <div className="flex-1 p-6">
        <Sandpack
          template="react"
          theme={monokaiPro}
          files={{
            "/App.js": code,
          }}
          options={{
            showNavigator: false,
            showLineNumbers: true, 
            showTabs: true,
            editorHeight: "80vh", 
            externalResources: ["https://cdn.tailwindcss.com"]
          }}
          customSetup={{
            dependencies: {
              "lucide-react": "latest"
            }
          }}
        />
      </div>
    </div>
  );
}
