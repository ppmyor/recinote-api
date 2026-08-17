import request from "supertest";
import { app } from "../../src/app";
import { userRepository } from "../../src/repositories/user.repository";
import { verifyAuthToken } from "../../src/lib/jwt";

jest.mock("../../src/repositories/user.repository");
jest.mock("../../src/lib/jwt");

const mockFindPublicById = userRepository.findPublicById as jest.MockedFunction<
  typeof userRepository.findPublicById
>;
const mockVerifyAuthToken = verifyAuthToken as jest.MockedFunction<typeof verifyAuthToken>;

const publicUser = {
  id: "user-1",
  name: "Anna",
  email: "anna@example.com",
  createdAt: new Date("2026-01-01"),
};

describe("auth routes", () => {
  describe("GET /auth/me", () => {
    it("returns 401 UNAUTHENTICATED without a cookie", async () => {
      const res = await request(app).get("/auth/me");

      expect(res.status).toBe(401);
      expect(res.body.errorCode).toBe("UNAUTHENTICATED");
    });

    it("returns 200 with the current user when the cookie is valid", async () => {
      mockVerifyAuthToken.mockReturnValue({ sub: "user-1" });
      mockFindPublicById.mockResolvedValue(publicUser);

      const res = await request(app).get("/auth/me").set("Cookie", "access_token=valid-token");

      expect(res.status).toBe(200);
      expect(res.body).toEqual({
        success: true,
        code: 200,
        data: { ...publicUser, createdAt: publicUser.createdAt.toISOString() },
      });
    });
  });

  describe("POST /auth/logout", () => {
    it("clears the access_token cookie", async () => {
      const res = await request(app).post("/auth/logout").set("Cookie", "access_token=some-token");

      expect(res.status).toBe(200);
      const setCookie = res.headers["set-cookie"] as unknown as string[];
      expect(setCookie).toBeDefined();
      expect(setCookie[0]).toMatch(/^access_token=;/);
      expect(setCookie[0]).toMatch(/Path=\//);
    });
  });
});
