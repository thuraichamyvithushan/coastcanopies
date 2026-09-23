import { ContactShadows, Environment, Lightformer } from "@react-three/drei";
import { Canvas } from "@react-three/fiber";
import { Component, useEffect, useMemo, useState } from "react";
import { modelTransforms } from "../../config/modelTransforms.js";
import { AccessoryModel } from "./AccessoryModel.jsx";
import { CameraControls } from "./CameraControls.jsx";
import { VehicleModel } from "./VehicleModel.jsx";

const views = ["front", "rear", "left", "right", "reset"];

const canUseWebGL = () => {
  if (typeof window === "undefined") return false;
  return Boolean(window.WebGL2RenderingContext || window.WebGLRenderingContext);
};

const WebGLUnavailable = ({ onRetry }) => (
  <div className="relative flex h-full min-h-[50vh] items-center justify-center overflow-hidden bg-[#131313] px-6 text-center lg:min-h-0">
    <div className="absolute inset-0 opacity-40 [background-image:radial-gradient(circle_at_center,rgba(239,196,0,0.12),transparent_55%)]" />
    <div className="relative max-w-md border border-white/10 bg-black/35 p-6">
      <span className="mx-auto flex h-11 w-11 items-center justify-center border border-[#efc400]/50 text-lg text-[#efc400]">3D</span>
      <h2 className="mt-4 text-lg font-semibold text-white">3D renderer paused</h2>
      <p className="mt-2 text-sm leading-6 text-white/50">
        The browser could not start or recover its WebGL context. This can happen after GPU memory pressure or when hardware acceleration is unavailable.
      </p>
      {onRetry ? (
        <button
          type="button"
          onClick={onRetry}
          className="mt-5 bg-[#efc400] px-5 py-3 text-xs font-semibold uppercase tracking-[0.18em] text-black transition hover:bg-[#d9ad00]"
        >
          Retry 3D
        </button>
      ) : null}
    </div>
  </div>
);

class ViewerErrorBoundary extends Component {
  state = { failed: false };

  static getDerivedStateFromError() {
    return { failed: true };
  }

  componentDidCatch(error) {
    console.warn("The 3D viewer could not start.", error?.message || error);
  }

  render() {
    return this.state.failed ? this.props.fallback : this.props.children;
  }
}

