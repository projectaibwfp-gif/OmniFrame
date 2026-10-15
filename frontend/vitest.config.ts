import { defineConfig } from 'vitest/config';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const projectRoot = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  resolve: {
    alias: {
      '@shared': path.resolve(projectRoot, '../shared'),
    },
  },
  // Specs are transpiled by oxc, which only reads `tsconfig.json`; the app uses
  // `tsconfig.app.json`, so Angular's legacy decorators must be enabled here.
  oxc: {
    decorator: {
      legacy: true,
      emitDecoratorMetadata: true,
    },
  },
  test: {
    environment: 'jsdom',
    include: ['src/**/*.spec.ts'],
    pool: 'threads',
    maxWorkers: 1,
  },
});
