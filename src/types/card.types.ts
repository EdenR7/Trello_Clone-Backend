import { Types, Document } from "mongoose";
import { ActivitySubDocumentI } from "./subDocument.types";

export interface CardI extends Document {
  admin: Types.ObjectId;
  bgCover: {
    isActive: boolean;
    bgColor: string;
  };
  title: string;
  members: Types.ObjectId[];
  labels: Types.ObjectId[];
  startDate?: Date;
  dueDate?: Date;
  description?: string;
  activity: ActivitySubDocumentI[];
  checklist: Types.ObjectId[];
  position: number;
  isArchived: boolean;
}
