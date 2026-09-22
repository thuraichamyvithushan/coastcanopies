import { mkdir, writeFile } from "fs/promises";
import mongoose from "mongoose";
import path from "path";
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
const MODEL_CHUNK_SIZE = 3 * 1024 * 1024;
const MODEL_BUCKET_NAME = "modelAssets";
const MODEL_UPLOAD_SESSION_TTL_SECONDS = 24 * 60 * 60;
const modelAssetTypes = new Set(["model", "product-model"]);
let modelIndexesPromise;

const getModelCollections = async () => {
  const database = mongoose.connection.db;

  if (!database) {
    throw new ApiError(503, "Database is not ready for model uploads");
  }

  const files = database.collection(`${MODEL_BUCKET_NAME}.files`);
  const chunks = database.collection(`${MODEL_BUCKET_NAME}.chunks`);
  const sessions = database.collection("modelAssetUploadSessions");

  if (!modelIndexesPromise) {
    modelIndexesPromise = Promise.all([
      files.createIndex({ filename: 1, uploadDate: 1 }),
      chunks.createIndex({ files_id: 1, n: 1 }, { unique: true }),
      sessions.createIndex(
        { createdAt: 1 },
        { expireAfterSeconds: MODEL_UPLOAD_SESSION_TTL_SECONDS }
      )
    ]).catch((error) => {
      modelIndexesPromise = undefined;
      throw error;
    });
  }

  await modelIndexesPromise;

  return { database, files, chunks, sessions };
};

const parseObjectId = (value, label) => {
  if (!mongoose.Types.ObjectId.isValid(value)) {
    throw new ApiError(400, `Invalid ${label}`);
  }

  return new mongoose.Types.ObjectId(value);
};

const readRequestBuffer = (req, maxBytes) =>
  new Promise((resolve, reject) => {
    const buffers = [];
    let totalBytes = 0;
    let tooLarge = false;

    req.on("data", (chunk) => {
      totalBytes += chunk.length;

      if (totalBytes > maxBytes) {
        tooLarge = true;
        return;
      }

      buffers.push(chunk);
    });
    req.on("end", () => {
      if (tooLarge) {
        reject(new ApiError(413, "Model upload chunk is too large"));
        return;
      }

      resolve(Buffer.concat(buffers, totalBytes));
    });
    req.on("error", reject);
  });

