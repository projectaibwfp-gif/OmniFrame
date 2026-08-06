import { defineConfig } from 'vite';
import angular from '@analogjs/vite-plugin-angular';
import path from 'node:path';

export default defineConfig(({ mode }) => ({
  root: './src',
  plugins: [
    angular({
      // Absolute path so Vercel resolves correctly when root is ./src
      tsconfig: path.resolve(import.meta.dirname, 'tsconfig.app.json'),
      // JIT for dev, AOT for prod
      jit: mode !== 'production',
    }),
  ],
  build: {
    outDir: '../dist',
    emptyOutDir: true,
    sourcemap: mode !== 'production',
  },
  server: {
    port: 4200,
    proxy: {
      '/api': {
        target: 'https://apiomniframe.vercel.app',
        changeOrigin: true,
      },
    },
  },
}));
