import { Schema } from "mongoose";
import { BoardSubDocumentI } from "../types/subDocument.types";

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
