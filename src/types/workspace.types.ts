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
  boards: Types.ObjectId[];
  members: Types.ObjectId[];
  admin: Types.ObjectId;
  activity: ActivitySubDocumentI[];
  bg: string;
}
