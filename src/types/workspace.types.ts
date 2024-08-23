import { Types } from "mongoose";
import { ActivitySubDocumentI, BoardSubDocumentI } from "./subDocument.types";

export interface WorkspaceI {
  name: string;
  shortName: string;
  description: string;
  boards: BoardSubDocumentI[];
  members: Types.ObjectId[];
  admin: Types.ObjectId;
  activity: ActivitySubDocumentI[];
}
