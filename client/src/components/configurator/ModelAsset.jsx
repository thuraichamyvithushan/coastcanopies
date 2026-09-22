import { Component, Suspense, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { useGLTF } from "@react-three/drei";
import { Box3, CanvasTexture, Vector3 } from "three";
import { resolveAssetUrl } from "../../utils/assetUrl.js";

const availabilityCache = new Map();
const LIGHTWEIGHT_MATERIAL_SIZE = 12 * 1024 * 1024;
const MAX_PREVIEW_TEXTURE_SIZE = 1024;

const createPreviewTexture = (sourceTexture) => {
  const image = sourceTexture?.image;
  const width = Number(image?.width || 0);
  const height = Number(image?.height || 0);

  if (!sourceTexture) return { texture: null, owned: false };
  if (!width || !height) return { texture: sourceTexture, owned: false };
  if (Math.max(width, height) <= MAX_PREVIEW_TEXTURE_SIZE) {
    return { texture: sourceTexture, owned: false };
  }

  try {
    const ratio = MAX_PREVIEW_TEXTURE_SIZE / Math.max(width, height);
    const canvas = document.createElement("canvas");
    canvas.width = Math.max(1, Math.round(width * ratio));
    canvas.height = Math.max(1, Math.round(height * ratio));

    const context = canvas.getContext("2d", { alpha: true });
    if (!context) return { texture: sourceTexture, owned: false };

    context.imageSmoothingEnabled = true;
    context.imageSmoothingQuality = "high";
    context.drawImage(image, 0, 0, canvas.width, canvas.height);

    const texture = new CanvasTexture(canvas);
    texture.name = `${sourceTexture.name || "texture"}-preview`;
    texture.mapping = sourceTexture.mapping;
    texture.channel = sourceTexture.channel;
    texture.wrapS = sourceTexture.wrapS;
    texture.wrapT = sourceTexture.wrapT;
    texture.magFilter = sourceTexture.magFilter;
    texture.minFilter = sourceTexture.minFilter;
    texture.anisotropy = 1;
    texture.format = sourceTexture.format;
    texture.type = sourceTexture.type;
    texture.colorSpace = sourceTexture.colorSpace;
    texture.flipY = sourceTexture.flipY;
    texture.premultiplyAlpha = sourceTexture.premultiplyAlpha;
    texture.unpackAlignment = sourceTexture.unpackAlignment;
    texture.offset.copy(sourceTexture.offset);
    texture.repeat.copy(sourceTexture.repeat);
    texture.center.copy(sourceTexture.center);
    texture.rotation = sourceTexture.rotation;
    texture.matrixAutoUpdate = sourceTexture.matrixAutoUpdate;
    texture.needsUpdate = true;

    return { texture, owned: true };
  } catch (error) {
    console.warn("A model texture could not be reduced for preview.", error?.message || error);
    return { texture: sourceTexture, owned: false };
  }
};

const checkModel = (url) => {
  const resolvedUrl = resolveAssetUrl(url);

  if (!availabilityCache.has(resolvedUrl)) {
    availabilityCache.set(
      resolvedUrl,
      fetch(resolvedUrl, { method: "HEAD" })
        .then((response) => {
          const contentType = response.headers.get("content-type") || "";
          const size = Number(response.headers.get("content-length") || 0);
          return {
            available: response.ok && !contentType.includes("text/html"),
            lightweightMaterials: size >= LIGHTWEIGHT_MATERIAL_SIZE
          };
        })
        .catch(() => ({ available: false, lightweightMaterials: false }))
    );
  }

  return availabilityCache.get(resolvedUrl);
};

const useModelAvailability = (url) => {
  const [available, setAvailable] = useState(null);

  useEffect(() => {
    let active = true;
    setAvailable(null);

    if (!url) {
      setAvailable({ available: false, lightweightMaterials: false });
      return () => {
        active = false;
      };
    }

    checkModel(url).then((result) => {
      if (active) setAvailable(result);
    });

    return () => {
      active = false;
    };
  }, [url]);

  return available;
};

class ModelErrorBoundary extends Component {
  state = { failed: false };

  static getDerivedStateFromError() {
    return { failed: true };
  }

  componentDidCatch(error) {
    console.warn("A 3D model could not be displayed; using its fallback.", error?.message || error);
  }

  render() {
    return this.state.failed ? this.props.fallback : this.props.children;
  }
}

const LoadedGlb = ({ url, position, rotation, scale, autoCenter, lightweightMaterials }) => {
  const { scene } = useGLTF(resolveAssetUrl(url));
  const wrapperRef = useRef(null);
  const model = useMemo(() => {
    const next = scene.clone(true);
    const simplifiedMaterials = new Map();
    const previewTextures = new Map();

    const getPreviewTexture = (texture) => {
      if (!texture) return null;
      if (!previewTextures.has(texture.uuid)) {
        previewTextures.set(texture.uuid, createPreviewTexture(texture));
      }
      return previewTextures.get(texture.uuid).texture;
    };

    next.traverse((node) => {
      if (node.isMesh) {
        node.castShadow = !lightweightMaterials;
        node.receiveShadow = true;

        if (lightweightMaterials) {
          const simplifyMaterial = (material) => {
            if (!material) return material;
            if (!simplifiedMaterials.has(material.uuid)) {
              const previewMaterial = material.clone();
              const hadMetalnessMap = Boolean(material.metalnessMap);
              const hadRoughnessMap = Boolean(material.roughnessMap);
              previewMaterial.map = getPreviewTexture(material.map);
              previewMaterial.emissiveMap = getPreviewTexture(material.emissiveMap);

              // Keep the model's real painted colour while dropping large lighting-detail
              // maps that previously exhausted WebGL texture memory.
              [
                "normalMap",
                "roughnessMap",
                "metalnessMap",
                "aoMap",
                "bumpMap",
                "displacementMap",
                "clearcoatMap",
                "clearcoatNormalMap",
                "clearcoatRoughnessMap",
                "sheenColorMap",
                "sheenRoughnessMap",
                "specularColorMap",
                "specularIntensityMap",
                "transmissionMap",
                "thicknessMap"
              ].forEach((property) => {
                if (property in previewMaterial) previewMaterial[property] = null;
              });

              // Meshy GLBs commonly use a metallic-roughness texture with a factor
              // of 1. Once that large texture is removed, retaining the factor
              // makes the whole model reflect the dark studio and appear black.
              // Use a neutral fallback so the embedded base-colour texture remains
              // visible and keeps the product's authored colour in the preview.
              if (hadMetalnessMap && "metalness" in previewMaterial) {
                previewMaterial.metalness = 0.08;
              }
              if (hadRoughnessMap && "roughness" in previewMaterial) {
                previewMaterial.roughness = 0.72;
              }

              previewMaterial.needsUpdate = true;
              simplifiedMaterials.set(material.uuid, previewMaterial);
            }
            return simplifiedMaterials.get(material.uuid);
          };

          node.material = Array.isArray(node.material)
            ? node.material.map(simplifyMaterial)
            : simplifyMaterial(node.material);
        }
      }
    });
    next.userData.simplifiedMaterials = Array.from(simplifiedMaterials.values());
    next.userData.previewTextures = Array.from(previewTextures.values())
      .filter((entry) => entry.owned)
      .map((entry) => entry.texture);
    return next;
  }, [lightweightMaterials, scene]);

  useEffect(
    () => () => {
      model.userData.simplifiedMaterials?.forEach((material) => material.dispose());
      model.userData.previewTextures?.forEach((texture) => texture.dispose());
    },
    [model]
  );

  useLayoutEffect(() => {
    if (!autoCenter || !wrapperRef.current) return;

    wrapperRef.current.position.set(0, 0, 0);
    wrapperRef.current.updateWorldMatrix(true, true);
    const box = new Box3().setFromObject(wrapperRef.current);
    if (box.isEmpty()) return;

    const center = new Vector3();
    box.getCenter(center);
    wrapperRef.current.position.set(-center.x, -box.min.y, -center.z);
  }, [autoCenter, model, position, rotation, scale]);

  return (
    <group ref={wrapperRef}>
      <primitive object={model} position={position} rotation={rotation} scale={scale} />
    </group>
  );
};

export const ModelAsset = ({
  url,
  position = [0, 0, 0],
  rotation = [0, 0, 0],
  scale = [1, 1, 1],
  placeholder,
  autoCenter = false
}) => {
  const availability = useModelAvailability(url);
  const fallback = placeholder;

  if (availability?.available === false) return fallback;
  if (availability === null) return placeholder;

  return (
    <ModelErrorBoundary key={url} fallback={fallback}>
      <Suspense fallback={placeholder}>
        <LoadedGlb
          url={url}
          position={position}
          rotation={rotation}
          scale={scale}
          autoCenter={autoCenter}
          lightweightMaterials={availability.lightweightMaterials}
        />
      </Suspense>
    </ModelErrorBoundary>
  );
};
