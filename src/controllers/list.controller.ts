import { NextFunction, Response } from "express";
import { AuthRequest } from "../types/auth.types";
import { CustomError } from "../utils/errors/CustomError";
import CardModel from "../models/card.model";
import ListModel from "../models/list.model";
import mongoose, { Types } from "mongoose";

export async function getList(
  req: AuthRequest,
  res: Response,
  next: NextFunction
) {
  const { listId } = req.params;
  try {
    const list = await ListModel.findById(listId);
    if (!list) {
      throw new CustomError("List not found", 404);
    }
    res.status(200).json(list);
  } catch (error) {
    console.log("getList error: ");
    next(error);
  }
}

export async function createCard(
  req: AuthRequest,
  res: Response,
  next: NextFunction
) {
  const { listId } = req.params;
  const { title } = req.body;

  if (!title) throw new CustomError("Title is required", 400);

  // Start a session
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const newCardList = await ListModel.findById(listId).session(session);
    if (!newCardList) throw new CustomError("List not found", 404);

    const cardPosition = newCardList.cards.length + 1;

    const newCard = new CardModel({
      title,
      admin: req.userId,
      list: listId,
      position: cardPosition,
    });

    // Save the new card and add it to the list's cards array in the transaction session
    await newCard.save({ session });
    newCardList.cards.push(newCard._id as Types.ObjectId);
    await newCardList.save({ session });

    // Commit the transaction
    await session.commitTransaction();
    session.endSession();

    res.status(201).json(newCard);
  } catch (error) {
    // If any error occurs, abort the transaction
    await session.abortTransaction();
    session.endSession();
    console.error("Error in createCard function:", error);
    next(error);
  }
}

export async function removeCard(
  req: AuthRequest,
  res: Response,
  next: NextFunction
) {
  const { listId } = req.params;
  const { cardId } = req.body;

  if (!listId || !cardId) {
    return next(new CustomError("listId and cardId must be provided", 400));
  }
  const session = await mongoose.startSession();
  try {
    session.startTransaction();

    const list = await ListModel.findByIdAndUpdate(
      listId,
      { $pull: { cards: cardId } },
      { new: true, runValidators: true, session }
    );

    if (!list) {
      await session.abortTransaction();
      session.endSession();
      throw new CustomError("List not found", 404);
    }

    await CardModel.findByIdAndDelete(cardId, { session });

    await session.commitTransaction();
    session.endSession();

    res.status(200).json(list);
  } catch (error) {
    if (session) {
      await session.abortTransaction();
      session.endSession();
    }
    console.error("deleteCard error:", error);
    next(error);
  }
}

export async function updateName(
  req: AuthRequest,
  res: Response,
  next: NextFunction
) {
  const { listId } = req.params;
  const { newName } = req.body;

  try {
    const list = await ListModel.findByIdAndUpdate(
      listId,
      { name: newName },
      { new: true, runValidators: true }
    );
    if (!list) {
      throw new CustomError("List not found", 404);
    }
    res.status(200).json(list);
  } catch (error) {
    console.log("updatename error: ");
    next(error);
  }
}
