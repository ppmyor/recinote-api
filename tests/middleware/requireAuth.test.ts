import { Request, Response } from "express";
import { requireAuth } from "../../src/middleware/requireAuth";
import { verifyAuthToken } from "../../src/lib/jwt";
import { HttpError } from "../../src/lib/httpError";
import { AUTH_COOKIE_NAME } from "../../src/lib/authCookie";

jest.mock("../../src/lib/jwt");

const mockVerifyAuthToken = verifyAuthToken as jest.MockedFunction<typeof verifyAuthToken>;

function buildRequest(cookies: Record<string, string> = {}): Request {
  return { cookies } as unknown as Request;
}

describe("requireAuth", () => {
  it("calls next with UNAUTHENTICATED when there is no cookie", () => {
    const req = buildRequest();
    const next = jest.fn();

    requireAuth(req, {} as Response, next);

    expect(next).toHaveBeenCalledTimes(1);
    const err = next.mock.calls[0][0] as HttpError;
    expect(err).toBeInstanceOf(HttpError);
    expect(err.status).toBe(401);
    expect(err.errorCode).toBe("UNAUTHENTICATED");
  });

  it("calls next with UNAUTHENTICATED when the token is invalid", () => {
    mockVerifyAuthToken.mockImplementation(() => {
      throw new Error("invalid token");
    });
    const req = buildRequest({ [AUTH_COOKIE_NAME]: "bad-token" });
    const next = jest.fn();

    requireAuth(req, {} as Response, next);

    const err = next.mock.calls[0][0] as HttpError;
    expect(err.status).toBe(401);
    expect(err.errorCode).toBe("UNAUTHENTICATED");
  });

  it("sets req.userId and calls next() when the token is valid", () => {
    mockVerifyAuthToken.mockReturnValue({ sub: "user-1" });
    const req = buildRequest({ [AUTH_COOKIE_NAME]: "good-token" });
    const next = jest.fn();

    requireAuth(req, {} as Response, next);

    expect(req.userId).toBe("user-1");
    expect(next).toHaveBeenCalledWith();
  });
});
