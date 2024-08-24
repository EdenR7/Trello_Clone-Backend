import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

async function connectDB(): Promise<void> {
  try {
    await mongoose.connect(process.env.MONGO_URI as string);
    console.log("MongoDB connected");
  } catch (err) {
    if (err instanceof Error) {
      console.error(err.message);
    } else {
      console.error("An unknown error occurred.");
    }
    process.exit(1); // Exit process with failure
  }
}

// Export the function
export default connectDB;
