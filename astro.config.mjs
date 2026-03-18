// @ts-check
import { defineConfig } from 'astro/config';

import react from '@astrojs/react';
import tailwindcss from '@tailwindcss/vite';
import vercel from '@astrojs/vercel';
import sitemap from '@astrojs/sitemap';

// https://astro.build/config
export default defineConfig({
  site: 'https://homecleaningco.com',
  output: 'server',
  adapter: vercel(),
  integrations: [react(), sitemap()],

  vite: {
    plugins: [tailwindcss()]
  }
});