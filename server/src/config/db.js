import mongoose from "mongoose";
import { env } from "./env.js";

export const connectDatabase = async () => {
  mongoose.set("strictQuery", true);
  try {
    await mongoose.connect(env.mongoUri);
    console.log("Connected to MongoDB successfully");
  } catch (error) {
    console.error("MongoDB connection failed.");
    console.error("Please verify MONGODB_URI in server/.env and check Network Access in MongoDB Atlas.");
    throw error;
  }
};
