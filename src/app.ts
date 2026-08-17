import express from "express";
import cors from "cors";
import helmet from "helmet";
import swaggerUi from "swagger-ui-express";
import { healthRouter } from "./routes/health";
import { authRouter } from "./routes/auth";
import { errorHandler } from "./middleware/errorHandler";
import { swaggerSpec } from "./config/swagger";

export const app = express();

app.use(helmet());
app.use(cors());
app.use(express.json());

app.use("/docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

app.use(healthRouter);
app.use("/auth", authRouter);

app.use(errorHandler);
