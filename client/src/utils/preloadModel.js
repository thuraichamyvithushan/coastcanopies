import { resolveAssetUrl } from "./assetUrl.js";

export const preloadModel = (url) => {
  if (!url || globalThis.navigator?.connection?.saveData) return;
  import("./modelPreviewCache.js")
    .then(({ preloadModelPreview }) => preloadModelPreview(resolveAssetUrl(url)))
    .catch(() => {});
};
