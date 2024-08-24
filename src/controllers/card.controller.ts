import { NextFunction, Response } from "express";
import { AuthRequest } from "../types/auth.types";
import CardModel from "../models/card.model";
import { CustomError } from "../utils/errors/CustomError";
import ListModel from "../models/list.model";

// export async function createCard(
//   req: AuthRequest,
//   res: Response,
//   next: NextFunction
// ) {
//   const { listId } = req.params;
//   const { title } = req.body;
//   if (!title) throw new CustomError("Title is required", 400);

//   try {
//     const newCardList = await ListModel.findById(listId);
//     if (!newCardList) throw new CustomError("List not found", 404);

//     const cardPosition = newCardList.cards.length + 1;

//     const newCard = new CardModel({
//       title,
//       admin: req.userId,
//       position: cardPosition,
//     });
//     await newCard.save();
//     res.status(201).json(newCard);
//   } catch (error) {
//     console.log("createCard error: ");
//     next(error);
//   }
// }

export async function getCard(
  req: AuthRequest,
  res: Response,
  next: NextFunction
) {
  const { id } = req.params;
  try {
    const card = await CardModel.findById(id);
    if (!card) throw new CustomError("Card not found", 404);
    res.status(200).json(card);
  } catch (error) {
    console.log("getCard error: ");
    next(error);
  }
}
