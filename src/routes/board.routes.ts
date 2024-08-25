import { Router } from "express";
import {
  addMember,
  createBoard,
  getBoard,
  updateBoardBg,
} from "../controllers/board.controller";

const boardRouter = Router();

boardRouter.get("/:id", getBoard);
boardRouter.post("/", createBoard);
boardRouter.patch("/:id/bg", updateBoardBg);
boardRouter.patch("/:id/member/add", addMember);

export default boardRouter;
