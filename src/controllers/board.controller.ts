import { NextFunction, Response } from "express";
import { AuthRequest } from "../types/auth.types";
import BoardModel from "../models/board.model";
import { CustomError } from "../utils/errors/CustomError";
import UserModel from "../models/user.model";

function VALIDATE_USER(req: AuthRequest) {
  return {
    $or: [
      { admin: (req as AuthRequest).userId },
      { "members.memberId": req.userId },
    ],
  };
}
async function addMembersDetails(board: any) {
  await Promise.all(
    board.members.map(async (member: any, idx: number) => {
      const user = await UserModel.findById(member.memberId);
      if (user) {
        board.members[idx].memberId = {
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
    });
    if (!board) throw new CustomError("Board not found", 404);
    addMembersDetails(board);
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

    const board = new BoardModel({ name, admin: req.userId });
    await board.save();
    addMembersDetails(board);
    res.status(201).json(board);
  } catch (error) {
    console.log("createBoard error: ");
    next(error);
  }
}

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
      { $push: { members: { newMemberId } } },
      { new: true }
    );
    if (!board) throw new CustomError("Board not found", 404);
    addMembersDetails(board);
    res.status(200).json(board);
  } catch (error) {
    console.log("addMember error: ");
    next(error);
  }
}
