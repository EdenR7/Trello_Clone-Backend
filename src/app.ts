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
  const allowedOrigins = [
    'http://trella-front-1.s3-website.eu-central-1.amazonaws.com',  // Production frontend URL (S3)
    'http://localhost:5173'  // Development frontend URL (Vite default port)
  ];
  app.use(cors({
    origin: function (origin, callback) {
      if(!origin) return callback(null, true);
      if (allowedOrigins.indexOf(origin) !== -1 || !origin) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true  // Allows cookies and authorization headers to be sent
  }));

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
