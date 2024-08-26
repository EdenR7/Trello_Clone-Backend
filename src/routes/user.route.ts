import { Router } from "express";
import {
  getAllUserBoards,
  getUser,
  updateStarredBoards,
} from "../controllers/user.controller";

const userRouter = Router();

userRouter.get("/", getUser);
userRouter.get("/boards/all", getAllUserBoards);
userRouter.patch("/starred/:boardId", updateStarredBoards);

export default userRouter;
