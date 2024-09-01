import { Router } from "express";
import {
  createCard,
  createList,
  getBoardsLists,
  getList,
  removeCard,
  updateName,
  updatePosition,
} from "../controllers/list.controller";

const listRouter = Router();

//list routes
listRouter.get("/:listId/list", getList);
listRouter.get("/:boardId", getBoardsLists);
listRouter.post("/:boardId", createList);
listRouter.post("/:listId", updateName);
listRouter.patch("/:listId/position", updatePosition);

//card routes
listRouter.post("/:listId/card/add", createCard);
listRouter.delete("/:listId/card/:cardId", removeCard);

export default listRouter;
