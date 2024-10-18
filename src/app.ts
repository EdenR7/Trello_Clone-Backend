import express, { Application } from "express";
// import userRoutes from "./routes/user.route";
import connectDB from "./config/db";
import cors from "cors";
import { errorHandler } from "./middlewares/errors.middleware";
import authRouter from "./routes/auth.routes";
import userRouter from "./routes/user.route";
import { verifyToken } from "./middlewares/auth.middleware";
import cardRouter from "./routes/card.routes";
import boardRouter from "./routes/board.routes";
import listRouter from "./routes/list.routes";
import workspaceRouter from "./routes/workspace.routes";

const app: Application = express();

export async function main() {
  await connectDB();

  app.use(express.static("public"));
  const path = require("path");
  app.use(express.json());
  // app.use(cors());
  app.use(
    cors({
      origin: "*",
      // methods: ['GET', 'POST', 'PUT', 'DELETE'],
      // allowedHeaders: ['Content-Type', 'Authorization'],
      // credentials: true
    })
  );

  // Routes
  app.use("/api/auth", authRouter);
  app.use("/api/user", verifyToken, userRouter);
  app.use("/api/workspace", verifyToken, workspaceRouter);
  app.use("/api/card", verifyToken, cardRouter);
  app.use("/api/board", verifyToken, boardRouter);
  app.use("/api/list", verifyToken, listRouter);

  app.use(errorHandler);

  app.get("*", (req, res) => {
    res.sendFile(path.join(__dirname, "public", "index.html"));
  });
}

export default app;
