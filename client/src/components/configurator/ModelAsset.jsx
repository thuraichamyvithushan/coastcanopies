import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { Html } from "@react-three/drei";
import { Box3, Vector3 } from "three";
import { resolveAssetUrl } from "../../utils/assetUrl.js";
import { acquireModelPreview } from "../../utils/modelPreviewCache.js";

const LoadedModel = ({ scene, position, rotation, scale, autoCenter }) => {
  const wrapperRef = useRef(null);
  const model = useMemo(() => scene.clone(true), [scene]);

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
    <group ref={wrapperRef} dispose={null}>
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
  autoCenter = false,
  name = "3D model"
}) => {
  const resolvedUrl = resolveAssetUrl(url);
  const [snapshot, setSnapshot] = useState(null);
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    if (!resolvedUrl) return;
    const handle = acquireModelPreview(resolvedUrl, () => setSnapshot({ ...handle.entry }));
    setSnapshot({ ...handle.entry });
    return handle.release;
  }, [resolvedUrl, attempt]);

  if (!resolvedUrl) return placeholder;
  const current = snapshot?.url === resolvedUrl ? snapshot : null;
  if (current?.status === "ready") {
    return <LoadedModel scene={current.scene} position={position} rotation={rotation} scale={scale} autoCenter={autoCenter} />;
  }

  return (
    <>
      {placeholder}
      <Html position={position} center>
        <div role="status" className="w-48 rounded border border-slate-200 bg-white/95 p-3 text-center text-xs text-slate-700 shadow">
          {current?.status === "error" ? (
            <>
              <p>Could not load {name}.</p>
              <button type="button" className="mt-2 font-semibold underline" onClick={() => setAttempt((value) => value + 1)}>Retry preview</button>
            </>
          ) : (
            <>
              <p>{current?.progress === 100 ? "Preparing" : "Loading"} {name}...</p>
              <p className="mt-1 text-slate-500">{current?.progress || 0}%</p>
            </>
          )}
        </div>
      </Html>
    </>
  );
};
