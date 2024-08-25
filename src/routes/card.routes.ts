import { Router } from "express";
import {
  addMemberToArr,
  editCardTitle,
  getCard,
  removeBgCover,
  removeMemberFromArr,
  updateBgCoverColor,
  updateBgCoverState,
} from "../controllers/card.controller";

const cardRouter = Router();

// cardRouter.post("/:listId", getCard);
cardRouter.get("/:cardId", getCard);

//Card background froutes
cardRouter.patch("/:cardId/bgColor", updateBgCoverColor);
cardRouter.patch("/:cardId/bgState", updateBgCoverState);
cardRouter.delete("/:cardId/remove", removeBgCover);

//Card title route
cardRouter.patch("/:cardId/editTitle", editCardTitle);

//Member routes
cardRouter.post("/:cardId/member/add", addMemberToArr);
cardRouter.delete("/:cardId/member/remove", removeMemberFromArr);

export default cardRouter;
