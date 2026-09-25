import { modelTransforms } from "../../config/modelTransforms.js";
import { ModelAsset } from "./ModelAsset.jsx";
import { previewKey } from "../../utils/previewKey.js";

const multiplyScale = (base, instance = [1, 1, 1]) =>
  base.map((value, index) => value * instance[index]);

const vectorToArray = (value, fallback) =>
  value ? [Number(value.x), Number(value.y), Number(value.z)] : fallback;

const degreesToRadians = (values) => values.map((value) => (value * Math.PI) / 180);

export const AccessoryModel = ({ accessory, visible, state, override, previewVersion, onModelStatusChange }) => {
  if (!visible) return null;

  const transform = modelTransforms[accessory.transformId || accessory.id] || {
    position: [0, 0, 0],
    rotation: [0, 0, 0],
    scale: [1, 1, 1],
    instances: null
  };

  const modelUrl = override?.modelUrl || accessory.model;
  const hasOverride = Boolean(override && (override.modelUrl || override.modelPosition || override.modelScale));

  const basePosition = hasOverride && override.modelPosition
    ? vectorToArray(override.modelPosition, transform.position)
    : transform.position;

  const baseRotation = hasOverride && override.modelRotation
    ? degreesToRadians(vectorToArray(override.modelRotation, transform.rotation))
    : transform.rotation;

  const baseScale = hasOverride && override.modelScale
    ? vectorToArray(override.modelScale, transform.scale)
    : transform.scale;

  const instances = hasOverride
    ? [{ position: basePosition, rotation: baseRotation, scale: baseScale }]
    : transform.instances || [
        {
          position: basePosition,
          rotation: baseRotation,
          scale: baseScale
        }
      ];

  return instances.map((instance, index) => {
    const position = instance.position || basePosition;
    const rotation = instance.rotation || baseRotation;
    const scale = hasOverride ? baseScale : multiplyScale(transform.scale, instance.scale);

    return (
      <ModelAsset
        key={`${accessory.id}-${index}-${modelUrl}`}
        url={modelUrl}
        modelType={override?.type || "accessory"}
        previewKey={previewKey(previewVersion, override?.type || "accessory", accessory.id)}
        onStatusChange={onModelStatusChange}
        position={position}
        rotation={rotation}
        scale={scale}
        placeholder={null}
      />
    );
  });
};
