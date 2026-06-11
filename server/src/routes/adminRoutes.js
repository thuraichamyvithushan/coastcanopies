import { Router } from "express";
import { loginAdmin } from "../controllers/authController.js";
import {
  createProduct,
  deleteProduct,
  updateProduct
} from "../controllers/productController.js";
import { getQuotes, updateQuoteStatus } from "../controllers/quoteController.js";
import {
  createVehicle,
  deleteVehicle,
  updateVehicle
} from "../controllers/vehicleController.js";
import { uploadVehicleAsset } from "../controllers/uploadController.js";
import { requireAdminAuth } from "../middleware/authMiddleware.js";

export const adminRouter = Router();

adminRouter.post("/login", loginAdmin);

adminRouter.use(requireAdminAuth);
adminRouter.post("/uploads/vehicle-assets", uploadVehicleAsset);
adminRouter.post("/vehicles", createVehicle);
adminRouter.put("/vehicles/:id", updateVehicle);
adminRouter.delete("/vehicles/:id", deleteVehicle);
adminRouter.post("/products", createProduct);
adminRouter.put("/products/:id", updateProduct);
adminRouter.delete("/products/:id", deleteProduct);
adminRouter.get("/quotes", getQuotes);
adminRouter.patch("/quotes/:id/status", updateQuoteStatus);
