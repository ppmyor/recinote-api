import rateLimit, { RateLimitRequestHandler } from "express-rate-limit";
import { HttpError } from "../lib/httpError";

function createAuthRateLimiter(windowMs: number, max: number): RateLimitRequestHandler {
  return rateLimit({
    windowMs,
    max,
    standardHeaders: true,
    legacyHeaders: false,
    handler: (_req, _res, next) => {
      next(new HttpError(429, "TOO_MANY_REQUESTS", "too many requests, please try again later"));
    },
  });
}

export const loginRateLimiter = createAuthRateLimiter(15 * 60 * 1000, 5);
export const signupRateLimiter = createAuthRateLimiter(60 * 60 * 1000, 10);
