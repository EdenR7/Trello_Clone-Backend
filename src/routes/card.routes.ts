import { Router } from "express";
import {
  addCardDates,
  addChecklistToArr,
  addMemberToArr,
  addTodoToArr,
  getCard,
  removeBgCover,
  removeChecklistFromArr,
  removeMemberFromArr,
  removeTodoFromArr,
  toggleTodoComplete,
  updateBgCoverColor,
  updateBgCoverState,
  updateCardTitle,
  updateTodoTitle,
} from "../controllers/card.controller";

const cardRouter = Router();

// cardRouter.post("/:listId", getCard);
cardRouter.get("/:cardId", getCard);

//Card background froutes
cardRouter.patch("/:cardId/bg/color", updateBgCoverColor);
cardRouter.patch("/:cardId/bg/state", updateBgCoverState);
cardRouter.delete("/:cardId/bg/remove", removeBgCover);

//Card title route
cardRouter.patch("/:cardId/title/edit", updateCardTitle);

//Member routes
cardRouter.post("/:cardId/member/add", addMemberToArr);
cardRouter.delete("/:cardId/member/remove", removeMemberFromArr);

//Date routes
cardRouter.post("/:cardId/date/add", addCardDates); //send an empty object {} if we want to delete

//Checklist routes
cardRouter.post("/:cardId/checklist/addChecklist", addChecklistToArr);
cardRouter.delete("/:cardId/checklist/removeChecklist", removeChecklistFromArr);
cardRouter.post("/:cardId/checklist/addTodo", addTodoToArr);
cardRouter.delete("/:cardId/checklist/removeTodo", removeTodoFromArr);
cardRouter.patch("/:cardId/checklist/updateTitle", updateTodoTitle);
cardRouter.patch("/:cardId/checklist/toggleComplete", toggleTodoComplete);
export default cardRouter;
