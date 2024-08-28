import { NextFunction, Response } from "express";
import { AuthRequest } from "../types/auth.types";
import BoardModel from "../models/board.model";
import { CustomError } from "../utils/errors/CustomError";
import UserModel from "../models/user.model";
import { startSession, Types } from "mongoose";
import ListModel from "../models/list.model";
import {
  addCardsToLists,
  reOrderCardsPositions,
  reOrderListsPositions,
  VALIDATE_USER,
} from "../utils/boardUtilFuncs";
import { LabelI } from "../types/label.types";
import CardModel from "../models/card.model";
import LabelModel from "../models/label.model";
import { ListI } from "../types/list.types";
import WorkspaceModel from "../models/workspace.model";

export async function getBoard(
  req: AuthRequest,
  res: Response,
  next: NextFunction
) {
  try {
    const board = await BoardModel.findOne({
      _id: req.params.id,
      ...VALIDATE_USER(req),
    }).populate("labels");
    if (!board) throw new CustomError("Board not found", 404);

    // const [lists, user] = await Promise.all([
    //   ListModel.find({ board: board._id, isArchived: false }).sort({
    //     position: 1,
    //   }),
    //   // update recentBoards
    //   UserModel.findByIdAndUpdate(
    //     req.userId,
    //     {
    //       $pull: { recentBoards: { boardId: board._id } },
    //     },
    //     { new: true }
    //   ),
    // ]);

    // if (!lists) throw new CustomError("Lists not found", 404);

    // // populate the cards manually
    // await addCardsToLists(lists);

    const user = await UserModel.findByIdAndUpdate(
      req.userId,
      {
        $pull: { recentBoards: board._id },
      },
      { new: true }
    );

    if (!user) throw new CustomError("User not found", 404);
    // update recentBoards
    await UserModel.findByIdAndUpdate(
      req.userId,
      {
        $push: {
          recentBoards: {
            $each: [board._id],
            $position: 0,
            $slice: 7,
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
  const session = await startSession();
  try {
    if (!name) throw new CustomError("Name is required", 400);
    const boardExists = await BoardModel.findOne({ name, admin: req.userId });
    if (boardExists) throw new CustomError("Board name already exists", 400);

    const defaultLabels: LabelI[] = await LabelModel.find({ title: "Default" });
    if (!defaultLabels || !defaultLabels.length)
      throw new CustomError("Default Labels not found", 404);
    const defaultLabelsIds = defaultLabels.map((label: LabelI) => label._id);

    const board = new BoardModel({
      name,
      admin: req.userId,
      members: [req.userId],
      labels: [...defaultLabelsIds],
    });
    session.startTransaction();
    await board.save({ session });

    const workspace = await WorkspaceModel.findOneAndUpdate(
      { _id: req.params.workspaceId, ...VALIDATE_USER },
      {
        $push: {
          boards: board._id,
        },
      },
      { session }
    );
    if (!workspace) throw new CustomError("Workspace not found", 404);
    await session.commitTransaction();
    res.status(201).json(board);
  } catch (error) {
    session.abortTransaction();
    console.log("createBoard error: ");
    next(error);
  } finally {
    session.endSession();
  }
}

export async function deleteBoard(
  req: AuthRequest,
  res: Response,
  next: NextFunction
) {
  const session = await startSession();
  const { id, workspaceId } = req.params;
  try {
    const board = await BoardModel.findOneAndDelete(
      {
        _id: req.params.id,
        admin: req.userId,
      },
      { session }
    );
    const workspace = await WorkspaceModel.findOneAndUpdate(
      {
        _id: workspaceId,
        ...VALIDATE_USER(req),
      },
      {
        $pull: {
          boards: id,
        },
      },
      { session }
    );
    if (!board || !workspace) throw new CustomError("Board not found", 404);
    await session.commitTransaction();
    res.status(200).json({ message: "Board deleted" });
  } catch (error) {
    session.abortTransaction();
    console.log("deleteBoard error: ");
    next(error);
  } finally {
    session.endSession();
  }
}

export async function updateBoardBg(
  req: AuthRequest,
  res: Response,
  next: NextFunction
) {
  const { background, bgType } = req.body;
  try {
    if (!background || !bgType)
      throw new CustomError("Background and background type is required", 400);
    const board = await BoardModel.findOneAndUpdate(
      {
        _id: req.params.id,
        ...VALIDATE_USER(req),
      },
      { bg: { background, bgType } },
      { new: true }
    );
    if (!board) throw new CustomError("Board not found", 404);
    res.status(200).json(board);
  } catch (error) {
    console.log("updateBoardBg error: ");
    next(error);
  }
}

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

    const board = await BoardModel.findOneAndUpdate(
      {
        _id: req.params.id,
        ...VALIDATE_USER(req),
        members: memberToRemoveId,
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

export async function archiveList(
  req: AuthRequest,
  res: Response,
  next: NextFunction
) {
  const { listId } = req.params;
  const listobjectId = new Types.ObjectId(listId);
  const session = await startSession();
  try {
    session.startTransaction();
    const list = await ListModel.findOneAndUpdate(
      { _id: listId, board: req.params.id, isArchived: false },
      { $set: { isArchived: true } },
      { new: true, session }
    );
    if (!list) throw new CustomError("List not found", 404);

    const board = await BoardModel.findOneAndUpdate(
      {
        _id: req.params.id,
        ...VALIDATE_USER(req),
      },
      {
        $inc: { listsNumber: -1 },
        $push: { archivedLists: { listId: listobjectId, name: list.name } },
      },
      { new: true, runValidators: true, session }
    );
    if (!board) throw new CustomError("Board not found", 404);

    // const lists = await ListModel.find({
    //   board: board._id,
    //   isArchived: false,
    //   _id: { $ne: listId },
    // }).sort({
    //   position: 1,
    // });
    // if (!lists) throw new CustomError("Lists not found", 404);

    // await addCardsToLists(lists);

    await session.commitTransaction();

    res.status(200).json(board);
  } catch (error) {
    await session.abortTransaction();
    console.log("archiveList error: ");
    next(error);
  } finally {
    session.endSession();
  }
}

export async function unArchiveList(
  req: AuthRequest,
  res: Response,
  next: NextFunction
) {
  const { listId } = req.params;
  const listobjectId = new Types.ObjectId(listId);
  const session = await startSession();
  try {
    session.startTransaction();
    const board = await BoardModel.findOneAndUpdate(
      {
        _id: req.params.id,
        ...VALIDATE_USER(req),
      },
      {
        $inc: { listsNumber: 1 },
        $pull: { archivedLists: { listId: listobjectId } },
      },
      { new: true, runValidators: true, session }
    );
    if (!board) throw new CustomError("Board not found", 404);

    const lists = await ListModel.find({
      board: board._id,
      isArchived: false,
    });
    if (!lists) throw new CustomError("Lists not found", 404);

    let maxPos = 0;
    lists.forEach((list) => {
      if (list.position > maxPos) maxPos = list.position;
    });

    await ListModel.findOneAndUpdate(
      { _id: listId, board: req.params.id, isArchived: true },
      { $set: { isArchived: false, position: Math.floor(maxPos + 1) } },
      { new: true, session }
    );
    await session.commitTransaction();

    // const lists = await reOrderListsPositions(board._id, board.listsNumber);
    // if (!lists) throw new CustomError("Lists not found", 404);
    // await addCardsToLists(lists as ListI[]);

    res.status(200).json(board);
  } catch (error) {
    await session.abortTransaction();
    console.log("unArchiveList error: ");
    next(error);
  } finally {
    session.endSession();
  }
}

export async function archiveCard(
  req: AuthRequest,
  res: Response,
  next: NextFunction
) {
  const { id, cardId } = req.params;

  const cardObjectId = new Types.ObjectId(cardId);
  const session = await startSession();
  try {
    session.startTransaction();

    const card = await CardModel.findOneAndUpdate(
      { _id: cardId, isArchived: false },
      { $set: { isArchived: true } },
      { new: true, session }
    );
    if (!card) throw new CustomError("Card not found", 404);

    const board = await BoardModel.findOneAndUpdate(
      {
        _id: id,
        ...VALIDATE_USER(req),
      },
      {
        $push: { archivedCards: cardObjectId },
      },
      { new: true, runValidators: true, session }
    );

    if (!board) throw new CustomError("Board not found", 404);

    // const lists = await ListModel.find({
    //   board: board._id,
    //   isArchived: false,
    // }).sort({
    //   position: 1,
    // });

    // if (!lists) throw new CustomError("Lists not found", 404);

    await session.commitTransaction();
    // await addCardsToLists(lists);

    res.status(200).json(board);
  } catch (error) {
    await session.abortTransaction();
    console.log("archiveCard error: ");
    next(error);
  } finally {
    session.endSession();
  }
}

export async function unArchiveCard(
  req: AuthRequest,
  res: Response,
  next: NextFunction
) {
  const { id, cardId } = req.params;
  const cardObjectId = new Types.ObjectId(cardId);
  const session = await startSession();
  try {
    session.startTransaction();
    const board = await BoardModel.findOneAndUpdate(
      {
        _id: id,
        ...VALIDATE_USER(req),
      },
      {
        $pull: { archivedCards: cardObjectId },
      },
      { new: true, runValidators: true, session }
    );
    if (!board) throw new CustomError("Board not found", 404);

    const card = await CardModel.findById(cardId);
    if (!card) throw new CustomError("Card not found", 404);

    const cards = await CardModel.find({
      list: card.list,
      isArchived: false,
    }).select("position");

    let maxPos = 0;
    cards.forEach((card) => {
      if (card.position > maxPos) maxPos = card.position;
    });

    card.isArchived = false;
    card.position = Math.floor(maxPos + 1);
    await card.save();

    // const card = await CardModel.findOneAndUpdate(
    //   { _id: cardId, isArchived: true },
    //   { $set: { isArchived: false, position: 10000 } },
    //   { new: true, session }
    // );
    // if (!card) throw new CustomError("Card not found", 404);

    await session.commitTransaction();

    // const cardsList = await ListModel.findById(card.list);
    // if (!cardsList) throw new CustomError("List not found", 404);

    // await reOrderCardsPositions(cardsList._id);
    // const lists = await ListModel.find({
    //   board: board._id,
    //   isArchived: false,
    // }).sort({
    //   position: 1,
    // });
    // if (!lists) throw new CustomError("Lists not found", 404);

    // await addCardsToLists(lists);

    res.status(200).json(board);
  } catch (error) {
    await session.abortTransaction();
    console.log("unArchiveCard error: ");
    next(error);
  } finally {
    session.endSession();
  }
}

export async function createBoardLabel(
  req: AuthRequest,
  res: Response,
  next: NextFunction
) {
  try {
    const { title, color } = req.body;
    const label = new LabelModel({ title, color });
    await label.save();

    const board = await BoardModel.findOneAndUpdate(
      { _id: req.params.id, ...VALIDATE_USER(req) },
      { $push: { labels: label._id } },
      { new: true }
    ).populate("labels");

    if (!board) throw new CustomError("Board not found", 404);
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
  const { labelId } = req.params;
  const { title, color } = req.body;
  if (!title || !color)
    throw new CustomError("title and color are required", 400);
  try {
    const updateFields: any = {};

    if (title) updateFields["title"] = title;
    if (color) updateFields["color"] = color;

    const updatedLabel = await LabelModel.findByIdAndUpdate(
      labelId,
      { $set: updateFields },
      { new: true, runValidators: true }
    );

    if (!updatedLabel) {
      throw new CustomError("Label not found", 404);
    }

    res.status(200).json({ message: "Label updated" });
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
    const [updatedBoard] = await Promise.all([
      BoardModel.findOneAndUpdate(
        {
          _id: req.params.id,
          ...VALIDATE_USER(req),
          labels: labelId,
        },
        { $pull: { labels: labelId } },
        { new: true }
      ),
      CardModel.updateMany(
        { "labels._id": labelId },
        { $pull: { labels: labelId } }
      ),
      LabelModel.findByIdAndDelete(labelId),
    ]);
    if (!updatedBoard) throw new CustomError("Board not found", 404);
    res.status(200).json(updatedBoard);
  } catch (error) {
    console.log("deleteBoardLabel error: ");
    next(error);
  }
}
