import { VALIDATE_USER } from "../controllers/board.controller";
import BoardModel from "../models/board.model";
import CardModel from "../models/card.model";
import ListModel from "../models/list.model";
import { AuthRequest } from "../types/auth.types";
import { BoardI } from "../types/board.types";
import { LabelI } from "../types/label.types";
import { CustomError } from "./errors/CustomError";

export async function reOrderListsPositions(board: BoardI) {
  try {
    if (!board.lists || board.lists.length === 0) return;

    for (let idx = 0; idx < board.lists.length; idx++) {
      const list = board.lists[idx];
      const reMakeList = await ListModel.findByIdAndUpdate(
        list._id,
        { position: idx + 1 },
        { new: true }
      );
      if (!reMakeList) throw new CustomError("List not found", 404);
    }
  } catch (error) {
    throw new CustomError("Error reordering lists", 500);
  }
}
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
