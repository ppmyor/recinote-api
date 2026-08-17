import "dotenv/config";

function required(key: string): string {
  const value = process.env[key];
  if (!value) throw new Error(`Missing required env var: ${key}`);
  return value;
}

const JWT_SECRET_MIN_LENGTH = 32;

function requiredWithMinLength(key: string, minLength: number): string {
  const value = required(key);
  if (value.length < minLength) {
    throw new Error(`${key} must be at least ${minLength} characters long`);
  }
  return value;
}

// ALLOWED_ORIGINS is optional: missing/empty just means no cross-origin
// browser requests are allowed, not a fatal misconfiguration like JWT_SECRET.
function parseAllowedOrigins(value: string | undefined): string[] {
  return (value ?? "")
    .split(",")
    .map((origin) => origin.trim())
    .filter((origin) => origin.length > 0);
}

const DURATION_MS: Record<string, number> = {
  ms: 1,
  s: 1000,
  m: 60_000,
  h: 3_600_000,
  d: 86_400_000,
  w: 604_800_000,
};

function parseExpiresInToMs(value: string): number {
  if (/^\d+$/.test(value)) {
    return Number(value) * 1000;
  }

  const match = /^(\d+)(ms|s|m|h|d|w)$/.exec(value);
  if (!match) {
    throw new Error(`Invalid JWT_EXPIRES_IN: ${value}. Use seconds or a duration like 7d, 24h.`);
  }

  return Number(match[1]) * DURATION_MS[match[2]];
}

const jwtExpiresIn = process.env.JWT_EXPIRES_IN ?? "7d";

export const env = {
  nodeEnv: process.env.NODE_ENV ?? "development",
  port: Number(process.env.PORT ?? 4000),
  databaseUrl: required("DATABASE_URL"),
  jwtSecret: requiredWithMinLength("JWT_SECRET", JWT_SECRET_MIN_LENGTH),
  jwtExpiresIn,
  jwtExpiresInMs: parseExpiresInToMs(jwtExpiresIn),
  allowedOrigins: parseAllowedOrigins(process.env.ALLOWED_ORIGINS),
};
