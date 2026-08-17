import { Router } from "express";
import { prisma } from "../lib/prisma";
import { sendSuccess } from "../lib/apiResponse";
import { asyncHandler } from "../lib/asyncHandler";

export const healthRouter = Router();

/**
 * @openapi
 * /health:
 *   get:
 *     summary: Health check
 *     tags: [Health]
 *     responses:
 *       200:
 *         description: Service and database are reachable
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 code:
 *                   type: integer
 *                   example: 200
 *                 data:
 *                   type: object
 *                   properties:
 *                     status:
 *                       type: string
 *                       example: ok
 *                     db:
 *                       type: string
 *                       example: connected
 */
healthRouter.get(
  "/health",
  asyncHandler(async (_req, res) => {
    await prisma.$queryRaw`SELECT 1`;
    sendSuccess(res, 200, { status: "ok", db: "connected" });
  }),
);
