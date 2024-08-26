import { Router } from "express";
import {
  createCard,
  createList,
  getList,
  removeCard,
  updateName,
} from "../controllers/list.controller";

const listRouter = Router();

//list routes
listRouter.post("/:boardId", createList);
listRouter.get("/:listId/", getList);
listRouter.post("/:listId/", updateName);

//card routes
listRouter.post("/:listId/card/add", createCard);
listRouter.delete("/:listId/card/remove", removeCard);

export default listRouter;
