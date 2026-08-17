import { Request, Response } from "express";
import { authService } from "../services/auth.service";
import { sendSuccess } from "../lib/apiResponse";
import { setAuthCookie, clearAuthCookie } from "../lib/authCookie";
import { checkPasswordMatchSchema, signupSchema, loginSchema } from "../validation/auth";

export const authController = {
  checkPasswordMatch(req: Request, res: Response): void {
    const { password, passwordConfirm } = checkPasswordMatchSchema.parse(req.body);
    sendSuccess(res, 200, authService.checkPasswordMatch(password, passwordConfirm));
  },

  async signup(req: Request, res: Response): Promise<void> {
    const { name, email, password } = signupSchema.parse(req.body);
    const user = await authService.signup({ name, email, password });
    sendSuccess(res, 201, user);
  },

  async login(req: Request, res: Response): Promise<void> {
    const { email, password } = loginSchema.parse(req.body);
    const { token, user } = await authService.login({ email, password });

    setAuthCookie(res, token);
    sendSuccess(res, 200, user);
  },

  async me(req: Request, res: Response): Promise<void> {
    const user = await authService.getCurrentUser(req.userId as string);
    sendSuccess(res, 200, user);
  },

  logout(_req: Request, res: Response): void {
    clearAuthCookie(res);
    sendSuccess(res, 200, { loggedOut: true });
  },
};
