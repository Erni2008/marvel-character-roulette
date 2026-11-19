import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { VitePWA } from 'vite-plugin-pwa';
const base = process.env.BASE_PATH ?? '/';
export default defineConfig({
  base,
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      strategies: 'injectManifest',
      srcDir: 'src',
      filename: 'sw.ts',
      registerType: 'prompt',
      injectRegister: false,
      includeAssets: [
        'icons/*.png',
        'icons/*.svg',
        'fonts/*',
        'art/*.webp',
        'characters/manifest.json',
      ],
      manifest: {
        id: base,
        name: 'Character Roulette',
        short_name: 'Roulette',
        description: 'Draw a card or spin the wheel. Guess the character.',
        start_url: base,
        scope: base,
        display: 'standalone',
        orientation: 'any',
        background_color: '#050811',
        theme_color: '#050811',
        lang: 'en',
        categories: ['games', 'entertainment'],
        icons: [
          { src: 'icons/icon-192.png', sizes: '192x192', type: 'image/png', purpose: 'any' },
          { src: 'icons/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'any' },
          {
            src: 'icons/maskable-512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable',
          },
        ],
      },
      injectManifest: {
        globPatterns: ['**/*.{js,css,html,png,svg,ttf,txt,webmanifest,webp,json,m4a}'],
        globIgnores: ['characters/**/*.png'],
        maximumFileSizeToCacheInBytes: 2 * 1024 * 1024,
      },
      devOptions: { enabled: false },
    }),
  ],
  build: {
    outDir: 'dist/client',
    emptyOutDir: true,
    target: 'es2022',
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('/three/')) return 'chamber-engine';
          if (id.includes('/node_modules/react') || id.includes('/scheduler/')) return 'react';
          if (id.includes('/motion') || id.includes('/framer-motion')) return 'motion';
        },
      },
    },
  },
  server: { port: 5173, strictPort: true },
  preview: { port: 4173, strictPort: true },
});
