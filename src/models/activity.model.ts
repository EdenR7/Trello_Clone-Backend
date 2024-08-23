import { Schema } from "mongoose";
import {
  ActivitySubDocumentI,
  BoardSubDocumentI,
  MemberSubDocumentI,
} from "../types/subDocument.types";

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
