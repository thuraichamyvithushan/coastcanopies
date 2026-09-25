import { ContactShadows, Environment, Lightformer } from "@react-three/drei";
import { Canvas } from "@react-three/fiber";
import { Component, useEffect, useMemo, useState } from "react";
import { modelTransforms } from "../../config/modelTransforms.js";
import { AccessoryModel } from "./AccessoryModel.jsx";
import { CameraControls } from "./CameraControls.jsx";
import { VehicleModel } from "./VehicleModel.jsx";

const views = ["left", "right", "rear", "front", "reset"];

const ViewIcon = ({ view }) => {
  const arrows = {
    left: <path d="m10 6-6 6 6 6M4 12h16" />,
    right: <path d="m14 6 6 6-6 6M4 12h16" />,
    rear: <path d="m6 14 6 6 6-6M12 4v16" />,
    front: <path d="m6 10 6-6 6 6M12 4v16" />,
    reset: <><path d="M4 11a8 8 0 1 1 2 6" /><path d="M4 5v6h6" /></>
  };

  return <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="h-3.5 w-3.5 sm:h-[18px] sm:w-[18px]">{arrows[view]}</svg>;
};

const canUseWebGL = () => {
  if (typeof window === "undefined") return false;
  return Boolean(window.WebGL2RenderingContext || window.WebGLRenderingContext);
};

const WebGLUnavailable = ({ onRetry }) => (
  <div className="relative flex h-full min-h-0 items-center justify-center overflow-hidden bg-[#fdf8e7] px-4 text-center sm:px-6">
    <div className="absolute inset-0 opacity-40 [background-image:radial-gradient(circle_at_center,rgba(239,196,0,0.12),transparent_55%)]" />
    <div className="relative max-w-md border border-slate-200 bg-white/70 p-6 shadow-sm">
      <span className="mx-auto flex h-11 w-11 items-center justify-center border border-[#efc400]/50 text-lg text-[#efc400]">3D</span>
      <h2 className="mt-4 text-lg font-semibold text-slate-800">3D renderer paused</h2>
      <p className="mt-2 text-sm leading-6 text-slate-600">
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
  previewVersion,
  onModelStatusChange,
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
    <div className="relative h-full min-h-0 overflow-hidden bg-[#fdf8e7]">
      <Canvas
        camera={{ position: [3.8, 2.0, 4.5], fov: 36, near: 0.1, far: 80 }}
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
        <color attach="background" args={["#fdf8e7"]} />
        <fog attach="fog" args={["#fdf8e7", 13, 25]} />
        <Environment resolution={128} frames={1}>
          <Lightformer intensity={2} position={[0, 7, 0]} rotation={[Math.PI / 2, 0, 0]} scale={[12, 12, 1]} />
          <Lightformer intensity={2} position={[6, 3, 0]} rotation={[0, -Math.PI / 2, 0]} scale={[10, 6, 1]} />
          <Lightformer intensity={2} position={[-6, 3, 0]} rotation={[0, Math.PI / 2, 0]} scale={[10, 6, 1]} />
        </Environment>
        <hemisphereLight args={["#ffffff", "#fdf8e7", 1.15]} />
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
          {modelOverrides?.vehicle ? <VehicleModel override={modelOverrides.vehicle} previewVersion={previewVersion} onModelStatusChange={onModelStatusChange} /> : null}
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
              previewVersion={previewVersion}
              onModelStatusChange={onModelStatusChange}
            />
          ))}
        </group>

        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.02, 0]} receiveShadow>
          <planeGeometry args={[34, 34]} />
          <meshStandardMaterial color="#fdf8e7" roughness={0.92} metalness={0} />
        </mesh>
        <ContactShadows position={[0, 0.01, 0]} opacity={0.52} scale={13} blur={2.2} far={5} />
        <CameraControls request={viewRequest} focusPosition={focusPosition} />
      </Canvas>

      <div role="group" aria-label="3D camera views" className="absolute bottom-0 left-1/2 flex -translate-x-1/2 justify-center gap-1 bg-white/85 shadow-sm backdrop-blur lg:bottom-5 lg:gap-1.5 lg:p-1.5">
        {views.map((view) => (
          <button
            key={view}
            type="button"
            aria-label={view === "reset" ? "Reset 3D view" : `${view} 3D view`}
            aria-pressed={viewRequest.name === view}
            title={view === "reset" ? "Reset view" : `${view[0].toUpperCase()}${view.slice(1)} view`}
            onClick={() => setViewRequest((current) => ({ name: view, nonce: current.nonce + 1 }))}
            className={`flex h-9 w-9 shrink-0 items-center justify-center text-slate-700 transition hover:bg-[#efc400] hover:text-black sm:h-10 sm:w-10 lg:h-9 lg:w-auto lg:gap-1.5 lg:px-3 lg:text-[10px] lg:uppercase lg:tracking-[0.1em] ${viewRequest.name === view ? "bg-[#efc400] text-black" : ""}`}
          >
            <ViewIcon view={view} />
            <span className="hidden lg:inline">{view === "reset" ? "Reset" : view}</span>
          </button>
        ))}
      </div>

      <div className="pointer-events-none absolute left-3 top-3 border-l-2 border-[#efc400] pl-2 text-slate-800 md:left-6 md:top-6 md:pl-3">
        <p className="text-[10px] uppercase tracking-[0.28em] text-slate-500">Interactive 3D</p>
        <p className="mt-0.5 text-[10px] text-slate-600 sm:mt-1 sm:text-xs">Drag to rotate · Scroll to zoom</p>
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
