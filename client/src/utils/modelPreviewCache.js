import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import { DRACOLoader } from "three/addons/loaders/DRACOLoader.js";
import { MeshoptDecoder } from "three/addons/libs/meshopt_decoder.module.js";

const modelCache = new Map();
const MAX_IDLE_MODELS = 8;
const MAX_IDLE_BYTES = 256 * 1024 * 1024;
const CACHE_NAME = "coastcanopies-3d-cache-v1";

const loader = new GLTFLoader();
const dracoLoader = new DRACOLoader();
dracoLoader.setDecoderPath("https://www.gstatic.com/draco/versioned/decoders/1.5.5/");
loader.setDRACOLoader(dracoLoader);
loader.setMeshoptDecoder(MeshoptDecoder);

const prepareScene = (scene, size) => {
  scene.traverse((node) => {
    if (!node.isMesh) return;
    node.castShadow = size < 20 * 1024 * 1024;
    node.receiveShadow = true;
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
    if (!entry) break;
    idleBytes -= entry.size;
    modelCache.delete(entry.url);
    disposeScene(entry.scene);
  }
};

const publish = (entry) => entry.listeners.forEach((listener) => listener());

const downloadModel = async (entry) => {
  // Check browser persistent Cache API first for instant 0ms load
  if (typeof window !== "undefined" && "caches" in window) {
    try {
      const cache = await caches.open(CACHE_NAME);
      const cachedResponse = await cache.match(entry.url);
      if (cachedResponse) {
        const buffer = await cachedResponse.arrayBuffer();
        entry.size = buffer.byteLength;
        entry.progress = 100;
        publish(entry);
        return buffer;
      }
    } catch {
      // Fallback to fetch
    }
  }

  // Direct fast single-stream GET request
  const response = await fetch(entry.url, { signal: entry.controller.signal });
  if (!response.ok) throw new Error(`Model download failed (${response.status})`);

  // Cache in Browser Cache API for future sessions
  if (typeof window !== "undefined" && "caches" in window) {
    try {
      const cache = await caches.open(CACHE_NAME);
      cache.put(entry.url, response.clone()).catch(() => {});
    } catch {}
  }

  const contentLength = Number(response.headers.get("content-length") || 0);
  if (contentLength > 0 && response.body) {
    const reader = response.body.getReader();
    const chunks = [];
    let receivedBytes = 0;

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      chunks.push(value);
      receivedBytes += value.byteLength;
      entry.progress = Math.min(99, Math.round((receivedBytes / contentLength) * 100));
      publish(entry);
    }

    const fullBuffer = new Uint8Array(receivedBytes);
    let offset = 0;
    for (const chunk of chunks) {
      fullBuffer.set(chunk, offset);
      offset += chunk.byteLength;
    }

    entry.size = receivedBytes;
    entry.progress = 100;
    publish(entry);
    return fullBuffer.buffer;
  }

  const buffer = await response.arrayBuffer();
  entry.size = buffer.byteLength;
  entry.progress = 100;
  publish(entry);
  return buffer;
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
        if (error.name === "AbortError") return;
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
  if (!url || modelCache.has(url)) return;
  getEntry(url);
};
