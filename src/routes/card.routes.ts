import { Router } from "express";
import { getCard } from "../controllers/card.controller";

const cardRouter = Router();

// cardRouter.post("/:listId", getCard);
cardRouter.get("/:id", getCard);

export default cardRouter;
