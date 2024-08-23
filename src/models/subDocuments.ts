import { Schema } from "mongoose";
import {
  ActivitySubDocumentI,
  BoardSubDocumentI,
} from "../types/subDocument.types";

export const boardSubDocumentSchema = new Schema<BoardSubDocumentI>({
  boardId: {
    type: Schema.Types.ObjectId,
    ref: "Board",
    required: true,
  },
  title: {
    type: String,
    required: true,
  },
  boardBg: {
    type: String,
    required: true,
  },
});

export const activitySubDocumentSchema = new Schema<ActivitySubDocumentI>({
  by: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  where: {
    type: Schema.Types.ObjectId,
    ref: "Card",
    required: true,
  },
  when: {
    type: Date,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
});
