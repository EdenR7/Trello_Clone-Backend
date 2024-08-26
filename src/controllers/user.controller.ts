import { NextFunction, Response } from "express";
import UserModel from "../models/user.model";
import { AuthRequest } from "../types/auth.types";
import { CustomError } from "../utils/errors/CustomError";
import BoardModel from "../models/board.model";
import { Types } from "mongoose";
import { VALIDATE_USER } from "../utils/boardUtilFuncs";

export const getUser = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const user = await UserModel.findById(req.userId).select("-password");

    if (!user) {
      throw new CustomError("User not found", 404);
    }
    res.json(user);
  } catch (error) {
    console.log("getUser Error");
    next(error);
  }
};

export async function getAllUserBoards(
  req: AuthRequest,
  res: Response,
  next: NextFunction
) {
  try {
    const usersBoards = await BoardModel.find({
      $or: [{ admin: req.userId }, { "members.memberId": req.userId }],
    });
    return res.json(usersBoards);
  } catch (error) {
    console.log("getAllUserBoards Error");
    next(error);
  }
}

export async function updateStarredBoards(
  req: AuthRequest,
  res: Response,
  next: NextFunction
) {
  const { boardId } = req.params;
  if (!boardId) {
    throw new CustomError("Board ID is required", 400);
  }
  try {
    const user = await UserModel.findById(req.userId);

    if (!user) {
      throw new CustomError("User not found", 404);
    }

    const boardExist = user.sttaredBoards.find(
      (board) => board.boardId.toString() === boardId
    );

    if (boardExist) {
      user.sttaredBoards = user.sttaredBoards.filter(
        (board) => board.boardId.toString() !== boardId
      );
    } else {
      const board = await BoardModel.findOne({
        _id: boardId,
        ...VALIDATE_USER(req),
      });
      if (!board) {
        throw new CustomError("Board not found", 404);
      }
      user.sttaredBoards.push({
        boardId: new Types.ObjectId(boardId),
        name: board.name,
        boardBg: board.bg,
      });
    }

    await user.save();
    res.json(user);
  } catch (error) {
    console.log("addBoardToFavourites Error");
    next(error);
  }
}
