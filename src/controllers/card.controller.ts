import e, { NextFunction, Response } from "express";
import { AuthRequest } from "../types/auth.types";
import CardModel from "../models/card.model";
import { CustomError } from "../utils/errors/CustomError";
import ListModel from "../models/list.model";
import UserModel from "../models/user.model";

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
  const { cardId } = req.params;

  try {
    const card = await CardModel.findById(cardId);
    if (!card) throw new CustomError("Card not found", 404);
    res.status(200).json(card);
  } catch (error) {
    console.log("getCard error: ");
    next(error);
  }
}

export async function updateBgCoverColor(
  req: AuthRequest,
  res: Response,
  next: NextFunction
) {
  const { cardId } = req.params;
  const { color } = req.body;

  try {
    const card = await CardModel.findByIdAndUpdate(
      cardId,
      { $set: { "bgCover.bg": color } },
      { new: true, runValidators: true }
    );
    if (!card) throw new CustomError("card not found", 404);

    res.status(200).json(card);
  } catch (error) {
    console.log("updateBgCoverColor error:");
    next(error);
  }
}

export async function updateBgCoverState(
  req: AuthRequest,
  res: Response,
  next: NextFunction
) {
  const { cardId } = req.params;
  const { isCover } = req.body;

  if (typeof isCover !== "boolean") {
    return next(new CustomError("isCover must be a boolean", 400));
  }

  try {
    const card = await CardModel.findByIdAndUpdate(
      cardId,
      { $set: { "bgCover.isCover": isCover } },
      { new: true, runValidators: true }
    );

    if (!card) {
      throw new CustomError("Card not found", 404);
    }

    res.status(200).json(card);
  } catch (error) {
    console.error("updateBgCoverState error:", error);
    next(error);
  }
}

export async function removeBgCover(
  req: AuthRequest,
  res: Response,
  next: NextFunction
) {
  const { cardId } = req.params;

  try {
    const card = await CardModel.findByIdAndUpdate(
      cardId,
      {
        $set: { "bgCover.isCover": false, "bgCover.bg": "" },
      },
      { new: true, runValidators: true }
    );
    if (!card) {
      throw new CustomError("card not found", 404);
    }
    res.status(200).json(card);
  } catch (error) {
    console.log("removeBgCover error: ");
    next(error);
  }
}

export async function editCardTitle(
  req: AuthRequest,
  res: Response,
  next: NextFunction
) {
  const { cardId } = req.params;
  const { newTitle } = req.body;

  try {
    const card = await CardModel.findByIdAndUpdate(
      cardId,
      {
        title: newTitle,
      },
      { new: true, runValidators: true }
    );
    if (!card) {
      throw new CustomError("card not found", 404);
    }
    res.status(200).json(card);
  } catch (error) {
    console.log("editCardTitle error: ");
    next(error);
  }
}

export async function addMemberToArr(
  req: AuthRequest,
  res: Response,
  next: NextFunction
) {
  const { cardId } = req.params;
  const { memberId } = req.body;
  console.log(memberId);

  try {
    const member = await UserModel.findById(memberId);
    if (!member) {
      throw new CustomError("user not found", 404);
    }
    const card = await CardModel.findByIdAndUpdate(
      cardId,
      { $push: { members: memberId } },
      { new: true, runValidators: true }
    );
    if (!card) {
      throw new CustomError("card not found", 404);
    }
    res.status(200).json(card);
  } catch (error) {
    console.log("addMemberToArr error: ");
    next(error);
  }
}

export async function removeMemberFromArr(
  req: AuthRequest,
  res: Response,
  next: NextFunction
) {
  const { cardId } = req.params;
  const { memberId } = req.body;

  try {
    const member = await UserModel.findById(memberId);
    if (!member) {
      throw new CustomError("Memberr not found", 404);
    }

    const card = await CardModel.findById(cardId);
    if (!card) {
      throw new CustomError("Card not found", 404);
    }

    if (!card.members.includes(memberId)) {
      return res.status(400).json({ message: "Member is not in this card." });
    }

    const updatedCard = await CardModel.findByIdAndUpdate(
      cardId,
      { $pull: { members: memberId } },
      { new: true, runValidators: true }
    );

    res.status(200).json(updatedCard);
  } catch (error) {
    console.log("removeMemberFromArr error: ", error);
    next(error);
  }
}