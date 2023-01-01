import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';

// https://astro.build/config
import svelte from '@astrojs/svelte'; // eslint-disable-line n/no-unpublished-import

// https://astro.build/config
export default defineConfig({
  integrations: [mdx(), svelte()],
});
