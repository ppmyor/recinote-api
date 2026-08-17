// Runs before any test module is imported so src/config/env.ts's eager
// `required(...)` validation succeeds without a real .env or database.
// Tests mock the repository/jwt layers and never open a real connection.
process.env.DATABASE_URL ??= "postgresql://test:test@localhost:5432/test";
process.env.JWT_SECRET ??= "test-jwt-secret-not-for-production-use";
process.env.NODE_ENV ??= "test";

export {};
