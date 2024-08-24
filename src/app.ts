import express, { Application } from "express";
// import userRoutes from "./routes/user.route";
import connectDB from "./config/db";
import cors from "cors";
import { errorHandler } from "./middlewares/errors.middleware";
import authRouter from "./routes/auth.routes";
import userRouter from "./routes/user.route";
import { verifyToken } from "./middlewares/auth.middleware";
import cardRouter from "./routes/card.routes";

const app: Application = express();

export async function main() {
  await connectDB();
  app.use(express.json());
  app.use(cors());

  // Middleware

  // Routes
  app.use("/api/auth", authRouter);
  app.use("/api/user", verifyToken, userRouter);
  app.use("/api/card", verifyToken, cardRouter);

  app.use(errorHandler);
}

export default app;
