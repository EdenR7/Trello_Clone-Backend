import { model, Schema } from "mongoose";
import { activitySubDocumentSchema } from "./activity.model";
import { CardI, ChecklistI, TodoI } from "../types/card.types";
import { memberSubDocumentSchema } from "./user.model";
import { LabelI } from "../types/label.types";

export const labelSchema = new Schema<LabelI>({
  title: {
    type: String,
    required: true,
  },
  color: {
    type: String,
    required: true,
  },
});

const todoSchema = new Schema<TodoI>({
  title: {
    type: String,
    required: true,
  },
  isComplete: {
    type: Boolean,
    required: true,
    default: false,
  },
});

const checklistSchema = new Schema<ChecklistI>({
  name: {
    type: String,
    required: true,
    default: "Checklist",
  },
  todos: { type: [todoSchema], default: [] },
});

const cardSchema = new Schema<CardI>({
  admin: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  bgCover: {
    isCover: { type: Boolean, default: false }, //instead of adding bgCoverState, may change
    bg: { type: String, default: "" },
  },
  title: {
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
    default: [], // We can define default values for arrays
  },
  startDate: {
    type: Date,
  },
  dueDate: {
    type: {
      date: { type: Date },
      time: { type: Date },
    },
  },
  // dueTime: {
  //   date: { type: Date },
  //   time: { type: Date }, // instead of using string, we can use Date type
  // },
  description: {
    type: String,
  },
  activity: {
    type: [activitySubDocumentSchema],
    default: [],
  },
  checklist: {
    type: [checklistSchema],
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
