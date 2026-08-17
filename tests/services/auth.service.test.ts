import { authService } from "../../src/services/auth.service";
import { userRepository, DuplicateEmailError } from "../../src/repositories/user.repository";
import { hashPassword, comparePassword } from "../../src/lib/password";
import { signAuthToken } from "../../src/lib/jwt";

jest.mock("../../src/repositories/user.repository");
jest.mock("../../src/lib/password");
jest.mock("../../src/lib/jwt");

const mockFindByEmail = userRepository.findByEmail as jest.MockedFunction<typeof userRepository.findByEmail>;
const mockFindPublicById = userRepository.findPublicById as jest.MockedFunction<
  typeof userRepository.findPublicById
>;
const mockCreateUser = userRepository.createUser as jest.MockedFunction<typeof userRepository.createUser>;
const mockHashPassword = hashPassword as jest.MockedFunction<typeof hashPassword>;
const mockComparePassword = comparePassword as jest.MockedFunction<typeof comparePassword>;
const mockSignAuthToken = signAuthToken as jest.MockedFunction<typeof signAuthToken>;

const publicUser = {
  id: "user-1",
  name: "Anna",
  email: "anna@example.com",
  createdAt: new Date("2026-01-01"),
};

describe("authService", () => {
  describe("checkPasswordMatch", () => {
    it("returns match: true when passwords are equal", () => {
      expect(authService.checkPasswordMatch("a", "a")).toEqual({ match: true });
    });

    it("returns match: false when passwords differ", () => {
      expect(authService.checkPasswordMatch("a", "b")).toEqual({ match: false });
    });
  });

  describe("signup", () => {
    it("creates a user with a hashed password", async () => {
      mockHashPassword.mockResolvedValue("hashed");
      mockCreateUser.mockResolvedValue(publicUser);

      const result = await authService.signup({
        name: "Anna",
        email: "anna@example.com",
        password: "abcd1234",
      });

      expect(mockHashPassword).toHaveBeenCalledWith("abcd1234");
      expect(mockCreateUser).toHaveBeenCalledWith({
        name: "Anna",
        email: "anna@example.com",
        passwordHash: "hashed",
      });
      expect(result).toEqual(publicUser);
    });

    it("throws EMAIL_ALREADY_EXISTS when the repository reports a duplicate email", async () => {
      mockHashPassword.mockResolvedValue("hashed");
      mockCreateUser.mockRejectedValue(new DuplicateEmailError("anna@example.com"));

      await expect(
        authService.signup({ name: "Anna", email: "anna@example.com", password: "abcd1234" }),
      ).rejects.toMatchObject({ status: 409, errorCode: "EMAIL_ALREADY_EXISTS" });
    });
  });

  describe("login", () => {
    it("throws INVALID_CREDENTIALS when the user does not exist", async () => {
      mockFindByEmail.mockResolvedValue(null);

      await expect(
        authService.login({ email: "nobody@example.com", password: "abcd1234" }),
      ).rejects.toMatchObject({ status: 401, errorCode: "INVALID_CREDENTIALS" });
    });

    it("throws INVALID_CREDENTIALS when the password does not match", async () => {
      mockFindByEmail.mockResolvedValue({ ...publicUser, passwordHash: "hashed" });
      mockComparePassword.mockResolvedValue(false);

      await expect(
        authService.login({ email: "anna@example.com", password: "wrong" }),
      ).rejects.toMatchObject({ status: 401, errorCode: "INVALID_CREDENTIALS" });
    });

    it("returns a token and the public user on success", async () => {
      mockFindByEmail.mockResolvedValue({ ...publicUser, passwordHash: "hashed" });
      mockComparePassword.mockResolvedValue(true);
      mockSignAuthToken.mockReturnValue("signed-token");

      const result = await authService.login({ email: "anna@example.com", password: "abcd1234" });

      expect(mockSignAuthToken).toHaveBeenCalledWith("user-1");
      expect(result).toEqual({ token: "signed-token", user: publicUser });
    });
  });

  describe("getCurrentUser", () => {
    it("returns the public user when found", async () => {
      mockFindPublicById.mockResolvedValue(publicUser);

      await expect(authService.getCurrentUser("user-1")).resolves.toEqual(publicUser);
    });

    it("throws UNAUTHENTICATED when the user no longer exists", async () => {
      mockFindPublicById.mockResolvedValue(null);

      await expect(authService.getCurrentUser("user-1")).rejects.toMatchObject({
        status: 401,
        errorCode: "UNAUTHENTICATED",
      });
    });
  });
});
