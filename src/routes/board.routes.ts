import { Router } from "express";
import {
  addMember,
  archiveList,
  createBoard,
  createBoardLabel,
  createList,
  deleteBoard,
  deleteBoardLabel,
  getBoard,
  removeMember,
  unArchiveList,
  updateBoardBg,
  updateBoardLabel,
  updateDescription,
  updateName,
} from "../controllers/board.controller";
import { sortBoardLists } from "../middlewares/board.middleware";

const boardRouter = Router();

boardRouter.get("/:id", getBoard, sortBoardLists);
boardRouter.delete("/:id", deleteBoard);
boardRouter.post("/", createBoard);
boardRouter.patch("/:id/bg", updateBoardBg, sortBoardLists);
boardRouter.patch("/:id/member/add", addMember, sortBoardLists);
boardRouter.delete("/:id/member/remove", removeMember, sortBoardLists);
boardRouter.patch("/:id/description", updateDescription, sortBoardLists);
boardRouter.patch("/:id/name", updateName, sortBoardLists);
boardRouter.post("/:id/list/create", createList);
boardRouter.patch("/:id/list/:listId/archive", archiveList, sortBoardLists);
boardRouter.patch("/:id/list/:listId/unarchive", unArchiveList, sortBoardLists);
// archive and unarchive card

boardRouter.post("/:id/label/add", createBoardLabel);
boardRouter.patch("/:id/label/:labelId", updateBoardLabel);
boardRouter.delete("/:id/label/:labelId", deleteBoardLabel); // also delete from cards

export default boardRouter;
