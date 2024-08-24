import { Router } from "express";
import { getAllUserBoards, getUser } from "../controllers/user.controller";

const userRouter = Router();

userRouter.get("/", getUser);
userRouter.get("/boards/all", getAllUserBoards);

export default userRouter;
