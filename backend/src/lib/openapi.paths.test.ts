import { readdirSync } from 'node:fs';
import { join, relative, sep } from 'node:path';
import { describe, expect, it } from 'vitest';
import { openApiDocument } from './openapi';

const APP_DIR = join(__dirname, '..', 'app');
const ROUTE_FILE_NAME = 'route.ts';
const DYNAMIC_SEGMENT_PATTERN = /\[([^\]]+)\]/g;

function findRouteFiles(directory: string): string[] {
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const entryPath = join(directory, entry.name);
    if (entry.isDirectory()) {
      return findRouteFiles(entryPath);
    }
    return entry.name === ROUTE_FILE_NAME ? [entryPath] : [];
  });
}

function toOpenApiPath(routeFile: string): string {
  const routeDirectory = relative(APP_DIR, routeFile).split(sep).slice(0, -1).join('/');
  return `/${routeDirectory}`.replace(DYNAMIC_SEGMENT_PATTERN, '{$1}');
}

describe('OpenAPI path coverage', () => {
  it('documents every API route handler', () => {
    const routePaths = findRouteFiles(join(APP_DIR, 'api')).map(toOpenApiPath);
    const documentedPaths = Object.keys(openApiDocument.paths);

    expect(routePaths.length).toBeGreaterThan(0);
    expect(routePaths.filter((path) => !documentedPaths.includes(path))).toEqual([]);
  });

  it('maps dynamic route segments to OpenAPI path parameters', () => {
    const routeFile = join(APP_DIR, 'api', 'house', '[world]', '[houseId]', ROUTE_FILE_NAME);

    expect(toOpenApiPath(routeFile)).toBe('/api/house/{world}/{houseId}');
  });
});
