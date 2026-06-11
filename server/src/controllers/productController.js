import { Product } from "../models/Product.js";
import { clearCacheValue, getCacheValue, setCacheValue } from "../utils/cacheStore.js";
import { ApiError } from "../utils/apiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const productTypes = new Set(["canopy", "module", "accessory"]);

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
  const { name, slug, type, svg, price, description, positions = [] } = payload;

  if (!name || !slug || !type || !svg || price === undefined) {
    throw new ApiError(400, "Product requires name, slug, type, svg, and price");
  }

  if (!productTypes.has(type)) {
    throw new ApiError(400, "Invalid product type");
  }

  return {
    name: name.trim(),
    slug: slug.trim(),
    type,
    svg: svg.trim(),
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
