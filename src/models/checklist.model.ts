import { model, Schema } from "mongoose";
import { ChecklistI, TodoI } from "../types/checklist.types";

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

const checklistModel = model("Checklist", checklistSchema);

export default checklistModel;
