import swaggerJsdoc from "swagger-jsdoc";
import { env } from "./env";

export const swaggerSpec = swaggerJsdoc({
  definition: {
    openapi: "3.0.3",
    info: {
      title: "recinote API",
      version: "0.1.0",
    },
    servers: [{ url: `http://localhost:${env.port}` }],
    tags: [
      { name: "Health", description: "서버 상태 확인" },
      { name: "Auth", description: "회원가입, 로그인, 비밀번호 검증" },
    ],
    components: {
      schemas: {
        User: {
          type: "object",
          properties: {
            id: { type: "string", example: "cmsx27mtl0000xpib6r04j8pw" },
            name: { type: "string", example: "Anna" },
            email: { type: "string", format: "email", example: "anna@example.com" },
            createdAt: { type: "string", format: "date-time" },
          },
        },
        ErrorResponse: {
          type: "object",
          properties: {
            statusCode: { type: "integer", example: 400 },
            error: { type: "string", example: "Bad Request" },
            errorCode: { type: "string", example: "VALIDATION_ERROR" },
            message: { type: "string", example: "invalid email or password" },
          },
        },
      },
    },
  },
  apis: ["./src/routes/*.ts"],
});
