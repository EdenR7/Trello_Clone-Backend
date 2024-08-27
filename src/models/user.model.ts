import { model, Schema } from "mongoose";
import { UserI } from "../types/user.types";
import { MemberSubDocumentI } from "../types/subDocument.types";
import { boardSubDocumentSchema } from "./board.model";

export const memberSubDocumentSchema = new Schema<MemberSubDocumentI>({
  memberId: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  username: {
    type: String,
    required: true,
  },
  firstName: {
    type: String,
    required: true,
  },
  lastName: {
    type: String,
    required: true,
  },
});

const userSchema = new Schema<UserI>({
  username: {
    type: String,
    required: true,
    unique: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  firstName: {
    type: String,
    required: true,
  },
  lastName: {
    type: String,
    required: true,
  },
  workspaces: {
    type: [Schema.Types.ObjectId],
    default: [],
    ref: "Workspace",
  },
  sttaredBoards: [
    { type: Schema.Types.ObjectId, ref: "Board" },
    {
      default: [],
    },
  ],
  recentBoards: [
    { type: Schema.Types.ObjectId, ref: "Board" },
    {
      default: [],
    },
  ],
});

const UserModel = model<UserI>("User", userSchema);

export default UserModel;
