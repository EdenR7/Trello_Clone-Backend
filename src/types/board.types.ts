import { Types } from "mongoose";
import { MemberSubDocumentI } from "./subDocument.types";
import { LabelI } from "./label.types";
import { AuthRequest } from "./auth.types";

export interface BoardI extends Document {
  admin: Types.ObjectId;
  bg: string;
  members: Types.ObjectId[];
  labels: LabelI[];
  description?: string;
  // activity: any[];
  name: string;
  lists: Types.ObjectId[];
  archivedLists: { listId: Types.ObjectId; name: string }[];
  archivedCards: Types.ObjectId[];
}

export interface AuthRequestWithBoard extends AuthRequest {
  board?: BoardI;
}
