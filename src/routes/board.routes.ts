import { Router } from "express";
import {
  addMember,
  archiveList,
  createBoard,
  createList,
  getBoard,
  removeMember,
  unArchiveList,
  updateBoardBg,
  updateDescription,
  updateName,
} from "../controllers/board.controller";
import { sortBoardLists } from "../middlewares/board.middleware";

const boardRouter = Router();

boardRouter.get("/:id", getBoard, sortBoardLists);
boardRouter.post("/", createBoard);
boardRouter.patch("/:id/bg", updateBoardBg, sortBoardLists);
boardRouter.patch("/:id/member/add", addMember, sortBoardLists);
boardRouter.delete("/:id/member/remove", removeMember, sortBoardLists);
boardRouter.patch("/:id/description", updateDescription, sortBoardLists);
boardRouter.patch("/:id/name", updateName, sortBoardLists);
boardRouter.post("/:id/list/create", createList);
boardRouter.patch("/:id/list/:listId/archive", archiveList, sortBoardLists);
boardRouter.patch("/:id/list/:listId/unarchive", unArchiveList, sortBoardLists);

// archiveList and archiveCard

// boardRouter.post("/:id/label/add")
// boardRouter.patch("/:id/label/edit")

export default boardRouter;
