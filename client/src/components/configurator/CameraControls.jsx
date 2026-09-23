import { OrbitControls } from "@react-three/drei";
import { useFrame, useThree } from "@react-three/fiber";
import { useEffect, useRef } from "react";
import { Vector3 } from "three";

const cameraViews = {
  front: { position: [-8.5, 2.4, 0], target: [0, 1.1, 0] },
  rear: { position: [8.5, 2.4, 0], target: [0, 1.1, 0] },
  left: { position: [0, 2.7, 9.2], target: [0, 1.1, 0] },
  right: { position: [0, 2.7, -9.2], target: [0, 1.1, 0] },
  reset: { position: [7.3, 3.3, 8.3], target: [0.2, 1.15, 0] }
};

export const CameraControls = ({ request, focusPosition }) => {
  const controlsRef = useRef(null);
  const destination = useRef(new Vector3(...cameraViews.reset.position));
  const target = useRef(new Vector3(...cameraViews.reset.target));
  const animating = useRef(false);
  const { camera } = useThree();

  useEffect(() => {
    const view = cameraViews[request?.name] || cameraViews.reset;
    destination.current.set(...view.position);
    target.current.set(...view.target);
    animating.current = true;
  }, [request]);

  useEffect(() => {
    if (!focusPosition) return;
    target.current.set(...focusPosition);
    destination.current.set(focusPosition[0] + 5, focusPosition[1] + 2.4, focusPosition[2] + 5);
    animating.current = true;
  }, [focusPosition]);

  useFrame(() => {
    if (!animating.current || !controlsRef.current) return;

    camera.position.lerp(destination.current, 0.09);
    controlsRef.current.target.lerp(target.current, 0.09);
    controlsRef.current.update();

    if (camera.position.distanceTo(destination.current) < 0.025) {
      animating.current = false;
    }
  });

  return (
    <OrbitControls
      ref={controlsRef}
      makeDefault
      enableDamping
      dampingFactor={0.08}
      enablePan={false}
      minDistance={2.5}
      maxDistance={28}
      minPolarAngle={Math.PI / 6}
      maxPolarAngle={Math.PI / 2.02}
      rotateSpeed={0.7}
      zoomSpeed={1.2}
      target={cameraViews.reset.target}
    />
  );
};