const WebGLViewer = ({
  selectedIds,
  rooftopTentState,
  awningState,
  focusedAccessoryId,
  cameraResetKey,
  modelOverrides,
  accessories,
  onRetry
}) => {
  const [viewRequest, setViewRequest] = useState({ name: "reset", nonce: 0 });
  const [contextLost, setContextLost] = useState(false);

  useEffect(() => {
    setViewRequest((current) => ({ name: "reset", nonce: current.nonce + 1 }));
  }, [cameraResetKey]);

  const focusPosition = useMemo(() => {
    const focusedAccessory = accessories.find((item) => item.id === focusedAccessoryId);
    if (!focusedAccessory) return null;

    const overridePosition = focusedAccessory.adminProduct?.modelPosition;
    if (
      overridePosition &&
      ["x", "y", "z"].some((axis) => Number(overridePosition[axis] || 0) !== 0)
    ) {
      return [Number(overridePosition.x), Number(overridePosition.y), Number(overridePosition.z)];
    }

    return modelTransforms[focusedAccessory.transformId || focusedAccessory.id]?.position || null;
  }, [accessories, focusedAccessoryId]);

  if (contextLost) return <WebGLUnavailable onRetry={onRetry} />;

  return (
    <div className="relative h-full min-h-[50vh] overflow-hidden bg-[#e5e7eb] lg:min-h-0">
      <Canvas
        camera={{ position: [7.3, 3.3, 8.3], fov: 36, near: 0.1, far: 80 }}
        dpr={[1, 1.25]}
        shadows
        gl={{ antialias: true, powerPreference: "default", failIfMajorPerformanceCaveat: false }}
        onCreated={({ gl }) => {
          gl.domElement.addEventListener(
            "webglcontextlost",
            (event) => {
              event.preventDefault();
              setContextLost(true);
            },
            { once: true }
          );
        }}
      >
        <color attach="background" args={["#e5e7eb"]} />
        <fog attach="fog" args={["#e5e7eb", 13, 25]} />
        <Environment resolution={128} frames={1}>
          <Lightformer intensity={2} position={[0, 7, 0]} rotation={[Math.PI / 2, 0, 0]} scale={[12, 12, 1]} />
          <Lightformer intensity={2} position={[6, 3, 0]} rotation={[0, -Math.PI / 2, 0]} scale={[10, 6, 1]} />
          <Lightformer intensity={2} position={[-6, 3, 0]} rotation={[0, Math.PI / 2, 0]} scale={[10, 6, 1]} />
        </Environment>
        <hemisphereLight args={["#ffffff", "#d1d5db", 1.15]} />
        <ambientLight intensity={0.65} />
        <directionalLight
          castShadow
          position={[6, 9, 5]}
          intensity={1.8}
          color="#ffffff"
          shadow-mapSize-width={1024}
          shadow-mapSize-height={1024}
        />
        <directionalLight position={[-5, 4, -6]} intensity={0.55} color="#ffffff" />

        <group position={[0, 0.02, 0]}>
          {modelOverrides?.vehicle ? <VehicleModel override={modelOverrides.vehicle} /> : null}
          {accessories.map((accessory) => (
            <AccessoryModel
              key={accessory.id}
              accessory={accessory}
              visible={selectedIds.includes(accessory.id)}
              state={
                accessory.transformId === "rooftop-tent"
                  ? rooftopTentState
                  : accessory.transformId === "awning"
                    ? awningState
                    : undefined
              }
              override={accessory.adminProduct}
            />
          ))}
        </group>

        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.02, 0]} receiveShadow>
          <planeGeometry args={[34, 34]} />
          <meshStandardMaterial color="#e5e7eb" roughness={0.92} metalness={0} />
        </mesh>
        <ContactShadows position={[0, 0.01, 0]} opacity={0.52} scale={13} blur={2.2} far={5} />
        <CameraControls request={viewRequest} focusPosition={focusPosition} />
      </Canvas>

      <div className="absolute bottom-3 left-1/2 flex -translate-x-1/2 gap-1 border border-white/10 bg-black/70 p-1.5 backdrop-blur md:bottom-5">
        {views.map((view) => (
          <button
            key={view}
            type="button"
            onClick={() => setViewRequest((current) => ({ name: view, nonce: current.nonce + 1 }))}
            className="px-2.5 py-2 text-[9px] uppercase tracking-[0.16em] text-white/65 transition hover:bg-[#efc400] hover:text-black sm:px-3 sm:text-[10px]"
          >
            {view === "reset" ? "Reset view" : view}
          </button>
        ))}
      </div>

      <div className="pointer-events-none absolute left-4 top-4 border-l-2 border-[#efc400] pl-3 text-slate-800 md:left-6 md:top-6">
        <p className="text-[10px] uppercase tracking-[0.28em] text-slate-500">Interactive 3D</p>
        <p className="mt-1 text-xs text-slate-600">Drag to rotate · Scroll to zoom</p>
      </div>
      {!modelOverrides?.vehicle ? (
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center px-6 text-center text-slate-600">
          Select your vehicle to start your preview.
        </div>
      ) : !modelOverrides.vehicle.modelUrl ? (
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center px-6 text-center text-slate-600">
          A 3D preview is not available for {modelOverrides.vehicle.name} yet.
        </div>
      ) : null}
    </div>
  );
};

export const Viewer3D = (props) => {
  const [renderAttempt, setRenderAttempt] = useState(0);
  const retry = () => setRenderAttempt((attempt) => attempt + 1);

  if (!canUseWebGL()) return <WebGLUnavailable onRetry={retry} />;

  return (
    <ViewerErrorBoundary key={renderAttempt} fallback={<WebGLUnavailable onRetry={retry} />}>
      <WebGLViewer {...props} onRetry={retry} />
    </ViewerErrorBoundary>
  );
};
