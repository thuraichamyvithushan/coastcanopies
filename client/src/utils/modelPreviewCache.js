import { CanvasTexture } from "three";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import { DRACOLoader } from "three/addons/loaders/DRACOLoader.js";
import { MeshoptDecoder } from "three/addons/libs/meshopt_decoder.module.js";

const modelCache = new Map();
const MAX_IDLE_MODELS = 3;
const MAX_IDLE_BYTES = 128 * 1024 * 1024;
const MAX_TEXTURE_SIZE = 1024;
const DOWNLOAD_CONCURRENCY = 4;
const loader = new GLTFLoader();
loader.setDRACOLoader(new DRACOLoader().setDecoderPath("https://www.gstatic.com/draco/versioned/decoders/1.5.5/"));
loader.setMeshoptDecoder(MeshoptDecoder);

const resizeTexture = (sourceTexture) => {
  const image = sourceTexture.image;
  const width = Number(image?.width || 0);
  const height = Number(image?.height || 0);
  if (!width || !height || Math.max(width, height) <= MAX_TEXTURE_SIZE) return sourceTexture;

  const canvas = document.createElement("canvas");
  const ratio = MAX_TEXTURE_SIZE / Math.max(width, height);
  canvas.width = Math.max(1, Math.round(width * ratio));
  canvas.height = Math.max(1, Math.round(height * ratio));
  const context = canvas.getContext("2d", { alpha: true });
  if (!context) return sourceTexture;
  try {
    context.drawImage(image, 0, 0, canvas.width, canvas.height);
  } catch {
    return sourceTexture;
  }

  const texture = new CanvasTexture(canvas);
  const previewSource = texture.source;
  texture.copy(sourceTexture);
  texture.source = previewSource;
  texture.anisotropy = 1;
  texture.needsUpdate = true;
  return texture;
};

const prepareScene = (scene, size) => {
  const textures = new Map();
  const materials = new Set();
  scene.traverse((node) => {
    if (!node.isMesh) return;
    node.castShadow = size < 12 * 1024 * 1024;
    node.receiveShadow = true;
    const nodeMaterials = Array.isArray(node.material) ? node.material : [node.material];
    nodeMaterials.forEach((material) => {
      if (!material || materials.has(material)) return;
      materials.add(material);
      Object.keys(material).forEach((property) => {
        const texture = material[property];
        if (!texture?.isTexture) return;
        if (!textures.has(texture)) textures.set(texture, resizeTexture(texture));
        material[property] = textures.get(texture);
      });
    });
  });
  textures.forEach((preview, original) => {
    if (preview !== original) original.dispose();
  });
  return scene;
};

const disposeScene = (scene) => {
  const resources = new Set();
  scene?.traverse((node) => {
    if (node.geometry) resources.add(node.geometry);
    const materials = Array.isArray(node.material) ? node.material : [node.material];
    materials.filter(Boolean).forEach((material) => {
      resources.add(material);
      Object.values(material).forEach((value) => {
        if (value?.isTexture) resources.add(value);
      });
    });
  });
  resources.forEach((resource) => resource.dispose());
};

const trimCache = () => {
  const idle = [...modelCache.values()]
    .filter((entry) => entry.users === 0 && entry.status !== "loading")
    .sort((first, second) => first.lastUsed - second.lastUsed);
  let idleBytes = idle.reduce((total, entry) => total + entry.size, 0);
  while (idle.length > MAX_IDLE_MODELS || idleBytes > MAX_IDLE_BYTES) {
    const entry = idle.shift();
    idleBytes -= entry.size;
    modelCache.delete(entry.url);
    disposeScene(entry.scene);
  }
};

const publish = (entry) => entry.listeners.forEach((listener) => listener());

const downloadModel = async (entry) => {
  if (!entry.url.includes("/api/models/")) {
    const response = await fetch(entry.url, { signal: entry.controller.signal });
    if (!response.ok) throw new Error(`Model download failed (${response.status})`);
    const buffer = await response.arrayBuffer();
    entry.size = buffer.byteLength;
    return buffer;
  }

  const response = await fetch(`${entry.url}/manifest`, { signal: entry.controller.signal });
  if (!response.ok) throw new Error(`Model manifest could not be loaded (${response.status})`);
  const manifest = await response.json();
  const totalChunks = Number(manifest.totalChunks);
  if (!Number.isInteger(totalChunks) || totalChunks <= 0) throw new Error("Model manifest is invalid");
  entry.size = Number(manifest.size) || 0;
  const buffers = new Array(totalChunks);
  let nextChunkIndex = 0;
  let downloadedBytes = 0;
  let completedChunks = 0;
  const worker = async () => {
    while (nextChunkIndex < totalChunks) {
      const chunkIndex = nextChunkIndex++;
      const chunkResponse = await fetch(`${entry.url}/chunks/${chunkIndex}`, { signal: entry.controller.signal });
      if (!chunkResponse.ok) throw new Error(`Model chunk ${chunkIndex} could not be loaded (${chunkResponse.status})`);
      buffers[chunkIndex] = await chunkResponse.arrayBuffer();
      downloadedBytes += buffers[chunkIndex].byteLength;
      completedChunks += 1;
      entry.progress = Math.min(100, Math.round(entry.size
        ? downloadedBytes / entry.size * 100
        : completedChunks / totalChunks * 100));
      publish(entry);
    }
  };
  await Promise.all(Array.from({ length: Math.min(DOWNLOAD_CONCURRENCY, totalChunks) }, worker));
  entry.size = downloadedBytes;
  return new Blob(buffers).arrayBuffer();
};

const getEntry = (url) => {
  let entry = modelCache.get(url);
  if (entry?.status === "error") {
    modelCache.delete(url);
    entry = null;
  }
  if (!entry) {
    entry = {
      url,
      users: 0,
      status: "loading",
      progress: 0,
      size: 0,
      scene: null,
      error: null,
      controller: new AbortController(),
      listeners: new Set(),
      lastUsed: Date.now()
    };
    modelCache.set(url, entry);
    entry.promise = downloadModel(entry)
      .then(async (buffer) => {
        entry.progress = 100;
        publish(entry);
        const basePath = url.slice(0, url.lastIndexOf("/") + 1);
        const gltf = await loader.parseAsync(buffer, basePath);
        entry.scene = prepareScene(gltf.scene, entry.size);
        entry.status = "ready";
        publish(entry);
        trimCache();
      })
      .catch((error) => {
        entry.controller.abort();
        entry.status = "error";
        entry.error = error;
        publish(entry);
        trimCache();
      });
  }
  entry.lastUsed = Date.now();
  return entry;
};

export const acquireModelPreview = (url, onChange) => {
  const entry = getEntry(url);
  entry.users += 1;
  entry.listeners.add(onChange);
  let released = false;
  return {
    entry,
    release: () => {
      if (released) return;
      released = true;
      entry.listeners.delete(onChange);
      entry.users -= 1;
      entry.lastUsed = Date.now();
      queueMicrotask(trimCache);
    }
  };
};

export const preloadModelPreview = (url) => {
  if (!url || [...modelCache.values()].some((entry) => entry.status === "loading")) return;
  getEntry(url);
};
