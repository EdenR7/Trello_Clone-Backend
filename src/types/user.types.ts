import { Document, Types } from "mongoose";

export interface UserI extends Document {
  username: string;
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  workspaces: Types.ObjectId[];
  // Img*-?
  sttaredBoards: Types.ObjectId[];
  recentBoards: Types.ObjectId[];
}
