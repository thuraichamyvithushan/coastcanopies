import mongoose from "mongoose";
import { env } from "./env.js";

let connectionPromise;

export const connectDatabase = async () => {
  if (mongoose.connection.readyState === 1) {
    return mongoose.connection;
  }

  if (connectionPromise) {
    return connectionPromise;
  }

  mongoose.set("strictQuery", true);
  connectionPromise = mongoose
    .connect(env.mongoUri)
    .then(() => {
      console.log("Connected to MongoDB successfully");
      return mongoose.connection;
    })
    .catch((error) => {
      connectionPromise = undefined;
      console.error("MongoDB connection failed.");
      console.error("Please verify MONGODB_URI in server/.env and check Network Access in MongoDB Atlas.");
      throw error;
    });

  return connectionPromise;
};