const getChunkBuffer = (data) => {
  if (Buffer.isBuffer(data)) return data;
  if (Buffer.isBuffer(data?.buffer)) return data.buffer;
  return Buffer.from(data?.buffer || []);
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

export const initiateModelUpload = asyncHandler(async (req, res) => {
  const { assetType, slug, fileName, fileSize, mimeType } = req.body;

  if (!modelAssetTypes.has(assetType)) {
    throw new ApiError(400, "assetType must be model or product-model");
  }

  if (!fileName) {
    throw new ApiError(400, "Uploaded model requires a file name");
  }

  const extension = path.extname(String(fileName)).toLowerCase();

  if (extension !== ".glb") {
    throw new ApiError(400, "Only .glb model files are supported");
  }

  const normalizedMimeType = String(mimeType || "application/octet-stream")
    .split(";")[0]
    .trim();
  const allowedMimeTypes = uploadRoots[assetType].allowedMimeTypes;

  if (!allowedMimeTypes.has(normalizedMimeType)) {
    throw new ApiError(400, `Unsupported file type: ${normalizedMimeType || "unknown"}`);
  }

  const expectedBytes = Number(fileSize || 0);

  if (!Number.isInteger(expectedBytes) || expectedBytes <= 0) {
    throw new ApiError(400, "Uploaded model size is invalid");
  }

  if (expectedBytes > MAX_MODEL_FILE_SIZE) {
    throw new ApiError(413, "GLB model must be 200 MB or smaller");
  }

  const { sessions } = await getModelCollections();
  const fileId = new mongoose.Types.ObjectId();
  const uploadSession = {
    fileId,
    filename: `${normalizeSlug(slug)}-${Date.now()}.glb`,
    contentType: normalizedMimeType,
    expectedBytes,
    totalChunks: Math.ceil(expectedBytes / MODEL_CHUNK_SIZE),
    chunkSize: MODEL_CHUNK_SIZE,
    assetType,
    createdAt: new Date(),
    createdBy: req.admin?._id || null
  };
  const result = await sessions.insertOne(uploadSession);

  res.status(201).json({
    uploadId: result.insertedId.toString(),
    chunkSize: MODEL_CHUNK_SIZE,
    totalChunks: uploadSession.totalChunks
  });
});

export const uploadModelChunk = asyncHandler(async (req, res) => {
  const uploadId = parseObjectId(req.params.uploadId, "upload ID");
  const chunkIndex = Number(req.params.chunkIndex);

  if (!Number.isInteger(chunkIndex) || chunkIndex < 0) {
    throw new ApiError(400, "Invalid model chunk index");
  }

  const { chunks, sessions } = await getModelCollections();
  const session = await sessions.findOne({ _id: uploadId });

  if (!session) {
    throw new ApiError(404, "Model upload session was not found or has expired");
  }

  if (chunkIndex >= session.totalChunks) {
    throw new ApiError(400, "Model chunk index is outside the upload range");
  }

  const chunkBuffer = await readRequestBuffer(req, session.chunkSize);
  const isFinalChunk = chunkIndex === session.totalChunks - 1;
  const expectedChunkBytes = isFinalChunk
    ? session.expectedBytes - chunkIndex * session.chunkSize
    : session.chunkSize;

  if (chunkBuffer.length !== expectedChunkBytes) {
    throw new ApiError(
      400,
      `Model chunk ${chunkIndex} has ${chunkBuffer.length} bytes; expected ${expectedChunkBytes}`
    );
  }

  await chunks.updateOne(
    { files_id: session.fileId, n: chunkIndex },
    { $set: { data: chunkBuffer } },
    { upsert: true }
  );

  res.json({ uploaded: true, chunkIndex });
});

export const completeModelUpload = asyncHandler(async (req, res) => {
  const uploadId = parseObjectId(req.params.uploadId, "upload ID");
  const { chunks, files, sessions } = await getModelCollections();
  const session = await sessions.findOne({ _id: uploadId });

  if (!session) {
    throw new ApiError(404, "Model upload session was not found or has expired");
  }

  const uploadedChunks = await chunks
    .find({ files_id: session.fileId })
    .sort({ n: 1 })
    .project({ n: 1, data: 1 })
    .toArray();
  const uploadedBytes = uploadedChunks.reduce(
    (total, chunk) => total + getChunkBuffer(chunk.data).length,
    0
  );
  const hasCompleteSequence =
    uploadedChunks.length === session.totalChunks &&
    uploadedChunks.every((chunk, index) => chunk.n === index);

  if (!hasCompleteSequence || uploadedBytes !== session.expectedBytes) {
    throw new ApiError(409, "Model upload is incomplete; retry the missing chunks");
  }

  await files.updateOne(
    { _id: session.fileId },
    {
      $setOnInsert: {
        length: session.expectedBytes,
        chunkSize: session.chunkSize,
        uploadDate: new Date(),
        filename: session.filename,
        contentType: session.contentType,
        metadata: {
          assetType: session.assetType,
          createdBy: session.createdBy
        }
      }
    },
    { upsert: true }
  );
  await sessions.deleteOne({ _id: uploadId });

  res.status(201).json({
    path: `/api/models/${session.fileId}`
  });
});

export const serveModelAsset = asyncHandler(async (req, res) => {
  const fileId = parseObjectId(req.params.fileId, "model ID");
  const { database, files } = await getModelCollections();
  const file = await files.findOne({ _id: fileId });

  if (!file) {
    throw new ApiError(404, "3D model was not found");
  }

  res.set({
    "Content-Type": file.contentType || "model/gltf-binary",
    "Content-Length": String(file.length),
    "Content-Disposition": `inline; filename="${file.filename}"`,
    "Cache-Control": "public, max-age=31536000, immutable"
  });

  if (req.method === "HEAD") {
    res.status(200).end();
    return;
  }

  const bucket = new mongoose.mongo.GridFSBucket(database, {
    bucketName: MODEL_BUCKET_NAME
  });
  const downloadStream = bucket.openDownloadStream(fileId);

  downloadStream.on("error", (error) => {
    if (!res.headersSent) {
      res.status(500).json({ message: "3D model could not be read" });
      return;
    }

    res.destroy(error);
  });
  downloadStream.pipe(res);
});

export const getModelManifest = asyncHandler(async (req, res) => {
  const fileId = parseObjectId(req.params.fileId, "model ID");
  const { files } = await getModelCollections();
  const file = await files.findOne({ _id: fileId });

  if (!file) {
    throw new ApiError(404, "3D model was not found");
  }

  res.set("Cache-Control", "public, max-age=31536000, immutable");
  res.json({
    size: file.length,
    contentType: file.contentType || "model/gltf-binary",
    chunkSize: file.chunkSize,
    totalChunks: Math.ceil(file.length / file.chunkSize)
  });
});

export const serveModelChunk = asyncHandler(async (req, res) => {
  const fileId = parseObjectId(req.params.fileId, "model ID");
  const chunkIndex = Number(req.params.chunkIndex);

  if (!Number.isInteger(chunkIndex) || chunkIndex < 0) {
    throw new ApiError(400, "Invalid model chunk index");
  }

  const { chunks, files } = await getModelCollections();
  const [file, chunk] = await Promise.all([
    files.findOne({ _id: fileId }, { projection: { contentType: 1 } }),
    chunks.findOne({ files_id: fileId, n: chunkIndex })
  ]);

  if (!file || !chunk) {
    throw new ApiError(404, "3D model chunk was not found");
  }

  const chunkBuffer = getChunkBuffer(chunk.data);
  res.set({
    "Content-Type": "application/octet-stream",
    "Content-Length": String(chunkBuffer.length),
    "Cache-Control": "public, max-age=31536000, immutable",
    "X-Model-Content-Type": file.contentType || "model/gltf-binary"
  });
  res.send(chunkBuffer);
});
