import { Router } from "express";
import {
  getAllUserBoards,
  getAllUsers,
  getUser,
  updateStarredBoards,
} from "../controllers/user.controller";

const userRouter = Router();

userRouter.get("/", getUser);
userRouter.get("/all", getAllUsers);
userRouter.get("/boards/all", getAllUserBoards);
userRouter.patch("/starred/:boardId", updateStarredBoards);

export default userRouter;
