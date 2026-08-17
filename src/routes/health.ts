import { Router } from "express";
import { prisma } from "../lib/prisma";

export const healthRouter = Router();

healthRouter.get("/health", async (_req, res, next) => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    res.status(200).json({ status: "ok", db: "connected" });
  } catch (err) {
    next(err);
  }
});
