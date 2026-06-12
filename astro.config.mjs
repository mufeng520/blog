// @ts-check
import { defineConfig } from 'astro/config';
import { loadEnv } from 'vite';

import react from '@astrojs/react';

import vercel from '@astrojs/vercel';

// https://astro.build/config
export default defineConfig({
  adapter: vercel(),
  integrations: [react()],
  vite: {
    plugins: [
      {
        name: 'mufeng-tool-env-compat',
        config(_config, { mode }) {
          const env = loadEnv(mode, '.', '');

          return {
            define: {
              'process.env.API_KEY': JSON.stringify(env.GEMINI_API_KEY),
              'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY),
              'process.env.OPENAI_API_KEY': JSON.stringify(env.OPENAI_API_KEY),
            },
          };
        },
      },
    ],
    optimizeDeps: {
      noDiscovery: true,
      include: [
        'react',
        'react-dom',
        'react-dom/client',
        'react/jsx-runtime',
        'react/jsx-dev-runtime',
        '@google/genai',
        'p-retry',
        'retry',
        'idb',
        'html2canvas',
        'jszip',
        'lucide-react',
        '@codesandbox/sandpack-react',
        '@codesandbox/sandpack-themes',
        'anser',
      ],
    },
    resolve: {
      dedupe: ['react', 'react-dom', 'react-dom/client', 'react/jsx-runtime', 'react/jsx-dev-runtime'],
    },
    ssr: {
      noExternal: ['@google/genai', 'p-retry', 'retry'],
    },
    cacheDir: '.astro/vite-deps',
  },
});
