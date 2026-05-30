// @ts-check
import { defineConfig } from 'astro/config';

import react from '@astrojs/react';

import vue from '@astrojs/vue';

import vercel from '@astrojs/vercel';

// https://astro.build/config
export default defineConfig({
  adapter: vercel(),
  integrations: [react(), vue()]
});
