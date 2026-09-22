import cors from "cors";
import express from "express";
import morgan from "morgan";
import path from "path";
import { fileURLToPath } from "url";
import { connectDatabase } from "./config/db.js";
import { env, getMissingRequiredEnv } from "./config/env.js";
import { adminRouter } from "./routes/adminRoutes.js";
import { publicRouter } from "./routes/publicRoutes.js";
import { errorHandler, notFoundHandler } from "./middleware/errorMiddleware.js";

export const app = express();
const uploadsDirectory = fileURLToPath(new URL("../uploads", import.meta.url));
const normalizeOrigin = (value) => String(value || "").trim().replace(/\/+$/, "");
const allowedOrigins = new Set(
  [
    "http://localhost:5173",
    "https://coastcanopies.vercel.app",
    ...env.clientUrls
  ]
    .map(normalizeOrigin)
    .filter(Boolean)
);
const corsOptions = {
  origin(origin, callback) {
    // Allow same-origin server-to-server calls and non-browser clients.
    if (!origin) {
      return callback(null, true);
    }

    if (allowedOrigins.has(normalizeOrigin(origin))) {
      return callback(null, true);
    }

    return callback(new Error(`CORS blocked for origin: ${origin}`));
  },
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"]
};

app.use(cors(corsOptions));
app.options("*", cors(corsOptions));
app.use(express.json({ limit: "35mb" }));
app.use(morgan("dev"));
app.use("/uploads", express.static(path.resolve(uploadsDirectory)));

app.get("/", (_req, res) => {
  res.json({
    ok: true,
    service: "coast-canopies-api",
    health: "/api/health"
  });
});

app.get("/api/health", (_req, res) => {
  res.json({ ok: true });
});

app.use(async (req, res, next) => {
  if (!req.path.startsWith("/api/") || req.path === "/api/health") {
    next();
    return;
  }

  const missingEnv = getMissingRequiredEnv();

  if (missingEnv.length) {
    res.status(500).json({
      message: "Missing required environment variables",
      missing: missingEnv
    });
    return;
  }

  try {
    await connectDatabase();
    next();
  } catch (error) {
    console.error("Database connection failed", error);
    res.status(500).json({
      message: "Database connection failed",
      detail: error?.message || "Unknown error"
    });
  }
});

app.use("/api", publicRouter);
app.use("/api/admin", adminRouter);
app.use(notFoundHandler);
app.use(errorHandler);

export default app;
