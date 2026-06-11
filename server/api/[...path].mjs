import app from "../src/app.js";
import { connectDatabase } from "../src/config/db.js";
import { getMissingRequiredEnv } from "../src/config/env.js";

let databaseConnectionPromise;

const ensureDatabaseConnection = async () => {
  if (!databaseConnectionPromise) {
    databaseConnectionPromise = connectDatabase().catch((error) => {
      databaseConnectionPromise = undefined;
      throw error;
    });
  }

  await databaseConnectionPromise;
};

export default async function handler(req, res) {
  const requestPath = req.url || "/";
  const missingEnv = getMissingRequiredEnv();

  if (req.method === "OPTIONS") {
    return app(req, res);
  }

  if (missingEnv.length) {
    return res.status(500).json({
      message: "Missing required environment variables",
      missing: missingEnv
    });
  }

  if (requestPath === "/" || requestPath.startsWith("/api/health")) {
    return app(req, res);
  }

  try {
    await ensureDatabaseConnection();
    return app(req, res);
  } catch (error) {
    console.error("Database connection failed", error);
    return res.status(500).json({
      message: "Database connection failed",
      detail: error?.message || "Unknown error"
    });
  }
}
