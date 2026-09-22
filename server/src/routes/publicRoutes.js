import { Router } from "express";
import { createQuote } from "../controllers/quoteController.js";
import { getProducts } from "../controllers/productController.js";
import { getVehicles } from "../controllers/vehicleController.js";
import {
  getModelManifest,
  serveModelAsset,
  serveModelChunk
} from "../controllers/uploadController.js";

export const publicRouter = Router();

publicRouter.get("/vehicles", getVehicles);
publicRouter.get("/products", getProducts);
publicRouter.get("/models/:fileId/manifest", getModelManifest);
publicRouter.get("/models/:fileId/chunks/:chunkIndex", serveModelChunk);
publicRouter.head("/models/:fileId", serveModelAsset);
publicRouter.get("/models/:fileId", serveModelAsset);
publicRouter.post("/quotes", createQuote);
