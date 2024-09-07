import { Router } from "express";
import {
  addMember,
  archiveAllListCards,
  archiveCard,
  archiveList,
  // archiveList,
  createBoard,
  createBoardLabel,
  // createList,
  deleteBoard,
  deleteBoardLabel,
  getBoard,
  removeMember,
  unArchiveCard,
  unArchiveList,
  // unArchiveList,
  updateBoardBg,
  updateBoardLabel,
  updateDescription,
  updateName,
} from "../controllers/board.controller";

const boardRouter = Router();

boardRouter.get("/:id", getBoard);
boardRouter.post("/:workspaceId", createBoard);
boardRouter.patch("/:id/bg", updateBoardBg);
boardRouter.patch("/:id/member/add", addMember);
boardRouter.delete("/:id/member/remove", removeMember);
boardRouter.delete("/:id/:workspaceId", deleteBoard);
boardRouter.patch("/:id/description", updateDescription);
boardRouter.patch("/:id/name", updateName);

boardRouter.patch("/:id/list/:listId/archive", archiveList);
boardRouter.patch("/:id/list/:listId/unarchive", unArchiveList);
boardRouter.patch("/:id/card/:cardId/archive", archiveCard);
boardRouter.patch("/:id/card/:cardId/unarchive", unArchiveCard);
boardRouter.patch("/:id/list/:listId/cards/archive", archiveAllListCards); // archive card
// delete card

boardRouter.post("/:id/label", createBoardLabel);
boardRouter.patch("/:id/label/:labelId", updateBoardLabel);
boardRouter.delete("/:id/label/:labelId", deleteBoardLabel); // also delete from cards

export default boardRouter;
