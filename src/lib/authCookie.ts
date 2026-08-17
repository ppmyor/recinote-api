import { CookieOptions, Response } from "express";
import { env } from "../config/env";

export const AUTH_COOKIE_NAME = "access_token";

const authCookieOptions: CookieOptions = {
  httpOnly: true,
  secure: env.nodeEnv === "production",
  sameSite: "lax",
};

export function setAuthCookie(res: Response, token: string): void {
  res.cookie(AUTH_COOKIE_NAME, token, {
    ...authCookieOptions,
    maxAge: env.jwtExpiresInMs,
  });
}

export function clearAuthCookie(res: Response): void {
  res.clearCookie(AUTH_COOKIE_NAME, authCookieOptions);
}
