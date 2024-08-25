import { NextFunction, Response } from "express";
import { AuthRequest } from "../types/auth.types";
import BoardModel from "../models/board.model";
import { CustomError } from "../utils/errors/CustomError";
import UserModel from "../models/user.model";
import { startSession, Types } from "mongoose";
import ListModel from "../models/list.model";
import { AuthRequestWithBoard, BoardI } from "../types/board.types";

function VALIDATE_USER(req: AuthRequest) {
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
  req: AuthRequestWithBoard,
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
    });
    if (!board) throw new CustomError("Board not found", 404);
    await addMembersDetails(board);

    req.board = board;
    next();
    // res.status(200).json(board);
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

    const board = new BoardModel({ name, admin: req.userId });
    await board.save();
    addMembersDetails(board);
    res.status(201).json(board);
  } catch (error) {
    console.log("createBoard error: ");
    next(error);
  }
}

// still not using sortBoardLists
export async function updateBoardBg(
  req: AuthRequestWithBoard,
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
  req: AuthRequestWithBoard,
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
    ).populate({
      path: "lists",
      model: "List",
    });
    if (!board) throw new CustomError("Board not found", 404);
    req.board = board;
    next();
    // res.status(200).json(board);
  } catch (error) {
    console.log("archiveList error: ");
    next(error);
  }
}

export async function unArchiveList(
  req: AuthRequestWithBoard,
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
    });
    if (!board) throw new CustomError("Board not found", 404);

    await reOrderListsPositions(board);

    req.board = board;
    next();
    // res.status(200).json(board);
  } catch (error) {
    console.log("unArchiveList error: ");
    next(error);
  }
}

export async function reOrderListsPositions(board: BoardI) {
  try {
    if (!board.lists || board.lists.length === 0) return;
    board.lists.sort((a: any, b: any) => a.position - b.position);

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
