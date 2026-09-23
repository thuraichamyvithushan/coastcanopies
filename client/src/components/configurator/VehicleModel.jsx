import { modelTransforms } from "../../config/modelTransforms.js";
import { ModelAsset } from "./ModelAsset.jsx";

const vectorToArray = (value, fallback) =>
  value ? [Number(value.x), Number(value.y), Number(value.z)] : fallback;

const degreesToRadians = (values) => values.map((value) => (value * Math.PI) / 180);

export const VehicleModel = ({ vehicle, override }) => {
  const transform = modelTransforms.vehicle;
  const scale = vectorToArray(override?.modelScale, transform.scale);
  const rotation = override?.modelRotation
    ? degreesToRadians(vectorToArray(override.modelRotation, transform.rotation))
    : transform.rotation;
  return (
    <ModelAsset
      url={override?.modelUrl || ""}
      name={override?.name || "vehicle"}
      position={transform.position}
      rotation={rotation}
      scale={scale}
      placeholder={null}
      autoCenter
    />
  );
};
