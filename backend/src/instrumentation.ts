const NODE_RUNTIME = 'nodejs';
const PRODUCTION_BUILD_PHASE = 'phase-production-build';

// Fails the server start instead of the first login when production secrets are missing.
export async function register(): Promise<void> {
  if (
    process.env.NEXT_RUNTIME !== NODE_RUNTIME ||
    process.env.NEXT_PHASE === PRODUCTION_BUILD_PHASE
  ) {
    return;
  }
  const { assertSessionSecretsConfigured } = await import('./lib/auth-session');
  assertSessionSecretsConfigured();
}
