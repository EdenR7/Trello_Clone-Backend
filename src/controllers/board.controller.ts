import { NextFunction, Response } from "express";
import { AuthRequest } from "../types/auth.types";
import BoardModel from "../models/board.model";
import { CustomError } from "../utils/errors/CustomError";
import UserModel from "../models/user.model";
import { startSession, Types } from "mongoose";
import ListModel from "../models/list.model";
import { BoardI } from "../types/board.types";
import { ListI } from "../types/list.types";
import {
  addLabelToBoard,
  reOrderListsPositions,
  updateLabelOnBoard,
} from "../utils/boardUtilFuncs";
import { LabelI } from "../types/label.types";
import CardModel from "../models/card.model";
import { BoardSubDocumentI } from "../types/subDocument.types";

export function VALIDATE_USER(req: AuthRequest) {
  return {
    $or: [
      { admin: (req as AuthRequest).userId },
      { "members.memberId": req.userId },
    ],
  };
}
async function addMembersDetails(board: any) {
  board.membersDetails = [];
  await Promise.all(
    board.members.map(async (member: any, idx: number) => {
      const user = await UserModel.findById(member.memberId);
      if (user) {
        board.membersDetails[idx] = {
          memberId: user._id,
          firstName: user.firstName,
          lastName: user.lastName,
          username: user.username,
        };
      }
    })
  );
}

export async function getBoard(
  req: AuthRequest,
  res: Response,
  next: NextFunction
) {
  try {
    const board = await BoardModel.findOne({
      _id: req.params.id,
      ...VALIDATE_USER(req),
    }).populate({
      path: "lists",
      model: "List",
      options: { sort: { position: 1 } },
    });

    if (!board) throw new CustomError("Board not found", 404);
    // await addMembersDetails(board);
    const user = await UserModel.findById(req.userId);
    if (!user) throw new CustomError("User not found", 404);

    const recBoardIndex = user.recentBoards.findIndex(
      (b: BoardSubDocumentI) => b.boardId.toString() === board._id.toString()
    );
    if (recBoardIndex > -1) {
      user.recentBoards.splice(recBoardIndex, 1);
    }
    await user.save();
    await UserModel.findByIdAndUpdate(
      req.userId,
      {
        $push: {
          recentBoards: {
            $each: [
              { boardId: board._id, name: board.name, boardBg: board.bg },
            ],
            $position: 0,
            $slice: 5,
          },
        },
      },
      { new: true, runValidators: true }
    );

    res.status(200).json(board);
  } catch (error) {
    console.log("getBoard error: ");
    next(error);
  }
}

export async function createBoard(
  req: AuthRequest,
  res: Response,
  next: NextFunction
) {
  //get also bg
  const { name } = req.body;
  try {
    if (!name) throw new CustomError("Name is required", 400);
    const boardExists = await BoardModel.findOne({ name, admin: req.userId });
    if (boardExists) throw new CustomError("Board name already exists", 400);

    const board = new BoardModel({
      name,
      admin: req.userId,
      members: [req.userId],
      labels: [
        { title: "Default", color: "#61bd4f" },
        { title: "Default", color: "#f2d600" },
        { title: "Default", color: "#ff9f1a" },
        { title: "Default", color: "#eb5a46" },
        { title: "Default", color: "#c377e0" },
        { title: "Default", color: "#0079bf" },
      ],
    });
    await board.save();
    // addMembersDetails(board);
    res.status(201).json(board);
  } catch (error) {
    console.log("createBoard error: ");
    next(error);
  }
}

export async function deleteBoard(
  req: AuthRequest,
  res: Response,
  next: NextFunction
) {
  try {
    const board = await BoardModel.findOneAndDelete({
      _id: req.params.id,
      admin: req.userId,
    });
    if (!board) throw new CustomError("Board not found", 404);
    res.status(200).json({ message: "Board deleted" });
  } catch (error) {
    console.log("deleteBoard error: ");
    next(error);
  }
}

// still not using sortBoardLists
export async function updateBoardBg(
  req: AuthRequest,
  res: Response,
  next: NextFunction
) {
  const { bg } = req.body;
  try {
    if (!bg) throw new CustomError("Background is required", 400);
    const board = await BoardModel.findOneAndUpdate(
      {
        _id: req.params.id,
        ...VALIDATE_USER(req),
      },
      { bg },
      { new: true }
    );
    if (!board) throw new CustomError("Board not found", 404);
    addMembersDetails(board);
    res.status(200).json(board);
  } catch (error) {
    console.log("updateBoardBg error: ");
    next(error);
  }
}
// still not using sortBoardLists

export async function addMember(
  req: AuthRequest,
  res: Response,
  next: NextFunction
) {
  const { memberName } = req.body;
  try {
    if (!memberName) throw new CustomError("Member Name is required", 400);

    const member = await UserModel.findOne({ username: memberName });
    if (!member) throw new CustomError("Member not found", 404);

    const newMemberId = member._id;
    console.log("newMemberId: ", newMemberId);

    const board = await BoardModel.findOneAndUpdate(
      {
        _id: req.params.id,
        ...VALIDATE_USER(req),
      },
      { $push: { members: newMemberId } },
      { new: true }
    );
    if (!board) throw new CustomError("Board not found", 404);

    res.status(200).json(board);
  } catch (error) {
    console.log("addMember error: ");
    next(error);
  }
}
// still not using sortBoardLists

