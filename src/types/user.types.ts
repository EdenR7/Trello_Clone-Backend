import { Document, Types } from "mongoose";
import { BoardSubDocumentI } from "./subDocument.types";

export interface UserI extends Document {
  username: string;
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  workspaces: Types.ObjectId[];
  // Img*-?
  sttaredBoards: BoardSubDocumentI[];
  recentBoards: BoardSubDocumentI[];
}
