import express, { Application } from "express";
import userRoutes from "./routes/user.route";

const app: Application = express();

// Middleware
app.use(express.json());

// Routes
app.use("/api/users", userRoutes);

export default app;
