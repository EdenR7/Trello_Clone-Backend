import { Types } from "mongoose";

export interface ListI {
  cards: Types.ObjectId[];
  name: string;
  position: number;
}
