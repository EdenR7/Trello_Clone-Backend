import { NextFunction, Request, Response } from "express";
import UserModel from "../models/user.model";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import { getErrorData } from "../utils/errors/ErrorsFunctions";
import { config } from "dotenv";
import { CustomError } from "../utils/errors/CustomError";

config();
const JWT_SECRET = process.env.JWT_SECRET as string;
const SALT_ROUNDS = 10;

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
    await newUser.save();
    // const token = jwt.sign({ userId: newUser._id }, JWT_SECRET, {
    //   expiresIn: "4h",
    // });

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
      expiresIn: "5h",
    });
    res.status(200).json(token);
  } catch (error) {
    console.log("login error:");
    next(error);
  }
};
