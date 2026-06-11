import { mkdir, writeFile } from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";
import { ApiError } from "../utils/apiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const uploadRoots = {
  "vehicle-svg": {
    directory: fileURLToPath(new URL("../../uploads/vehicles", import.meta.url)),
    publicPath: "/uploads/vehicles",
    allowedExtensions: new Set([".svg"]),
    allowedMimeTypes: new Set(["image/svg+xml", "text/plain", "application/octet-stream"])
  },
  "product-svg": {
    directory: fileURLToPath(new URL("../../uploads/products", import.meta.url)),
    publicPath: "/uploads/products",
    allowedExtensions: new Set([".svg"]),
    allowedMimeTypes: new Set(["image/svg+xml", "text/plain", "application/octet-stream"])
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
    throw new ApiError(400, "assetType must be one of vehicle-svg, product-svg, or model");
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
