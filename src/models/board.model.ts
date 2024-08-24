import { model, Schema } from "mongoose";
import { BoardSubDocumentI } from "../types/subDocument.types";
import { LabelI } from "../types/label.types";
import { memberSubDocumentSchema } from "./user.model";
import { BoardI } from "../types/board.types";
import { labelSchema } from "./card.model";

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

const boardSchema = new Schema<BoardI>({
  admin: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  bg: {
    type: String,
    required: true,
  },
  members: {
    type: [memberSubDocumentSchema],
    default: [],
    required: true,
  },
  labels: {
    type: [labelSchema],
    default: [],
  },
  description: {
    type: String,
  },
  name: {
    type: String,
    required: true,
  },
  lists: {
    type: [Schema.Types.ObjectId],
    ref: "List",
    default: [],
    required: true,
  },
  archivedLists: {
    type: [
      {
        listId: { type: Schema.Types.ObjectId, ref: "List" },
        name: { type: String },
      },
    ],
    default: [],
  },
  archivedCards: {
    type: [Schema.Types.ObjectId],
    ref: "Card",
    default: [],
  },
});

const BoardModel = model<BoardI>("Board", boardSchema);
export default BoardModel;
