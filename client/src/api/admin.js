import { request } from "./http.js";

const ensureArrayResponse = (value, label) => {
  if (!Array.isArray(value)) {
    throw new Error(`${label} API returned an unexpected response. Check backend URL and deployment config.`);
  }

  return value;
};

export const loginAdmin = (payload) =>
  request("/api/admin/login", {
    method: "POST",
    body: JSON.stringify(payload)
  });

export const fetchVehicles = async () => ensureArrayResponse(await request("/api/vehicles"), "Vehicles");
export const fetchProducts = async () => ensureArrayResponse(await request("/api/products"), "Products");
export const fetchQuotes = (token) =>
  request("/api/admin/quotes", {
    token
  });

export const uploadVehicleAsset = (token, payload) =>
  request("/api/admin/uploads/vehicle-assets", {
    method: "POST",
    token,
    body: JSON.stringify(payload)
  });

const MAX_MODEL_FILE_SIZE = 200 * 1024 * 1024;
const MODEL_UPLOAD_CONCURRENCY = 4;
const MODEL_UPLOAD_RETRIES = 3;

const wait = (milliseconds) =>
  new Promise((resolve) => {
    window.setTimeout(resolve, milliseconds);
  });

export const uploadModelAsset = async (token, { assetType, file, slug, onProgress }) => {
  if (!file) {
    throw new Error("Choose a GLB model before uploading");
  }

  if (file.size > MAX_MODEL_FILE_SIZE) {
    throw new Error("GLB model must be 200 MB or smaller");
  }

  const upload = await request("/api/admin/uploads/model/init", {
    method: "POST",
    token,
    body: JSON.stringify({
      assetType,
      slug,
      fileName: file.name,
      fileSize: file.size,
      mimeType: file.type || "application/octet-stream"
    })
  });

  let nextChunkIndex = 0;
  let uploadedChunks = 0;

  const uploadChunk = async (chunkIndex) => {
    const chunkStart = chunkIndex * upload.chunkSize;
    const chunk = file.slice(chunkStart, Math.min(chunkStart + upload.chunkSize, file.size));

    for (let attempt = 1; attempt <= MODEL_UPLOAD_RETRIES; attempt += 1) {
      try {
        await request(`/api/admin/uploads/model/${upload.uploadId}/chunks/${chunkIndex}`, {
          method: "PUT",
          token,
          headers: {
            "Content-Type": "application/octet-stream"
          },
          body: chunk
        });
        return;
      } catch (error) {
        if (attempt === MODEL_UPLOAD_RETRIES) {
          throw error;
        }

        await wait(500 * 2 ** (attempt - 1));
      }
    }
  };

  const worker = async () => {
    while (nextChunkIndex < upload.totalChunks) {
      const chunkIndex = nextChunkIndex;
      nextChunkIndex += 1;
      await uploadChunk(chunkIndex);
      uploadedChunks += 1;
      onProgress?.({
        phase: "uploading",
        percent: Math.round((uploadedChunks / upload.totalChunks) * 100),
        uploadedChunks,
        totalChunks: upload.totalChunks
      });
    }
  };

  onProgress?.({
    phase: "uploading",
    percent: 0,
    uploadedChunks: 0,
    totalChunks: upload.totalChunks
  });

  await Promise.all(
    Array.from(
      { length: Math.min(MODEL_UPLOAD_CONCURRENCY, upload.totalChunks) },
      () => worker()
    )
  );

  onProgress?.({
    phase: "finalizing",
    percent: 100,
    uploadedChunks: upload.totalChunks,
    totalChunks: upload.totalChunks
  });

  return request(`/api/admin/uploads/model/${upload.uploadId}/complete`, {
    method: "POST",
    token,
    body: JSON.stringify({})
  });
};

export const createVehicle = (token, payload) =>
  request("/api/admin/vehicles", {
    method: "POST",
    token,
    body: JSON.stringify(payload)
  });

export const updateVehicle = (token, id, payload) =>
  request(`/api/admin/vehicles/${id}`, {
    method: "PUT",
    token,
    body: JSON.stringify(payload)
  });

export const deleteVehicle = (token, id) =>
  request(`/api/admin/vehicles/${id}`, {
    method: "DELETE",
    token
  });

export const createProduct = (token, payload) =>
  request("/api/admin/products", {
    method: "POST",
    token,
    body: JSON.stringify(payload)
  });

export const seedProductCoordinates = (token) =>
  request("/api/admin/products/seed-coordinates", {
    method: "POST",
    token
  });

export const updateProduct = (token, id, payload) =>
  request(`/api/admin/products/${id}`, {
    method: "PUT",
    token,
    body: JSON.stringify(payload)
  });

export const deleteProduct = (token, id) =>
  request(`/api/admin/products/${id}`, {
    method: "DELETE",
    token
  });

export const updateQuoteStatus = (token, id, status) =>
  request(`/api/admin/quotes/${id}/status`, {
    method: "PATCH",
    token,
    body: JSON.stringify({ status })
  });

export const submitQuote = (payload) =>
  request("/api/quotes", {
    method: "POST",
    body: JSON.stringify(payload)
  });