export async function removeMember(
  req: AuthRequest,
  res: Response,
  next: NextFunction
) {
  const { memberName } = req.body;
  try {
    if (!memberName) throw new CustomError("Member Name is required", 400);

    const member = await UserModel.findOne({ username: memberName });
    if (!member) throw new CustomError("Member not found", 404);

    const memberToRemoveId = member._id;
    console.log("memberToRemoveId: ", memberToRemoveId);

    const board = await BoardModel.findOneAndUpdate(
      {
        _id: req.params.id,
        ...VALIDATE_USER(req),
      },
      { $pull: { members: memberToRemoveId } },
      { new: true }
    );
    if (!board) throw new CustomError("Board not found", 404);

    res.status(200).json(board);
  } catch (error) {
    console.log("removeMember error: ");
    next(error);
  }
}
// still not using sortBoardLists

export async function updateDescription(
  req: AuthRequest,
  res: Response,
  next: NextFunction
) {
  const { description } = req.body;
  try {
    if (!description && description !== "")
      throw new CustomError("Description is required", 400);
    const board = await BoardModel.findOneAndUpdate(
      {
        _id: req.params.id,
        ...VALIDATE_USER(req),
      },
      { description },
      { new: true }
    );
    if (!board) throw new CustomError("Board not found", 404);
    res.status(200).json(board);
  } catch (error) {
    console.log("updateDescription error: ");
    next(error);
  }
}
// still not using sortBoardLists
export async function updateName(
  req: AuthRequest,
  res: Response,
  next: NextFunction
) {
  const { name } = req.body;
  try {
    if (!name) throw new CustomError("Name is required", 400);
    const board = await BoardModel.findOneAndUpdate(
      {
        _id: req.params.id,
        ...VALIDATE_USER(req),
      },
      { name },
      { new: true }
    );
    if (!board) throw new CustomError("Board not found", 404);
    res.status(200).json(board);
  } catch (error) {
    console.log("updateName error: ");
    next(error);
  }
}
// still not using sortBoardLists
export async function createList(
  req: AuthRequest,
  res: Response,
  next: NextFunction
) {
  const { id } = req.params;
  const { name } = req.body;
  const session = await startSession();
  session.startTransaction();
  try {
    const board = await BoardModel.findById(id).session(session);
    if (!board) throw new CustomError("Board not found", 404);

    const listPosition = board.lists.length + 1;
    const newList = await ListModel.create([{ name, position: listPosition }], {
      session,
    });

    console.log("newList: ", newList);

    board.lists.push(newList[0]._id);
    await board.save({ session });
    await session.commitTransaction();
    session.endSession();
    res.status(201).json(newList[0]);
  } catch (error) {
    session.endSession();
    console.log("createList error: ");
    next(error);
  }
}

export async function archiveList(
  req: AuthRequest,
  res: Response,
  next: NextFunction
) {
  const { listId } = req.params;

  const listobjectId = new Types.ObjectId(listId);

  try {
    const list = await ListModel.findById(listobjectId);
    if (!list) throw new CustomError("List not found", 404);

    const board = await BoardModel.findOneAndUpdate(
      {
        _id: req.params.id,
        lists: listId,
        ...VALIDATE_USER(req),
      },
      {
        $pull: { lists: listobjectId },
        $push: { archivedLists: { listId: listobjectId, name: list.name } },
      },
      { new: true, runValidators: true }
    );
    if (!board) throw new CustomError("Board not found", 404);
    // req.board = board;
    // next();
    res.status(200).json(board);
  } catch (error) {
    console.log("archiveList error: ");
    next(error);
  }
}

export async function unArchiveList(
  req: AuthRequest,
  res: Response,
  next: NextFunction
) {
  const { listId } = req.params;
  const listobjectId = new Types.ObjectId(listId);

  try {
    const newPosition = 10000;
    await ListModel.findByIdAndUpdate(
      listobjectId,
      { position: newPosition },
      { new: true }
    );

    const board = await BoardModel.findOneAndUpdate(
      {
        _id: req.params.id,
        "archivedLists.listId": listobjectId,
        ...VALIDATE_USER(req),
      },
      {
        $pull: { archivedLists: { listId: listobjectId } },
        $push: { lists: listobjectId },
      },
      { new: true, runValidators: true }
    ).populate({
      path: "lists",
      model: "List",
      options: { sort: { position: 1 } },
    });
    if (!board) throw new CustomError("Board not found", 404);

    await reOrderListsPositions(board);
    const adjustedBoard = await BoardModel.findById(req.params.id).populate({
      path: "lists",
      model: "List",
      options: { sort: { position: 1 } },
    });

    res.status(200).json(adjustedBoard);
  } catch (error) {
    console.log("unArchiveList error: ");
    next(error);
  }
}

export async function createBoardLabel(
  req: AuthRequest,
  res: Response,
  next: NextFunction
) {
  try {
    const board = await addLabelToBoard(req, req.params.id);
    if (!board) res.status(200).json({ message: "Label already exists" });
    res.status(200).json(board);
  } catch (error) {
    console.log("createBoardsLabel error: ");
    next(error);
  }
}

export async function updateBoardLabel(
  req: AuthRequest,
  res: Response,
  next: NextFunction
) {
  const { labelId, id } = req.params;
  try {
    const board = await updateLabelOnBoard(req, id, labelId);

    res.status(200).json(board);
  } catch (error) {
    console.log("updateBoardLabel error: ");
    next(error);
  }
}

export async function deleteBoardLabel(
  req: AuthRequest,
  res: Response,
  next: NextFunction
) {
  const { labelId } = req.params;
  try {
    const board = await BoardModel.findOneAndUpdate(
      {
        _id: req.params.id,
        ...VALIDATE_USER(req),
      },
      { $pull: { labels: { _id: labelId } } },
      { new: true }
    );
    if (!board) throw new CustomError("Board not found", 404);
    // Delete from cards
    await CardModel.updateMany(
      { "labels._id": labelId },
      { $pull: { labels: labelId } }
    );
    res.status(200).json(board);
  } catch (error) {
    console.log("deleteBoardLabel error: ");
    next(error);
  }
}
