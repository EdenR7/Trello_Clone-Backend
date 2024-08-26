import { model, Schema } from "mongoose";
import { ListI } from "../types/list.types";

const listSchema = new Schema<ListI>({
  cards: [
    {
      type: Schema.Types.ObjectId,
      ref: "Card",
    },
    { default: [] },
  ],
  name: {
    type: String,
    required: true,
  },
  position: {
    type: Number,
    required: true,
  },
  board: {
    type: Schema.Types.ObjectId,
    ref: "Board",
    required: true,
  },
  isArchived: {
    type: Boolean,
    default: false,
  },
});

const ListModel = model("List", listSchema);
export default ListModel;
