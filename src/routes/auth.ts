import { Router } from "express";
import { authController } from "../controllers/auth.controller";
import { requireAuth } from "../middleware/requireAuth";
import { loginRateLimiter, signupRateLimiter } from "../middleware/rateLimiter";
import { asyncHandler } from "../lib/asyncHandler";

export const authRouter = Router();

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
authRouter.post("/check-password-match", asyncHandler(authController.checkPasswordMatch));

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
 *       429:
 *         description: Too many signup attempts, try again later
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
authRouter.post("/signup", signupRateLimiter, asyncHandler(authController.signup));

/**
 * @openapi
 * /auth/login:
 *   post:
 *     summary: Log in and receive an httpOnly session cookie
 *     tags: [Auth]
 *     security:
 *       - {}
 *       - cookieAuth: []
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
 *       429:
 *         description: Too many login attempts, try again later
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
authRouter.post("/login", loginRateLimiter, asyncHandler(authController.login));

/**
 * @openapi
 * /auth/me:
 *   get:
 *     summary: Get the currently authenticated user
 *     tags: [Auth]
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: Current user
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
 *       401:
 *         description: Not authenticated
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
authRouter.get("/me", requireAuth, asyncHandler(authController.me));

/**
 * @openapi
 * /auth/logout:
 *   post:
 *     summary: Log out and clear the session cookie
 *     tags: [Auth]
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: Logged out; access_token cookie is cleared
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
 *                     loggedOut:
 *                       type: boolean
 *                       example: true
 */
authRouter.post("/logout", asyncHandler(authController.logout));
