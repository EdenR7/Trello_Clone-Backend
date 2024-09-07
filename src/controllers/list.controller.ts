import { NextFunction, Response } from "express";
import { AuthRequest } from "../types/auth.types";
import { CustomError } from "../utils/errors/CustomError";
import CardModel from "../models/card.model";
import ListModel from "../models/list.model";
import mongoose, { startSession, Types } from "mongoose";
import BoardModel from "../models/board.model";
import {
  countDecimalPlaces,
  reOrderListsPositions,
  VALIDATE_USER,
} from "../utils/boardUtilFuncs";
import { CardI } from "../types/card.types";

export async function createList(
  req: AuthRequest,
  res: Response,
  next: NextFunction
) {
  const { boardId } = req.params;
  const { name } = req.body;

  if (!name) {
    return next(new CustomError("Name is required", 400));
  }
  const session = await startSession();
  try {
    session.startTransaction();

    const [board, lists] = await Promise.all([
      BoardModel.findOneAndUpdate(
        { _id: boardId, ...VALIDATE_USER(req) },
        { $inc: { listsNumber: 1 } },
        { session, new: true }
      ),
      ListModel.find({
        board: boardId,
        isArchived: false,
      }),
    ]);

    if (!board || !lists) {
      throw new CustomError("Board not found", 404);
    }

    let maxPos = 0;
    lists.forEach((list) => {
      if (list.position > maxPos) maxPos = list.position;
    });

    const list = new ListModel({
      name,
      board: boardId,
      position: Math.floor(maxPos + 1),
    });
    await list.save({ session });
    await session.commitTransaction();

    res.status(201).json(list);
  } catch (error) {
    await session.abortTransaction();
    console.error("createList error:", error);
    next(error);
  } finally {
    session.endSession();
  }
}

export async function getBoardsLists(
  req: AuthRequest,
  res: Response,
  next: NextFunction
) {
  const { boardId } = req.params;
  try {
    const lists = await ListModel.find({ board: boardId, isArchived: false })
      .populate({
        path: "cards",
        match: { isArchived: false },
        options: { sort: { position: 1 } },
        populate: {
          path: "labels", // Populate the labels in the cards
          model: "Label", // Reference to the Label model
        },
      })
      .sort({ position: 1 });

    if (!lists) throw new CustomError("Lists not found", 404);

    return res.status(200).json(lists);
  } catch (error) {
    console.log("getBoardsLists error: ");
    next(error);
  }
}

export async function getList(
  req: AuthRequest,
  res: Response,
  next: NextFunction
) {
  const { listId } = req.params;
  try {
    const list = await ListModel.findById(listId).populate({
      path: "cards",
      match: { isArchived: false },
      options: { sort: { position: 1 } },
    });

    if (list) {
      await list.populate({
        path: "cards.labels",
        model: "Label",
      });
    }

    if (!list) {
      throw new CustomError("List not found", 404);
    }
    res.status(200).json(list);
  } catch (error) {
    console.log("getList error: ", error);
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

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    if (!title) throw new CustomError("Title is required", 400);

    const newCardList = await ListModel.findById(listId).populate({
      path: "cards",
      select: "position",
    });
    if (!newCardList) throw new CustomError("List not found", 404);

    let cardPosition = 0;
    newCardList.cards.forEach((card: any) => {
      if (card.position > cardPosition) cardPosition = card.position;
    });

    cardPosition = Math.floor(cardPosition + 1);

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

    res.status(201).json(newCard);
  } catch (error) {
    // If any error occurs, abort the transaction
    await session.abortTransaction();
    console.error("Error in createCard function:", error);
    next(error);
  } finally {
    session.endSession();
  }
}

