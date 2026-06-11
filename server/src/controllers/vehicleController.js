import { Vehicle } from "../models/Vehicle.js";
import { clearCacheValue, getCacheValue, setCacheValue } from "../utils/cacheStore.js";
import { ApiError } from "../utils/apiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const defaultVector3 = (x, y, z) => ({ x, y, z });

const sanitizeVector3 = (value, fallback, fieldName) => {
  if (!value) {
    return fallback;
  }

  const vector = {
    x: Number(value.x),
    y: Number(value.y),
    z: Number(value.z)
  };

  if ([vector.x, vector.y, vector.z].some((entry) => Number.isNaN(entry))) {
    throw new ApiError(400, `${fieldName} requires numeric x, y, and z values`);
  }

  return vector;
};

const sanitizeVehiclePayload = (payload) => {
  const { name, slug, brand, svgBase, modelUrl, modelScale, modelPosition, modelRotation, price, canvasSize } = payload;

  if (!name || !slug || !brand || !svgBase || price === undefined) {
    throw new ApiError(400, "Vehicle requires name, slug, brand, svgBase, and price");
  }

  if (!canvasSize?.width || !canvasSize?.height) {
    throw new ApiError(400, "Vehicle requires a canvas size");
  }

  return {
    name: name.trim(),
    slug: slug.trim(),
    brand: brand.trim(),
    svgBase: svgBase.trim(),
    modelUrl: String(modelUrl || "").trim(),
    modelScale: sanitizeVector3(modelScale, defaultVector3(1, 1, 1), "modelScale"),
    modelPosition: sanitizeVector3(modelPosition, defaultVector3(0, 0, 0), "modelPosition"),
    modelRotation: sanitizeVector3(modelRotation, defaultVector3(0, 0, 0), "modelRotation"),
    price: Number(price),
    canvasSize: {
      width: Number(canvasSize.width),
      height: Number(canvasSize.height)
    }
  };
};

export const getVehicles = asyncHandler(async (_req, res) => {
  const cacheKey = "vehicles:all";
  const cached = getCacheValue(cacheKey);

  if (cached) {
    return res.json(cached);
  }

  const vehicles = await Vehicle.find().sort({ brand: 1, name: 1 });
  setCacheValue(cacheKey, vehicles, 120_000);
  res.json(vehicles);
});

export const createVehicle = asyncHandler(async (req, res) => {
  const vehicle = await Vehicle.create(sanitizeVehiclePayload(req.body));
  clearCacheValue("vehicles:");
  res.status(201).json(vehicle);
});

export const updateVehicle = asyncHandler(async (req, res) => {
  const vehicle = await Vehicle.findByIdAndUpdate(
    req.params.id,
    sanitizeVehiclePayload(req.body),
    { new: true, runValidators: true }
  );

  if (!vehicle) {
    throw new ApiError(404, "Vehicle not found");
  }

  clearCacheValue("vehicles:");
  res.json(vehicle);
});

export const deleteVehicle = asyncHandler(async (req, res) => {
  const vehicle = await Vehicle.findByIdAndDelete(req.params.id);

  if (!vehicle) {
    throw new ApiError(404, "Vehicle not found");
  }

  clearCacheValue("vehicles:");
  res.status(204).send();
});
