/**
 * Minimalny, zero-zależnościowy DSL do walidacji runtime, współdzielony między
 * frontend i backend. Zwraca deterministyczny wynik `{ ok, data | issues }`,
 * żeby wywołujący sam decydował o formacie odpowiedzi (backend -> errorResponse,
 * frontend -> stan formularza).
 */

export interface SchemaIssue {
  path: string;
  message: string;
}

export type SchemaResult<T> = { ok: true; data: T } | { ok: false; issues: SchemaIssue[] };

export interface Schema<T> {
  parse(value: unknown, path?: string): SchemaResult<T>;
}

export type Infer<S> = S extends Schema<infer T> ? T : never;

function issue(path: string, message: string): SchemaIssue {
  return { path: path || "(root)", message };
}

function join(path: string, key: string | number): string {
  if (path === "") {
    return String(key);
  }
  return typeof key === "number" ? `${path}[${key}]` : `${path}.${key}`;
}

export interface StringOptions {
  minLength?: number;
  maxLength?: number;
  pattern?: RegExp;
  trim?: boolean;
  allowEmpty?: boolean;
}

export function stringSchema(options: StringOptions = {}): Schema<string> {
  const { minLength, maxLength, pattern, trim = true, allowEmpty = false } = options;
  return {
    parse(value, path = "") {
      if (typeof value !== "string") {
        return { ok: false, issues: [issue(path, "must be a string")] };
      }
      const normalized = trim ? value.trim() : value;
      if (!allowEmpty && normalized.length === 0) {
        return { ok: false, issues: [issue(path, "must not be empty")] };
      }
      if (typeof minLength === "number" && normalized.length < minLength) {
        return { ok: false, issues: [issue(path, `must be at least ${minLength} characters`)] };
      }
      if (typeof maxLength === "number" && normalized.length > maxLength) {
        return { ok: false, issues: [issue(path, `must be at most ${maxLength} characters`)] };
      }
      if (pattern && !pattern.test(normalized)) {
        return { ok: false, issues: [issue(path, "has invalid format")] };
      }
      return { ok: true, data: normalized };
    },
  };
}

export interface IntFromStringOptions {
  min?: number;
  max?: number;
}

export function intFromStringSchema(options: IntFromStringOptions = {}): Schema<number> {
  const { min, max } = options;
  return {
    parse(value, path = "") {
      if (typeof value !== "string" && typeof value !== "number") {
        return { ok: false, issues: [issue(path, "must be an integer")] };
      }
      const parsed =
        typeof value === "number" ? value : Number.parseInt(value.trim(), 10);
      if (!Number.isFinite(parsed) || !Number.isInteger(parsed)) {
        return { ok: false, issues: [issue(path, "must be an integer")] };
      }
      if (typeof min === "number" && parsed < min) {
        return { ok: false, issues: [issue(path, `must be >= ${min}`)] };
      }
      if (typeof max === "number" && parsed > max) {
        return { ok: false, issues: [issue(path, `must be <= ${max}`)] };
      }
      return { ok: true, data: parsed };
    },
  };
}

export function enumSchema<T extends string>(values: readonly T[]): Schema<T> {
  return {
    parse(value, path = "") {
      if (typeof value !== "string" || !(values as readonly string[]).includes(value)) {
        return {
          ok: false,
          issues: [issue(path, `must be one of: ${values.join(", ")}`)],
        };
      }
      return { ok: true, data: value as T };
    },
  };
}

export function optional<T>(inner: Schema<T>): Schema<T | undefined> {
  return {
    parse(value, path = "") {
      if (value === undefined || value === null || value === "") {
        return { ok: true, data: undefined };
      }
      const result = inner.parse(value, path);
      if (!result.ok) {
        return result;
      }
      return { ok: true, data: result.data };
    },
  };
}

export function withDefault<T>(inner: Schema<T>, fallback: T): Schema<T> {
  return {
    parse(value, path = "") {
      if (value === undefined || value === null || value === "") {
        return { ok: true, data: fallback };
      }
      const result = inner.parse(value, path);
      if (!result.ok) {
        return { ok: true, data: fallback };
      }
      return result;
    },
  };
}

export type ObjectShape = Record<string, Schema<unknown>>;

export type InferObject<S extends ObjectShape> = {
  [K in keyof S]: Infer<S[K]>;
};

export function objectSchema<S extends ObjectShape>(shape: S): Schema<InferObject<S>> {
  const entries = Object.entries(shape);
  return {
    parse(value, path = "") {
      if (typeof value !== "object" || value === null || Array.isArray(value)) {
        return { ok: false, issues: [issue(path, "must be an object")] };
      }
      const source = value as Record<string, unknown>;
      const issues: SchemaIssue[] = [];
      const output: Record<string, unknown> = {};
      for (const [key, keySchema] of entries) {
        const result = keySchema.parse(source[key], join(path, key));
        if (!result.ok) {
          issues.push(...result.issues);
          continue;
        }
        if (result.data !== undefined) {
          output[key] = result.data;
        }
      }
      if (issues.length > 0) {
        return { ok: false, issues };
      }
      return { ok: true, data: output as InferObject<S> };
    },
  };
}

export function formatIssues(issues: readonly SchemaIssue[]): string {
  return issues.map((entry) => `${entry.path}: ${entry.message}`).join("; ");
}