export async function removeCard(
  req: AuthRequest,
  res: Response,
  next: NextFunction
) {
  const { listId, cardId } = req.params;
  console.log(listId, cardId);

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
      throw new CustomError("List not found", 404);
    }

    await CardModel.findByIdAndDelete(cardId, { session });

    await session.commitTransaction();

    res.status(200).json(list);
  } catch (error) {
    await session.abortTransaction();
    console.error("deleteCard error:", error);
    next(error);
  } finally {
    session.endSession();
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

export async function updatePosition(
  req: AuthRequest,
  res: Response,
  next: NextFunction
) {
  const { listId } = req.params;
  const { newPosition } = req.body;

  try {
    if (!newPosition) throw new CustomError("New position is required", 400);

    const list = await ListModel.findByIdAndUpdate(
      listId,
      { position: newPosition },
      { new: true, runValidators: true }
    );
    if (!list) {
      throw new CustomError("List not found", 404);
    }
    if (countDecimalPlaces(newPosition) > 10) {
      await reOrderListsPositions(list.board);
      const reorderedlists = await ListModel.find({
        board: list.board,
        isArchived: false,
      });
      // await reOrderListsPositions(list.board);
      // const reorderedlists = await ListModel.find({
      //   board: list.board,
      //   isArchived: false,
      // }).populate({
      //   path: "cards",
      //   match: { isArchived: false },
      //   options: { sort: { position: 1 } },
      // });
      // console.log(reorderedlists);

      return res.status(200).json(reorderedlists);
    }

    res.status(200).json(list);
  } catch (error) {
    console.log("updatePosition error: ");
    next(error);
  }
}

export async function moveList(
  req: AuthRequest,
  res: Response,
  next: NextFunction
) {
  console.log(1);

  const { sourceId, destinationId, listId } = req.params;
  const { newIndex } = req.body;

  const session = await startSession();
  try {
    session.startTransaction();

    if (sourceId !== destinationId) {
      const sourceBoard = await BoardModel.findByIdAndUpdate(
        sourceId,
        {
          $inc: { listsNumber: -1 },
        },
        { session, new: true }
      );
      const destinationBoard = await BoardModel.findByIdAndUpdate(
        destinationId,
        {
          $inc: { listsNumber: 1 },
        },
        { session, new: true }
      );
      if (!sourceBoard || !destinationBoard) {
        throw new CustomError("Board not found", 404);
      }
    }

    const destBoardLists = await ListModel.find({
      board: destinationId,
      isArchived: false,
    }).sort({ position: 1 });

    let updatedList;

    if (!destBoardLists) {
      throw new CustomError("Destination board lists not found", 404);
    }
    // list pos handling
    if (destBoardLists.length === 0) {
      // empty board
      updatedList = await ListModel.findByIdAndUpdate(
        listId,
        {
          board: destinationId,
          position: 1,
        },
        { session }
      );
    } else if (newIndex === 1) {
      // insert at the top
      updatedList = await ListModel.findByIdAndUpdate(
        listId,
        {
          board: destinationId,
          position: destBoardLists[0].position / 2,
        },
        { session }
      );
    } else if (newIndex >= destBoardLists.length) {
      // insert at the bottom
      updatedList = await ListModel.findByIdAndUpdate(
        listId,
        {
          board: destinationId,
          position: Math.floor(
            destBoardLists[destBoardLists.length - 1].position + 1
          ),
        },
        { session }
      );
    } else {
      //middle
      let updatedBoards = [...destBoardLists];
      if (sourceId === destinationId) {
        updatedBoards = destBoardLists.filter(
          (list) => list._id.toString() === listId
        );
      }
      const newPos =
        (destBoardLists[newIndex - 1].position +
          destBoardLists[newIndex].position) /
        2;
      updatedList = await ListModel.findByIdAndUpdate(
        listId,
        { board: destinationId, position: newPos },
        { session, new: true }
      );
    }

    if (!updatedList) {
      throw new CustomError("List not found", 404);
    }

    console.log(updatedList);
    await session.commitTransaction();

    return res.status(200).json(updatedList);
  } catch (error) {
    session.abortTransaction();
    console.log("moveList error: ");
    next(error);
  } finally {
    session.endSession();
  }
}
