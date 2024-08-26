import { Types } from "mongoose";

export interface LabelI extends Document {
  title: string;
  color: string;
  _id?: Types.ObjectId;
}
