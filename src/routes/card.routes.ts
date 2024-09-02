import { Router } from "express";
import {
  addCardDates,
  addChecklistToArr,
  addMemberToArr,
  addTodoToArr,
  changeCardDescription,
  getCard,
  moveCardBetweenLists,
  moveCardInList,
  removeBgCover,
  removeChecklistFromArr,
  removeMemberFromArr,
  removeTodoFromArr,
  toggleCardIsComplete,
  toggleLabelOnCard,
  toggleTodoComplete,
  updateBgCoverColor,
  updateBgCoverState,
  updateCardTitle,
  updateChecklistTitle,
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
cardRouter.delete("/:cardId/member/remove/:memberId", removeMemberFromArr);

//Date routes
cardRouter.post("/:cardId/date/add", addCardDates); //send an empty object {} if we want to delete

//Checklist routes
cardRouter.post("/:cardId/checklist/addChecklist", addChecklistToArr);
cardRouter.delete("/:cardId/checklist/:checklistId", removeChecklistFromArr);
cardRouter.patch(
  "/:cardId/checklist/updateChecklistTitle",
  updateChecklistTitle
);
cardRouter.post("/:cardId/checklist/addTodo", addTodoToArr);
cardRouter.patch("/:cardId/checklist/removeTodo", removeTodoFromArr);
cardRouter.patch("/:cardId/checklist/updateTitle", updateTodoTitle);
cardRouter.patch("/:cardId/checklist/toggleComplete", toggleTodoComplete);

//Label routes
cardRouter.patch("/:cardId/label/toggle", toggleLabelOnCard);

cardRouter.patch("/:cardId/description", changeCardDescription);

cardRouter.patch("/:cardId/position", moveCardInList);
cardRouter.patch("/:cardId/list/position/:listId", moveCardBetweenLists);

cardRouter.patch("/:cardId/toggleComplete", toggleCardIsComplete);

export default cardRouter;
