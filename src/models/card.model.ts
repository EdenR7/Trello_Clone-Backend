import { Model, model, Schema } from "mongoose";
import { activitySubDocumentSchema } from "./activity.model";
import { CardI, ChecklistI, TodoI } from "../types/card.types";
import { memberSubDocumentSchema } from "./user.model";
import { LabelI } from "../types/label.types";



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
    type: [Schema.Types.ObjectId],
    ref: "Label",
    default: [], // We can define default values for arrays
  },
  startDate: {
    type: Date,
    default: null,
  },
  dueDate: {
    type: Date,
    default: null,
  },
  description: {
    type: String,
  },
  // activity: {
  //   type: [activitySubDocumentSchema],
  //   default: [],
  // },
  checklist: {
    type: [checklistSchema],
    default: [],
  },
  list: {
    type: Schema.Types.ObjectId,
    ref: "List",
    required: true,
  },
  position: {
    type: Number,
    required: true,
  },
  isArchived: {
    type: Boolean,
    default: false,
  },
});

const CardModel = model("Card", cardSchema);
export default CardModel;
