import { model, Schema } from "mongoose";
import { WorkspaceI } from "../types/workspace.types";
import {
  activitySubDocumentSchema,
  boardSubDocumentSchema,
  MemberSubDocumentSchema,
} from "./subDocuments";

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
    type: [MemberSubDocumentSchema],
    default: [],
    ref: "User",
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
