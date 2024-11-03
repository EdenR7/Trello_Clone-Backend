// import { VALIDATE_USER } from "../controllers/board.controller";
import { Type } from "typescript";
import BoardModel from "../models/board.model";
import CardModel from "../models/card.model";
import ListModel from "../models/list.model";
import { AuthRequest } from "../types/auth.types";
import { BoardI } from "../types/board.types";
import { LabelI } from "../types/label.types";
import { CustomError } from "./errors/CustomError";
import { Types } from "mongoose";
import { ListI } from "../types/list.types";
import LabelModel from "../models/label.model";

// export async function reOrderListsPositions(board: BoardI) {
//   try {
//     if (!board.lists || board.lists.length === 0) return;

//     for (let idx = 0; idx < board.lists.length; idx++) {
//       const list = board.lists[idx];
//       const reMakeList = await ListModel.findByIdAndUpdate(
//         list._id,
//         { position: idx + 1 },
//         { new: true }
//       );
//       if (!reMakeList) throw new CustomError("List not found", 404);
//     }
//   } catch (error) {
//     throw new CustomError("Error reordering lists", 500);
//   }
// }
// export async function addLabelToBoard(req: AuthRequest, boardId: string) {
//   const { title, color } = req.body;
//   if (!title || !color)
//     throw new CustomError("title and color are required", 400);
//   try {
//     const board = await BoardModel.findOne({
//       _id: boardId,
//       ...VALIDATE_USER(req),
//     });
//     if (!board) throw new CustomError("Board not found", 404);

//     const labelExist = board.labels.find(
//       (label: LabelI) => label.title === title && label.color === color
//     );
//     if (labelExist) return;

//     board.labels.push({ title, color } as LabelI);
//     await board.save();
//     return board;
//   } catch (error) {
//     console.log("addLabelToBoard error: ", error);
//     throw new CustomError("Error In addLabelToBoard", 500);
//   }
// }

// export async function updateLabelOnBoard(
//   req: AuthRequest,
//   boardId: string,
//   labelId: string
// ) {
//   // const { labelId } = req.params;
//   try {
//     // if (!title && !color)
//     //   throw new CustomError("At least one of title or color is required", 400);

//     // const updateFields: any = {};
//     // if (title) updateFields["labels.$.title"] = title;
//     // if (color) updateFields["labels.$.color"] = color;

//     const board = await BoardModel.findOneAndUpdate(
//       {
//         _id: boardId,
//         labels: labelId,
//         ...VALIDATE_USER(req),
//       },
//       { $set: updateFields },
//       { new: true }
//     );
//     if (!board) throw new CustomError("Board not found", 404);

//     //udpdate also the cards that have this label
//     await CardModel.updateMany(
//       { "labels._id": labelId },
//       { $set: updateFields }
//     );

//     return board;
//   } catch (error) {
//     console.log("updateLabelOnBoard error: ");
//     console.log(error);

//     throw new CustomError("Error In updateLabelOnBoard", 500);
//   }
// }

export function VALIDATE_USER(req: AuthRequest) {
  return {
    $or: [
      { admin: (req as AuthRequest).userId },
      { "members.memberId": req.userId },
      { members: { $elemMatch: { memberId: req.userId } } },
    ],
  };
}
export async function reOrderListsPositions(
  boardId: string | Types.ObjectId
  // documentsToChange: number
) {
  try {
    const lists = await ListModel.find({
      board: boardId,
      isArchived: false,
    }).sort({
      position: 1,
    });
    if (!lists) throw new Error();

    const adjustedLists = [];

    for (let idx = 0; idx < lists.length; idx++) {
      const list = lists[idx];

      const reMakeList = await ListModel.findByIdAndUpdate(
        list._id,
        { $set: { position: idx + 1 } },
        { new: true }
      );
      console.log(reMakeList);

      adjustedLists.push(reMakeList);
    }
    return adjustedLists;
  } catch (error) {
    console.log("reOrderListsPositions error: ", error);
    throw new CustomError("Error reordering lists", 500);
  }
}
export async function addCardsToLists(sortedLists: ListI[]) {
  try {
    for (let list of sortedLists) {
      (list as any).cards = await CardModel.find({
        list: list._id,
        isArchived: false,
      }).sort({
        position: 1,
      });
    }
  } catch (error) {
    throw new CustomError("Error adding cards to lists", 500);
  }
}
export async function reOrderCardsPositions(listId: string | Types.ObjectId) {
  try {
    const cards = await CardModel.find({ list: listId }).sort({
      position: 1,
    });
    if (!cards) throw new Error();

    const adjustedCards = [];

    for (let idx = 0; idx < cards.length; idx++) {
      const card = cards[idx];

      const reMakeCard = await CardModel.findByIdAndUpdate(
        card._id,
        { $set: { position: idx + 1 } },
        { new: true }
      );
      // if (!reMakeCard) throw new CustomError("Card not found", 404);
      adjustedCards.push(reMakeCard);
    }
    return adjustedCards;
  } catch (error) {
    console.log("reOrderCardsPositions error: ", error);
    throw new CustomError("Error reordering cards", 500);
  }
}
export function countDecimalPlaces(number: string) {
  const numStr = number.toString();
  if (numStr.includes(".")) {
    return numStr.split(".")[1].length;
  }
  return 0;
}

const defaultLabels = [
  { title: "1", color: "#baf3db" },
  { title: "2", color: "#f8e6a0" },
  { title: "3", color: "#e2b203" },
  { title: "4", color: "#cce0ff" },
  { title: "5", color: "#fdd0ec" },
  { title: "6", color: "#1d7f8c" },
];

export async function createLabels(labels = [...defaultLabels]) {
  const createdLabels: LabelI[] = [];
  await Promise.all(
    labels.map(async (label) => {
      const newLabel = new LabelModel(label);
      await newLabel.save();
      createdLabels.push(newLabel);
    })
  );
  return createdLabels;
}
