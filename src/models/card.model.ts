import { model, Schema } from "mongoose";
import { activitySubDocumentSchema } from "./activity.model";
import { CardI } from "../types/card.types";

const cardSchema = new Schema<CardI>({
  admin: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  bgCover: {
    isActive: { type: Boolean, default: false }, //instead of adding bgCoverState, may change
    bgColor: { type: String, default: "" },
  },
  title: {
    type: String,
    required: true,
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
  },
  startDate: {
    type: Date,
  },
  dueDate: {
    type: Date,
  },
  description: {
    type: String,
  },
  activity: {
    type: [activitySubDocumentSchema],
    default: [],
  },
  checklist: {
    type: [Schema.Types.ObjectId],
    ref: "Checklist",
    default: [],
  },
  position: {
    type: Number,
    required: true,
  },
  isArchived: {
    type: Boolean,
    required: true,
    default: false,
  },
});

const CardModel = model("Card", cardSchema);
export default CardModel;
