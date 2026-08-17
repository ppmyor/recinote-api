import { ErrorRequestHandler } from "express";
import { STATUS_CODES } from "http";
import { ZodError } from "zod";
import { HttpError } from "../lib/httpError";

export const errorHandler: ErrorRequestHandler = (err, _req, res, _next) => {
  console.error(err);

  if (err instanceof ZodError) {
    res.status(400).json({
      statusCode: 400,
      error: STATUS_CODES[400] ?? "Error",
      errorCode: "VALIDATION_ERROR",
      message: err.errors[0]?.message ?? "invalid request body",
    });
    return;
  }

  const statusCode = err instanceof HttpError ? err.status : 500;
  const errorCode = err instanceof HttpError ? err.errorCode : "INTERNAL_SERVER_ERROR";
  const message = err instanceof HttpError ? err.message : "Internal Server Error";

  res.status(statusCode).json({
    statusCode,
    error: STATUS_CODES[statusCode] ?? "Error",
    errorCode,
    message,
  });
};
