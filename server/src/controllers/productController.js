import { Product } from "../models/Product.js";
import { clearCacheValue, getCacheValue, setCacheValue } from "../utils/cacheStore.js";
import { ApiError } from "../utils/apiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const productTypes = new Set(["canopy", "tray", "accessory"]);
const defaultVector3 = (x, y, z) => ({ x, y, z });

const sanitizeVector3 = (value, fallback) => {
  if (!value || typeof value !== "object") {
    return fallback;
  }

  const vector = {
    x: Number(value.x),
    y: Number(value.y),
    z: Number(value.z)
  };

  return {
    x: Number.isFinite(vector.x) ? vector.x : fallback.x,
    y: Number.isFinite(vector.y) ? vector.y : fallback.y,
    z: Number.isFinite(vector.z) ? vector.z : fallback.z
  };
};

const sanitizePosition = (position) => {
  if (
    !position?.vehicleSlug ||
    position.x === undefined ||
    position.y === undefined ||
    position.width === undefined ||
    position.height === undefined
  ) {
    throw new ApiError(400, "Each product position requires vehicleSlug, x, y, width, and height");
  }

  return {
    vehicleSlug: position.vehicleSlug.trim(),
    x: Number(position.x),
    y: Number(position.y),
    width: Number(position.width),
    height: Number(position.height)
  };
};

const sanitizeProductPayload = (payload) => {
  const {
    name,
    slug,
    type,
    svg,
    modelUrl,
    modelScale,
    modelPosition,
    modelRotation,
    price,
    description,
    positions = []
  } = payload;

  if (!name || !slug || !type || price === undefined) {
    throw new ApiError(400, "Product requires name, slug, type, and price");
  }

  if (!productTypes.has(type)) {
    throw new ApiError(400, "Invalid product type");
  }

  return {
    name: name.trim(),
    slug: slug.trim(),
    type,
    svg: String(svg || "").trim(),
    modelUrl: String(modelUrl || "").trim(),
    modelScale: sanitizeVector3(modelScale, defaultVector3(1, 1, 1)),
    modelPosition: sanitizeVector3(modelPosition, defaultVector3(0, 0, 0)),
    modelRotation: sanitizeVector3(modelRotation, defaultVector3(0, 0, 0)),
    price: Number(price),
    description: description?.trim() || "",
    positions: positions.map(sanitizePosition)
  };
};

export const getProducts = asyncHandler(async (req, res) => {
  const { type } = req.query;
  const cacheKey = `products:${type || "all"}`;
  const cached = getCacheValue(cacheKey);

  if (cached) {
    return res.json(cached);
  }

  const query = type ? { type } : {};
  const products = await Product.find(query).sort({ type: 1, name: 1 });
  setCacheValue(cacheKey, products, 120_000);
  res.json(products);
});

export const createProduct = asyncHandler(async (req, res) => {
  const product = await Product.create(sanitizeProductPayload(req.body));
  clearCacheValue("products:");
  res.status(201).json(product);
});

export const updateProduct = asyncHandler(async (req, res) => {
  const product = await Product.findByIdAndUpdate(
    req.params.id,
    sanitizeProductPayload(req.body),
    { new: true, runValidators: true }
  );

  if (!product) {
    throw new ApiError(404, "Product not found");
  }

  clearCacheValue("products:");
  res.json(product);
});

export const deleteProduct = asyncHandler(async (req, res) => {
  const product = await Product.findByIdAndDelete(req.params.id);

  if (!product) {
    throw new ApiError(404, "Product not found");
  }

  clearCacheValue("products:");
  res.status(204).send();
});
