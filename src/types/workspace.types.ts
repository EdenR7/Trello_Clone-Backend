import { Types } from "mongoose";
import {
  ActivitySubDocumentI,
  BoardSubDocumentI,
  MemberSubDocumentI,
} from "./subDocument.types";

export interface WorkspaceI {
  name: string;
  shortName: string;
  description: string;
  boards: BoardSubDocumentI[];
  members: MemberSubDocumentI[];
  admin: Types.ObjectId;
  activity: ActivitySubDocumentI[];
}
