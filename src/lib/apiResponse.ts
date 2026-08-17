import { Response } from "express";

export function sendSuccess<T>(res: Response, status: number, data: T): void {
  res.status(status).json({ success: true, code: status, data });
}
