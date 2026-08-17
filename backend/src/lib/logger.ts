/**
 * Tiny structured logger. Each call emits a single JSON line via console so it
 * is easy to filter in Vercel logs (by `scope`, `code` or `level`). Never log
 * secrets or credentials here — only identifiers such as google `sub`/email.
 */
type LogContext = Record<string, unknown>;

interface SerializedError {
  message: string;
  name?: string;
  stack?: string;
  cause?: unknown;
}

function serializeError(error: unknown): SerializedError {
  if (error instanceof Error) {
    const serialized: SerializedError = {
      message: error.message,
      name: error.name,
      stack: error.stack,
    };
    if (error.cause !== undefined) {
      serialized.cause = serializeError(error.cause);
    }
    return serialized;
  }
  return { message: String(error) };
}

function emit(level: 'error' | 'warn' | 'info', payload: LogContext): void {
  const line = JSON.stringify({ level, timestamp: new Date().toISOString(), ...payload });
  if (level === 'error') {
    console.error(line);
  } else if (level === 'warn') {
    console.warn(line);
  } else {
    console.log(line);
  }
}

export function logError(
  scope: string,
  code: string,
  context: LogContext = {},
  error?: unknown,
): void {
  emit('error', {
    scope,
    code,
    ...context,
    error: error !== undefined ? serializeError(error) : undefined,
  });
}

export function logWarn(
  scope: string,
  code: string,
  context: LogContext = {},
  error?: unknown,
): void {
  emit('warn', {
    scope,
    code,
    ...context,
    error: error !== undefined ? serializeError(error) : undefined,
  });
}

export function logInfo(scope: string, message: string, context: LogContext = {}): void {
  emit('info', { scope, message, ...context });
}
