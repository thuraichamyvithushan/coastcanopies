import { createWriteStream } from "fs";
import { mkdir, unlink, writeFile } from "fs/promises";
import path from "path";
import { Transform } from "stream";
import { pipeline } from "stream/promises";
import { fileURLToPath } from "url";
import { ApiError } from "../utils/apiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const uploadRoots = {
  "vehicle-svg": {
    directory: fileURLToPath(new URL("../../uploads/vehicles", import.meta.url)),
    publicPath: "/uploads/vehicles",
    allowedExtensions: new Set([".svg", ".png", ".jpg", ".jpeg"]),
    allowedMimeTypes: new Set([
      "image/svg+xml",
      "image/png",
      "image/jpeg",
      "text/plain",
      "application/octet-stream"
    ])
  },
  "product-svg": {
    directory: fileURLToPath(new URL("../../uploads/products", import.meta.url)),
    publicPath: "/uploads/products",
    allowedExtensions: new Set([".svg", ".png", ".jpg", ".jpeg"]),
    allowedMimeTypes: new Set([
      "image/svg+xml",
      "image/png",
      "image/jpeg",
      "text/plain",
      "application/octet-stream"
    ])
  },
  "product-model": {
    directory: fileURLToPath(new URL("../../uploads/products/models", import.meta.url)),
    publicPath: "/uploads/products/models",
    allowedExtensions: new Set([".glb"]),
    allowedMimeTypes: new Set([
      "model/gltf-binary",
      "application/octet-stream",
      "model/octet-stream"
    ])
  },
  model: {
    directory: fileURLToPath(new URL("../../uploads/vehicles/models", import.meta.url)),
    publicPath: "/uploads/vehicles/models",
    allowedExtensions: new Set([".glb"]),
    allowedMimeTypes: new Set([
      "model/gltf-binary",
      "application/octet-stream",
      "model/octet-stream"
    ])
  }
};

const MAX_MODEL_FILE_SIZE = 200 * 1024 * 1024;
const modelAssetTypes = new Set(["model", "product-model"]);

const normalizeSlug = (value) =>
  String(value || "vehicle")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9-]+/g, "-")
    .replace(/^-+|-+$/g, "") || "vehicle";

const parseDataUrl = (value) => {
  const match = String(value || "").match(/^data:([^;]+);base64,(.+)$/);

  if (!match) {
    throw new ApiError(400, "Uploaded asset must be sent as a base64 data URL");
  }

  return {
    mimeType: match[1],
    base64Payload: match[2]
  };
};

export const uploadVehicleAsset = asyncHandler(async (req, res) => {
  const { assetType, slug, fileName, dataUrl } = req.body;
  const config = uploadRoots[assetType];

  if (!config) {
    throw new ApiError(400, "assetType must be one of vehicle-svg, product-svg, product-model, or model");
  }

  if (!fileName || !dataUrl) {
    throw new ApiError(400, "Uploaded asset requires fileName and dataUrl");
  }

  const extension = path.extname(String(fileName || "")).toLowerCase();

  if (!config.allowedExtensions.has(extension)) {
    throw new ApiError(400, `Only ${Array.from(config.allowedExtensions).join(", ")} files are supported`);
  }

  const { mimeType, base64Payload } = parseDataUrl(dataUrl);

  if (!config.allowedMimeTypes.has(mimeType)) {
    throw new ApiError(400, `Unsupported file type: ${mimeType}`);
  }

  const fileBuffer = Buffer.from(base64Payload, "base64");

  if (!fileBuffer.length) {
    throw new ApiError(400, "Uploaded asset is empty");
  }

  await mkdir(config.directory, { recursive: true });

  const safeFileName = `${normalizeSlug(slug)}-${Date.now()}${extension}`;
  const destinationPath = path.join(config.directory, safeFileName);

  await writeFile(destinationPath, fileBuffer);

  res.status(201).json({
    path: `${config.publicPath}/${safeFileName}`
  });
});

export const uploadModelAsset = asyncHandler(async (req, res) => {
  const { assetType, slug, fileName } = req.query;
  const config = uploadRoots[assetType];

  if (!modelAssetTypes.has(assetType) || !config) {
    throw new ApiError(400, "assetType must be model or product-model");
  }

  if (!fileName) {
    throw new ApiError(400, "Uploaded model requires a file name");
  }

  const extension = path.extname(String(fileName)).toLowerCase();

  if (!config.allowedExtensions.has(extension)) {
    throw new ApiError(400, "Only .glb model files are supported");
  }

  const mimeType = String(req.headers["content-type"] || "").split(";")[0].trim();

  if (!config.allowedMimeTypes.has(mimeType)) {
    throw new ApiError(400, `Unsupported file type: ${mimeType || "unknown"}`);
  }

  const contentLength = Number(req.headers["content-length"] || 0);

  if (contentLength > MAX_MODEL_FILE_SIZE) {
    throw new ApiError(413, "GLB model must be 200 MB or smaller");
  }

  await mkdir(config.directory, { recursive: true });

  const safeFileName = `${normalizeSlug(slug)}-${Date.now()}${extension}`;
  const destinationPath = path.join(config.directory, safeFileName);
  let uploadedBytes = 0;

  const sizeLimiter = new Transform({
    transform(chunk, _encoding, callback) {
      uploadedBytes += chunk.length;

      if (uploadedBytes > MAX_MODEL_FILE_SIZE) {
        callback(new ApiError(413, "GLB model must be 200 MB or smaller"));
        return;
      }

      callback(null, chunk);
    }
  });

  try {
    await pipeline(req, sizeLimiter, createWriteStream(destinationPath, { flags: "wx" }));
  } catch (error) {
    await unlink(destinationPath).catch(() => {});
    throw error;
  }

  if (!uploadedBytes) {
    await unlink(destinationPath).catch(() => {});
    throw new ApiError(400, "Uploaded model is empty");
  }

  res.status(201).json({
    path: `${config.publicPath}/${safeFileName}`
  });
});
