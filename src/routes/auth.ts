import { Router } from "express";
import { Prisma } from "@prisma/client";
import { prisma } from "../lib/prisma";
import { hashPassword, comparePassword } from "../lib/password";
import { signAuthToken } from "../lib/jwt";
import { HttpError } from "../lib/httpError";
import { sendSuccess } from "../lib/apiResponse";
import { asyncHandler } from "../lib/asyncHandler";
import { publicUserSelect, toPublicUser } from "../lib/publicUser";
import { checkPasswordMatchSchema, signupSchema, loginSchema } from "../validation/auth";
import { env } from "../config/env";

export const authRouter = Router();

const AUTH_COOKIE_NAME = "access_token";

/**
 * @openapi
 * /auth/check-password-match:
 *   post:
 *     summary: Check whether password and passwordConfirm match
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [password, passwordConfirm]
 *             properties:
 *               password:
 *                 type: string
 *               passwordConfirm:
 *                 type: string
 *     responses:
 *       200:
 *         description: Match result
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
 *                     match:
 *                       type: boolean
 *       400:
 *         description: Invalid request body
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
authRouter.post(
  "/check-password-match",
  asyncHandler((req, res) => {
    const { password, passwordConfirm } = checkPasswordMatchSchema.parse(req.body);
    sendSuccess(res, 200, { match: password === passwordConfirm });
  }),
);

/**
 * @openapi
 * /auth/signup:
 *   post:
 *     summary: Create a new user account
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name, email, password, passwordConfirm]
 *             properties:
 *               name:
 *                 type: string
 *                 example: Anna
 *               email:
 *                 type: string
 *                 format: email
 *                 example: anna@example.com
 *               password:
 *                 type: string
 *                 description: At least 8 characters, must include both letters and numbers
 *                 example: abcd1234
 *               passwordConfirm:
 *                 type: string
 *                 example: abcd1234
 *     responses:
 *       201:
 *         description: User created
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
 *                   example: 201
 *                 data:
 *                   $ref: '#/components/schemas/User'
 *       400:
 *         description: Invalid request body (bad email format, weak password, or password mismatch)
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       409:
 *         description: Email already in use
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
authRouter.post(
  "/signup",
  asyncHandler(async (req, res) => {
    const { name, email, password } = signupSchema.parse(req.body);
    const passwordHash = await hashPassword(password);

    try {
      const user = await prisma.user.create({
        data: { name, email, passwordHash },
        select: publicUserSelect,
      });

      sendSuccess(res, 201, user);
    } catch (err) {
      if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === "P2002") {
        throw new HttpError(409, "EMAIL_ALREADY_EXISTS", "email is already in use");
      }
      throw err;
    }
  }),
);

/**
 * @openapi
 * /auth/login:
 *   post:
 *     summary: Log in and receive an httpOnly session cookie
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, password]
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: anna@example.com
 *               password:
 *                 type: string
 *                 example: abcd1234
 *     responses:
 *       200:
 *         description: Login succeeded; access_token httpOnly cookie is set
 *         headers:
 *           Set-Cookie:
 *             schema:
 *               type: string
 *               example: access_token=eyJ...; Path=/; HttpOnly; SameSite=Lax
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
 *                   $ref: '#/components/schemas/User'
 *       400:
 *         description: Invalid request body
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       401:
 *         description: Invalid email or password
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
authRouter.post(
  "/login",
  asyncHandler(async (req, res) => {
    const { email, password } = loginSchema.parse(req.body);

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user || !(await comparePassword(password, user.passwordHash))) {
      throw new HttpError(401, "INVALID_CREDENTIALS", "invalid email or password");
    }

    const token = signAuthToken(user.id);
    res.cookie(AUTH_COOKIE_NAME, token, {
      httpOnly: true,
      secure: env.nodeEnv === "production",
      sameSite: "lax",
      maxAge: env.jwtExpiresInMs,
    });

    sendSuccess(res, 200, toPublicUser(user));
  }),
);
