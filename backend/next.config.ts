import path from 'node:path';
import { fileURLToPath } from 'node:url';
import type { NextConfig } from 'next';

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

const nextConfig: NextConfig = {
  poweredByHeader: false,
  experimental: {
    externalDir: true,
  },
  turbopack: {
    root: projectRoot,
  },
};

export default nextConfig;
