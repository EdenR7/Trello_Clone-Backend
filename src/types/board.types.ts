import { Types } from "mongoose";
import { MemberSubDocumentI } from "./subDocument.types";
import { LabelI } from "./label.types";

export interface BoardI {
  admin: Types.ObjectId;
  bg: string;
  members: MemberSubDocumentI[];
  labels: LabelI[];
  description?: string;
  // activity: any[];
  name: string;
  lists: Types.ObjectId[];
  archivedLists: { listId: Types.ObjectId; name: string }[];
  archivedCards: Types.ObjectId[];
}
