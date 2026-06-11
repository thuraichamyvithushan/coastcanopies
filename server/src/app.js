import cors from "cors";
import express from "express";
import morgan from "morgan";
import path from "path";
import { fileURLToPath } from "url";
import { env } from "./config/env.js";
import { adminRouter } from "./routes/adminRoutes.js";
import { publicRouter } from "./routes/publicRoutes.js";
import { errorHandler, notFoundHandler } from "./middleware/errorMiddleware.js";

export const app = express();
const uploadsDirectory = fileURLToPath(new URL("../uploads", import.meta.url));
const corsOptions = {
  origin(origin, callback) {
    // Allow same-origin server-to-server calls and non-browser clients.
    if (!origin) {
      return callback(null, true);
    }

    if (env.clientUrls.includes(origin)) {
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

app.use("/api", publicRouter);
app.use("/api/admin", adminRouter);
app.use(notFoundHandler);
app.use(errorHandler);

export default app;
