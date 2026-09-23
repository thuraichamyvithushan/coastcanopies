import { modelTransforms } from "../../config/modelTransforms.js";
import { ModelAsset } from "./ModelAsset.jsx";

const multiplyScale = (base, instance = [1, 1, 1]) =>
  base.map((value, index) => value * instance[index]);

const vectorToArray = (value, fallback) =>
  value ? [Number(value.x), Number(value.y), Number(value.z)] : fallback;

const degreesToRadians = (values) => values.map((value) => (value * Math.PI) / 180);

export const AccessoryModel = ({ accessory, visible, state, override }) => {
  if (!visible) return null;

  const transform = modelTransforms[accessory.transformId || accessory.id] || {
    position: [1.1, 1.5, 0],
    rotation: [0, 0, 0],
    scale: [1, 1, 1],
    placeholderSize: [0.8, 0.8, 0.8],
    placeholderColor: "#4b4f52",
    instances: null
  };
  if (!transform) return null;

  const modelUrl = override?.modelUrl || accessory.model;
  const hasCustomTransform = Boolean(
    override &&
      (["x", "y", "z"].some((axis) => Number(override.modelPosition?.[axis] || 0) !== 0) ||
        ["x", "y", "z"].some((axis) => Number(override.modelRotation?.[axis] || 0) !== 0) ||
        ["x", "y", "z"].some((axis) => Number(override.modelScale?.[axis] ?? 1) !== 1))
  );
  const basePosition = hasCustomTransform
    ? vectorToArray(override.modelPosition, transform.position)
    : transform.position;
  const baseRotation = hasCustomTransform
    ? degreesToRadians(vectorToArray(override.modelRotation, transform.rotation))
    : transform.rotation;
  const baseScale = hasCustomTransform
    ? vectorToArray(override.modelScale, transform.scale)
    : transform.scale;
  const instances = hasCustomTransform
    ? [{ position: basePosition, rotation: baseRotation, scale: baseScale }]
    : transform.instances || [
        {
          position: basePosition,
          rotation: baseRotation,
          scale: baseScale
        }
      ];

  return instances.map((instance, index) => {
    const position = instance.position || transform.position;
    const rotation = instance.rotation || transform.rotation;
    const scale = hasCustomTransform ? baseScale : multiplyScale(transform.scale, instance.scale);
    return (
      <ModelAsset
        key={`${accessory.id}-${index}-${modelUrl}`}
        url={modelUrl}
        name={accessory.name}
        position={position}
        rotation={rotation}
        scale={scale}
        placeholder={null}
      />
    );
  });
};
