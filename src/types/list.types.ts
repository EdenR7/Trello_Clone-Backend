import e from "express";
import { Types } from "mongoose";

export interface ListI extends Document {
  cards: Types.ObjectId[];
  board: Types.ObjectId;
  isArchived: boolean;
  name: string;
  position: number;
  _id?: Types.ObjectId;
}
