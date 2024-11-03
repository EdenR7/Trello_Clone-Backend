import { NextFunction, Request, Response } from "express";
import UserModel from "../models/user.model";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import { getErrorData } from "../utils/errors/ErrorsFunctions";
import { config } from "dotenv";
import { CustomError } from "../utils/errors/CustomError";
import { createWorkspace } from "./workspace.controller";
import { ObjectId, startSession } from "mongoose";
import { createLabels } from "../utils/boardUtilFuncs";
import BoardModel from "../models/board.model";
import { LabelI } from "../types/label.types";
import ListModel from "../models/list.model";
import CardModel from "../models/card.model";
import { createChecklist } from "../seed";
import {
  generateCodingBoard,
  generateDailyTasksBoard,
} from "../helpers/generateGuestFuncs";

config();
const JWT_SECRET = process.env.JWT_SECRET as string;
export const SALT_ROUNDS = 10;

export const register = async (req: Request, res: Response) => {
  const { firstName, lastName, email, username, password } = req.body;
  if (!firstName || !lastName || !email || !username || !password) {
    return res.status(400).json({ message: "All fields are required" });
  }

  try {
    const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);
    const newUser = new UserModel({
      email,
      password: hashedPassword,
      username,
      firstName,
      lastName,
    });
    const initialWorkspace = await createWorkspace(
      `${username}'s Workspace`,
      newUser
    );
    console.log("initialWorkspace", initialWorkspace);
    newUser.workspaces.push(initialWorkspace._id);

    await newUser.save();

    res.status(201).json({ message: "User registered" });
  } catch (error) {
    const { errorMessage, errorName } = getErrorData(error);
    console.log("register", errorName, errorMessage);
    if ((error as any).code === 11000) {
      const duplicateField = Object.keys((error as any).keyPattern)[0];
      const message = `The ${duplicateField} is already taken.`;
      console.log(message);
      return res.status(400).json({ message });
    }
    res.status(500).json({ message: "Registration failed" });
  }
};

export const login = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { username, password } = req.body;

  try {
    const user = await UserModel.findOne({ username });
    if (!user) {
      throw new CustomError("Authentication failed", 401);
    }
    const isPasswordMatch = await bcrypt.compare(password, user.password);
    if (!isPasswordMatch) {
      throw new CustomError("Authentication failed", 401);
    }
    const token = jwt.sign({ userId: user._id }, JWT_SECRET, {
      expiresIn: "5d",
    });
    res.status(200).json(token);
  } catch (error) {
    console.log("login error:");
    next(error);
  }
};

export async function generateAGuestUser(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const session = await startSession();

  try {
    session.startTransaction();
    const guestsNumber = await UserModel.countDocuments({ isGuest: true });
    const hashedPassword = await bcrypt.hash("1234", SALT_ROUNDS);

    const newUser = new UserModel({
      email: `guest${guestsNumber}@guest.com`,
      password: hashedPassword,
      username: `Guest${guestsNumber + 1}`,
      firstName: "Guest",
      lastName: "User",
      isGuest: true,
    });
    const initialWorkspace = await createWorkspace(
      `${newUser.username}'s Workspace`,
      newUser
    );

    newUser.workspaces.push(initialWorkspace._id);

    const token = jwt.sign({ userId: newUser._id }, JWT_SECRET, {
      expiresIn: "5d",
    });

    const codingBoard = await generateCodingBoard(session, newUser);
    const dailyBoard = await generateDailyTasksBoard(session, newUser);

    initialWorkspace.boards.push(codingBoard._id);
    initialWorkspace.boards.push(dailyBoard._id);
    newUser.recentBoards.push(codingBoard._id);
    newUser.recentBoards.push(dailyBoard._id);
    newUser.sttaredBoards.push(codingBoard._id);

    await newUser.save({ session });
    await initialWorkspace.save({ session });

    await session.commitTransaction();
    res.status(201).json({ token, username: newUser.username });
  } catch (error) {
    session.abortTransaction();

    next(error);
  } finally {
    session.endSession();
  }
}
