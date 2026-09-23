import { Product } from "../models/Product.js";
import { clearCacheValue, getCacheValue, setCacheValue } from "../utils/cacheStore.js";
import { ApiError } from "../utils/apiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const productTypes = new Set(["canopy", "module", "accessory"]);
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

export const seedCoordinates = asyncHandler(async (req, res) => {
  const products = await Product.find({});

  const positionsByCategory = {
    canopy: [
      { vehicleSlug: "toyota-hilux", x: 420, y: 300, width: 310, height: 170 },
      { vehicleSlug: "ford-ranger", x: 430, y: 305, width: 320, height: 175 },
      { vehicleSlug: "isuzu-d-max", x: 415, y: 298, width: 305, height: 168 },
      { vehicleSlug: "nissan-navara", x: 410, y: 295, width: 300, height: 165 },
      { vehicleSlug: "mitsubishi-triton", x: 415, y: 298, width: 305, height: 168 },
      { vehicleSlug: "vw-amarok", x: 435, y: 308, width: 325, height: 178 }
    ],
    roof: [
      { vehicleSlug: "toyota-hilux", x: 420, y: 140, width: 300, height: 60 },
      { vehicleSlug: "ford-ranger", x: 430, y: 145, width: 310, height: 60 },
      { vehicleSlug: "isuzu-d-max", x: 415, y: 138, width: 295, height: 58 },
      { vehicleSlug: "nissan-navara", x: 410, y: 135, width: 290, height: 58 },
      { vehicleSlug: "mitsubishi-triton", x: 415, y: 138, width: 295, height: 58 },
      { vehicleSlug: "vw-amarok", x: 435, y: 148, width: 315, height: 62 }
    ],
    internal: [
      { vehicleSlug: "toyota-hilux", x: 450, y: 340, width: 250, height: 120 },
      { vehicleSlug: "ford-ranger", x: 460, y: 345, width: 260, height: 125 },
      { vehicleSlug: "isuzu-d-max", x: 445, y: 338, width: 245, height: 118 },
      { vehicleSlug: "nissan-navara", x: 440, y: 335, width: 240, height: 115 },
      { vehicleSlug: "mitsubishi-triton", x: 445, y: 338, width: 245, height: 118 },
      { vehicleSlug: "vw-amarok", x: 465, y: 348, width: 265, height: 128 }
    ]
  };

  let updatedCount = 0;

  for (const product of products) {
    const isCanopy = product.type === "canopy" || product.slug.includes("canopy");
    const isRoof = ["roof-rack", "rooftop-tent", "solar-panel", "awning"].some((s) => product.slug.includes(s));

    const modelScale = { x: 1, y: 1, z: 1 };
    const modelRotation = { x: 0, y: 0, z: 0 };
    const modelPosition = isCanopy
      ? { x: 1.12, y: 1.65, z: 0 }
      : isRoof
        ? { x: 1.10, y: 2.48, z: 0 }
        : { x: 1.55, y: 1.42, z: -0.5 };

    const positions = isCanopy
      ? positionsByCategory.canopy
      : isRoof
        ? positionsByCategory.roof
        : positionsByCategory.internal;

    product.modelScale = modelScale;
    product.modelPosition = modelPosition;
    product.modelRotation = modelRotation;
    product.positions = positions;

    await product.save();
    updatedCount++;
  }

  clearCacheValue("products:");
  res.json({ message: `Successfully updated 3D coordinates and positions JSON for ${updatedCount} products`, count: updatedCount });
});

