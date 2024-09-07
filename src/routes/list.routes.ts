import { Router } from "express";
import {
  createCard,
  createList,
  getBoardsLists,
  getList,
  moveList,
  removeCard,
  updateName,
  updatePosition,
} from "../controllers/list.controller";

const listRouter = Router();

//list routes
listRouter.get("/:listId/list", getList);
listRouter.get("/:boardId", getBoardsLists);
listRouter.post("/:boardId", createList);
listRouter.patch("/:listId/name", updateName);
listRouter.patch("/:listId/move/:sourceId/:destinationId", moveList);
listRouter.patch("/:listId/position", updatePosition);

//card routes
listRouter.post("/:listId/card/add", createCard);
listRouter.delete("/:listId/card/:cardId", removeCard);

export default listRouter;
