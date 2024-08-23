import { model, Schema } from "mongoose";
import { UserI } from "../types/user.types";

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
    required: true,
  },
});

const UserModel = model<UserI>("User", userSchema);

export default UserModel;
