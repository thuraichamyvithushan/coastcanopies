import { modelTransforms } from "../../config/modelTransforms.js";
import { ModelAsset } from "./ModelAsset.jsx";
import { previewKey } from "../../utils/previewKey.js";

const vectorToArray = (value, fallback) =>
  value ? [Number(value.x), Number(value.y), Number(value.z)] : fallback;

const degreesToRadians = (values) => values.map((value) => (value * Math.PI) / 180);

export const VehicleModel = ({ override, previewVersion, onModelStatusChange }) => {
  const transform = modelTransforms.vehicle;
  const scale = vectorToArray(override?.modelScale, transform.scale);
  const rotation = override?.modelRotation
    ? degreesToRadians(vectorToArray(override.modelRotation, transform.rotation))
    : transform.rotation;
  return (
    <ModelAsset
      url={override?.modelUrl || ""}
      modelType="vehicle"
      previewKey={previewKey(previewVersion, "vehicle", override?._id)}
      onStatusChange={onModelStatusChange}
      position={transform.position}
      rotation={rotation}
      scale={scale}
      placeholder={null}
      autoCenter
    />
  );
};
