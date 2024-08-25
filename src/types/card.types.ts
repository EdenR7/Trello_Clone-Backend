import { Types, Document } from "mongoose";
import { ActivitySubDocumentI, MemberSubDocumentI } from "./subDocument.types";
import { LabelI } from "./label.types";

export interface CardDueTime {
  date: Date;
  time: Date;
}
export interface TodoI {
  title: string;
  isComplete: boolean;
}

export interface ChecklistI {
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
  labels: LabelI[];
  startDate?: Date;
  dueDate?: Date;
  description?: string;
  activity: ActivitySubDocumentI[];
  checklist: ChecklistI[];
  position: number;
  isArchived: boolean;
}
