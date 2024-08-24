import { model, Schema } from "mongoose";
import { ListI } from "../types/list.types";

const listSchema = new Schema<ListI>({
  cards: {
    type: [Schema.Types.ObjectId],
    ref: "Card",
    default: [],
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
  position: {
    type: Number,
    required: true,
  },
});

const ListModel = model("List", listSchema);
export default ListModel;
