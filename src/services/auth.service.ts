import { HttpError } from "../lib/httpError";
import { hashPassword, comparePassword } from "../lib/password";
import { signAuthToken } from "../lib/jwt";
import { toPublicUser, PublicUser } from "../lib/publicUser";
import { userRepository, DuplicateEmailError } from "../repositories/user.repository";

export const authService = {
  checkPasswordMatch(password: string, passwordConfirm: string): { match: boolean } {
    return { match: password === passwordConfirm };
  },

  async signup(input: { name: string; email: string; password: string }): Promise<PublicUser> {
    const passwordHash = await hashPassword(input.password);
    try {
      return await userRepository.createUser({
        name: input.name,
        email: input.email,
        passwordHash,
      });
    } catch (err) {
      if (err instanceof DuplicateEmailError) {
        throw new HttpError(409, "EMAIL_ALREADY_EXISTS", "email is already in use");
      }
      throw err;
    }
  },

  async login(input: { email: string; password: string }): Promise<{ token: string; user: PublicUser }> {
    const user = await userRepository.findByEmail(input.email);
    if (!user || !(await comparePassword(input.password, user.passwordHash))) {
      throw new HttpError(401, "INVALID_CREDENTIALS", "invalid email or password");
    }

    const token = signAuthToken(user.id);
    return { token, user: toPublicUser(user) };
  },

  async getCurrentUser(userId: string): Promise<PublicUser> {
    const user = await userRepository.findPublicById(userId);
    if (!user) {
      throw new HttpError(401, "UNAUTHENTICATED", "user not found");
    }
    return user;
  },
};
