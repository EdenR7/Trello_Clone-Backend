import { model, Schema } from "mongoose";
import { BoardSubDocumentI } from "../types/subDocument.types";
import { memberSubDocumentSchema } from "./user.model";
import { BoardI } from "../types/board.types";

export const boardSubDocumentSchema = new Schema<BoardSubDocumentI>(
  {
    boardId: {
      type: Schema.Types.ObjectId,
      ref: "Board",
      required: true,
    },
    name: {
      type: String,
      required: true,
    },
    boardBg: {
      type: { background: String, bgType: String },
      required: true,
    },
  },
  { _id: false }
);

const boardSchema = new Schema<BoardI>({
  admin: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  bg: {
    type: { background: String, bgType: String },
    default: { background: "white", bgType: "color" },
  },
  members: {
    type: [Schema.Types.ObjectId],
    ref: "User",
    default: [],
    required: true,
  },
  labels: {
    type: [Schema.Types.ObjectId],
    ref: "Label",
    default: [],
  },
  description: {
    type: String,
    default: "",
  },
  name: {
    type: String,
    required: true,
  },
  archivedLists: {
    type: [
      new Schema(
        {
          listId: { type: Schema.Types.ObjectId, ref: "List" },
          name: { type: String },
        },
        { _id: false }
      ),
    ],
    default: [],
  },
  archivedCards: {
    type: [Schema.Types.ObjectId],
    ref: "Card",
    default: [],
  },
  listsNumber: {
    type: Number,
    default: 0,
  },
  // activity
});

const BoardModel = model<BoardI>("Board", boardSchema);
export default BoardModel;
