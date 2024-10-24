import { Router } from "express";
import {
  register,
  login,
  generateAGuestUser,
} from "../controllers/auth.controller";

const authRouter = Router();

authRouter.post("/register", register);
authRouter.post("/login", login);
authRouter.post("/guest", generateAGuestUser);

export default authRouter;
