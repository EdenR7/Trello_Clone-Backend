import { model, Schema } from "mongoose";
import { LabelI } from "../types/label.types";

export const labelSchema = new Schema<LabelI>({
  title: {
    type: String,
    required: true,
  },
  color: {
    type: String,
    required: true,
  },
});

const LabelModel = model("Label", labelSchema);

export default LabelModel;
