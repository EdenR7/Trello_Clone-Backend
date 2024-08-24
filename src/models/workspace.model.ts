import { model, Schema } from "mongoose";
import { WorkspaceI } from "../types/workspace.types";
import { activitySubDocumentSchema } from "./activity.model";
import { memberSubDocumentSchema } from "./user.model";
import { boardSubDocumentSchema } from "./board.model";

const workspaceSchema = new Schema<WorkspaceI>({
  name: {
    type: String,
    required: true,
  },
  shortName: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  boards: {
    type: [boardSubDocumentSchema],
    default: [],
    required: true,
  },
  members: {
    type: [memberSubDocumentSchema],
    default: [],
    required: true,
  },
  admin: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  activity: {
    type: [activitySubDocumentSchema],
    default: [],
    required: true,
  },
});

const WorkspaceModel = model<WorkspaceI>("Workspace", workspaceSchema);

export default WorkspaceModel;