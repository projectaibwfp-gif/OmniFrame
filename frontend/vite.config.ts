import { defineConfig } from 'vite';
import angular from '@analogjs/vite-plugin-angular';
import path from 'node:path';
import { readFileSync } from 'node:fs';

const packageJson = JSON.parse(
  readFileSync(new URL('./package.json', import.meta.url), 'utf8'),
) as {
  version: string;
};

export default defineConfig(({ mode }) => ({
  root: './src',
  resolve: {
    alias: {
      '@shared': path.resolve(import.meta.dirname, '../shared'),
    },
  },
  define: {
    __APP_VERSION__: JSON.stringify(packageJson.version),
  },
  css: {
    preprocessorOptions: {
      scss: {
        quietDeps: true,
        loadPaths: [
          path.resolve(import.meta.dirname, 'src/styles'),
          path.resolve(import.meta.dirname, 'node_modules'),
        ],
      },
    },
  },
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
