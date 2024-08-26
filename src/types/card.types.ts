import { Types, Document } from "mongoose";
import { ActivitySubDocumentI, MemberSubDocumentI } from "./subDocument.types";
import { LabelI } from "./label.types";

export interface CardDueTime {
  date: Date;
  time: Date;
}
export interface TodoI {
  _id: Types.ObjectId;
  title: string;
  isComplete: boolean;
}

export interface ChecklistI extends Document {
  _id: Types.ObjectId;
  name: string;
  todos: TodoI[];
}

export interface CardI extends Document {
  admin: Types.ObjectId;
  bgCover: {
    isCover: boolean;
    bg: string;
  };
  title: string;
  members: MemberSubDocumentI[];
  labels: Types.ObjectId[];
  startDate?: Date;
  dueDate?: Date;
  description?: string;
  activity: ActivitySubDocumentI[];
  checklist: ChecklistI[];
  position: number;
  list: Types.ObjectId;
  isArchived: boolean;
}
