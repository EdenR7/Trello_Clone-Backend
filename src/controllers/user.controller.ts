import { NextFunction, Response } from "express";
import UserModel from "../models/user.model";
import { AuthRequest } from "../types/auth.types";
import { CustomError } from "../utils/errors/CustomError";
import BoardModel from "../models/board.model";
import { VALIDATE_USER } from "../utils/boardUtilFuncs";

export const getUser = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const user = await UserModel.findById(req.userId)
      .select("-password")
      .populate({ path: "workspaces", select: ["name", "bg", "_id"] })
      .populate({ path: "sttaredBoards", select: ["name", "bg", "_id"] })
      .populate({ path: "recentBoards", select: ["name", "bg", "_id"] });

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

  try {
    const [user, board] = await Promise.all([
      UserModel.findById(req.userId),
      BoardModel.findOne({ _id: boardId, ...VALIDATE_USER(req) }),
    ]);
    if (!user || !board) throw new CustomError("User or Board not found", 404);

    const boardExist = user.sttaredBoards.find(
      (board) => board._id.toString() === boardId
    );
    let updatedUser;
    if (boardExist) {
      updatedUser = await UserModel.findByIdAndUpdate(
        req.userId,
        {
          $pull: { sttaredBoards: boardId },
        },
        { new: true }
      )
        .select("-password")
        .populate({ path: "workspaces", select: ["name", "bg", "_id"] })
        .populate({ path: "sttaredBoards", select: ["name", "bg", "_id"] })
        .populate({ path: "recentBoards", select: ["name", "bg", "_id"] });
    } else {
      updatedUser = await UserModel.findByIdAndUpdate(
        req.userId,
        { $push: { sttaredBoards: boardId } },
        { new: true }
      )
        .select("-password")
        .populate({ path: "workspaces", select: ["name", "bg", "_id"] })
        .populate({ path: "sttaredBoards", select: ["name", "bg", "_id"] })
        .populate({ path: "recentBoards", select: ["name", "bg", "_id"] });
    }
    res.status(200).json(updatedUser);
  } catch (error) {
    console.log("changeStar error: ");
    next(error);
  }
}

export async function getAllUsers(
  req: AuthRequest,
  res: Response,
  next: NextFunction
) {
  const { targetUsername } = req.query;

  try {
    if (!targetUsername) {
      return res.json([]);
    }
    const users = await UserModel.find({
      username: { $regex: targetUsername, $options: "i" },
      _id: { $ne: req.userId },
    }).limit(5);
    return res.json(users);
  } catch (error) {
    console.log("getUsers Error");
    next(error);
  }
}
