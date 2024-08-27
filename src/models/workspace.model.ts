import { model, Schema } from "mongoose";
import { WorkspaceI } from "../types/workspace.types";

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
  boards: [
    { type: Schema.Types.ObjectId, ref: "Board" },
    {
      default: [],
    },
  ],
  members: [
    { type: Schema.Types.ObjectId, ref: "User" },
    {
      default: [],
    },
  ],
  admin: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  bg: {
    type: String,
    default: "white",
    // default: "https://source.unsplash.com/random",
  },
  // activity: {
  //   type: [activitySubDocumentSchema],
  //   default: [],
  //   required: true,
  // },
});

const WorkspaceModel = model<WorkspaceI>("Workspace", workspaceSchema);

export default WorkspaceModel;
