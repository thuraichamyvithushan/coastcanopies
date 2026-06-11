import { Router } from "express";
import { createQuote } from "../controllers/quoteController.js";
import { getProducts } from "../controllers/productController.js";
import { getVehicles } from "../controllers/vehicleController.js";

export const publicRouter = Router();

publicRouter.get("/vehicles", getVehicles);
publicRouter.get("/products", getProducts);
publicRouter.post("/quotes", createQuote);
