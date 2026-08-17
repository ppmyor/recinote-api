import "dotenv/config";

function required(key: string): string {
  const value = process.env[key];
  if (!value) throw new Error(`Missing required env var: ${key}`);
  return value;
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
  jwtSecret: required("JWT_SECRET"),
  jwtExpiresIn,
  jwtExpiresInMs: parseExpiresInToMs(jwtExpiresIn),
};
