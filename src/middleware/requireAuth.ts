import { NextFunction, Request, Response } from "express";
import { verifyAuthToken } from "../lib/jwt";
import { HttpError } from "../lib/httpError";
import { AUTH_COOKIE_NAME } from "../lib/authCookie";

export function requireAuth(req: Request, _res: Response, next: NextFunction): void {
  const token = req.cookies?.[AUTH_COOKIE_NAME] as string | undefined;
  if (!token) {
    next(new HttpError(401, "UNAUTHENTICATED", "authentication required"));
    return;
  }

  try {
    req.userId = verifyAuthToken(token).sub;
    next();
  } catch {
    next(new HttpError(401, "UNAUTHENTICATED", "invalid or expired session"));
  }
}
