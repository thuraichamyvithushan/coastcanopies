import { Suspense, useLayoutEffect, useMemo, useRef } from "react";
import { OrbitControls, useGLTF } from "@react-three/drei";
import { Canvas, useThree } from "@react-three/fiber";
import { resolveAssetUrl } from "../../utils/assetUrl.js";

const vehicleProfiles = {
  "toyota-hilux": {
    paint: "#7f858d",
    bodyLength: 5.2,
    cabLength: 2.1,
    trayLength: 2.75,
    trayHeight: 0.84,
    cabHeight: 1.48
  },
  "ford-ranger": {
    paint: "#727b87",
    bodyLength: 5.35,
    cabLength: 2.14,
    trayLength: 2.84,
    trayHeight: 0.87,
    cabHeight: 1.52
  },
  "isuzu-d-max": {
    paint: "#8a8e95",
    bodyLength: 5.12,
    cabLength: 2.04,
    trayLength: 2.7,
    trayHeight: 0.82,
    cabHeight: 1.44
  },
  "nissan-navara": {
    paint: "#7a7f86",
    bodyLength: 5.08,
    cabLength: 2.02,
    trayLength: 2.68,
    trayHeight: 0.81,
    cabHeight: 1.42
  },
  "mitsubishi-triton": {
    paint: "#80858c",
    bodyLength: 5.15,
    cabLength: 2.04,
    trayLength: 2.71,
    trayHeight: 0.82,
    cabHeight: 1.43
  },
  "vw-amarok": {
    paint: "#6f7783",
    bodyLength: 5.38,
    cabLength: 2.16,
    trayLength: 2.86,
    trayHeight: 0.88,
    cabHeight: 1.53
  }
};

const canopyProfiles = {
  "trade-canopy": {
    height: 1.2,
    roofLift: 0.04,
    color: "#bbbfc4",
    windowTint: "#1c232b",
    trayConversion: false
  },
  "touring-canopy": {
    height: 1.34,
    roofLift: 0.18,
    color: "#d2d6da",
    windowTint: "#162028",
    trayConversion: false
  },
  "premium-canopy": {
    height: 1.24,
    roofLift: 0.08,
    color: "#f0f2f4",
    windowTint: "#12171d",
    trayConversion: false
  },
  "tray-canopy-package": {
    height: 1.32,
    roofLift: 0.1,
    color: "#d9dde1",
    windowTint: "#162028",
    trayConversion: true
  }
};

const defaultVehicleProfile = vehicleProfiles["toyota-hilux"];
const defaultCanopyProfile = canopyProfiles["trade-canopy"];
const defaultVehicleFrameOffset = { x: 0.28, z: 0 };
const previewFrame = {
  cameraPosition: [0, 3.1, 12.4],
  minDistance: 4.4,
  maxDistance: 18,
  sceneYOffset: 0.18,
  target: [0.24, 1.22, 0]
};

const vehicleFrameOffsets = {
  "toyota-hilux": { x: 0.27, z: 0 },
  "ford-ranger": { x: 0.3, z: 0 },
  "isuzu-d-max": { x: 0.26, z: 0 },
  "nissan-navara": { x: 0.25, z: 0 },
  "mitsubishi-triton": { x: 0.25, z: 0 },
  "vw-amarok": { x: 0.31, z: 0 }
};

const metalProps = {
  color: "#d9dde1",
  roughness: 0.26,
  metalness: 0.88
};

const darkMetalProps = {
  color: "#1c1f24",
  roughness: 0.45,
  metalness: 0.8
};

const rubberProps = {
  color: "#111111",
  roughness: 0.92,
  metalness: 0.08
};

const degreesToRadians = (value) => (Number(value) * Math.PI) / 180;

const normalizeVector3 = (value, fallback) => {
  const vector = [Number(value?.x), Number(value?.y), Number(value?.z)];
  return vector.map((entry, index) => (Number.isFinite(entry) ? entry : fallback[index]));
};

function Wheel({ position }) {
  return (
    <group position={position}>
      <mesh rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.5, 0.5, 0.36, 28]} />
        <meshStandardMaterial {...rubberProps} />
      </mesh>
      <mesh rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.25, 0.25, 0.4, 22]} />
        <meshStandardMaterial color="#c7ccd1" roughness={0.24} metalness={0.9} />
      </mesh>
    </group>
  );
}

function FrameRail({ position, scale }) {
  return (
    <mesh position={position} scale={scale} castShadow receiveShadow>
      <boxGeometry args={[1, 1, 1]} />
      <meshStandardMaterial color="#2a2d31" roughness={0.58} metalness={0.52} />
    </mesh>
  );
}

function ProceduralVehicle({ profile }) {
  return (
    <>
      <mesh position={[-1.55, 0.82, 0]} scale={[1.25, 0.56, 1.64]} castShadow receiveShadow>
        <boxGeometry args={[1, 1, 1]} />
        <meshPhysicalMaterial
          color={profile.paint}
          roughness={0.28}
          metalness={0.82}
          clearcoat={1}
          clearcoatRoughness={0.14}
        />
      </mesh>

      <mesh position={[-0.66, 1.3, 0]} scale={[profile.cabLength, profile.cabHeight, 1.72]} castShadow receiveShadow>
        <boxGeometry args={[1, 1, 1]} />
        <meshPhysicalMaterial
          color={profile.paint}
          roughness={0.24}
          metalness={0.84}
          clearcoat={1}
          clearcoatRoughness={0.14}
        />
      </mesh>

      <mesh position={[-0.72, 1.36, 0.88]} scale={[profile.cabLength - 0.18, profile.cabHeight - 0.18, 0.04]} castShadow>
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial color="#172029" roughness={0.16} metalness={0.5} />
      </mesh>
      <mesh position={[-0.72, 1.36, -0.88]} scale={[profile.cabLength - 0.18, profile.cabHeight - 0.18, 0.04]} castShadow>
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial color="#172029" roughness={0.16} metalness={0.5} />
      </mesh>

      <mesh position={[1.08, profile.trayHeight + 0.12, 0]} scale={[profile.trayLength, 0.56, 1.76]} castShadow receiveShadow>
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial color="#35393e" roughness={0.48} metalness={0.56} />
      </mesh>

      <FrameRail position={[0.1, 0.22, 0.56]} scale={[4.18, 0.12, 0.12]} />
      <FrameRail position={[0.1, 0.22, -0.56]} scale={[4.18, 0.12, 0.12]} />

      <mesh position={[-1.88, 0.82, 0]} scale={[0.22, 0.2, 1.56]} castShadow receiveShadow>
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial color="#f9bf1a" roughness={0.34} metalness={0.72} />
      </mesh>

      <Wheel position={[-1.1, 0.26, 1.02]} />
      <Wheel position={[-1.1, 0.26, -1.02]} />
      <Wheel position={[1.75, 0.26, 1.02]} />
      <Wheel position={[1.75, 0.26, -1.02]} />
    </>
  );
}

function LoadedVehicleModel({ vehicle }) {
  const { scene } = useGLTF(resolveAssetUrl(vehicle.modelUrl));
  const model = useMemo(() => {
    const next = scene.clone(true);
    next.traverse((node) => {
      if (node.isMesh) {
        node.castShadow = true;
        node.receiveShadow = true;
      }
    });
    return next;
  }, [scene]);

  const scale = normalizeVector3(vehicle.modelScale, [1, 1, 1]);
  const position = normalizeVector3(vehicle.modelPosition, [0, 0, 0]);
  const rotation = normalizeVector3(vehicle.modelRotation, [0, 0, 0]).map(degreesToRadians);

  return <primitive object={model} scale={scale} position={position} rotation={rotation} />;
}

function CanopyShell({ trayLength, trayHeight, canopy }) {
  const profile = canopyProfiles[canopy?.slug] || defaultCanopyProfile;
  const canopyWidth = 1.72;
  const canopyLength = trayLength - 0.12;
  const canopyCenterX = 1.1;
  const canopyCenterY = trayHeight + profile.height / 2 + 0.1;

  return (
    <group>
      {profile.trayConversion ? (
        <mesh position={[canopyCenterX, trayHeight + 0.05, 0]} scale={[canopyLength + 0.18, 0.28, 1.76]} castShadow receiveShadow>
          <boxGeometry args={[1, 1, 1]} />
          <meshStandardMaterial color="#b7bcc2" roughness={0.34} metalness={0.78} />
        </mesh>
      ) : null}

      <mesh position={[canopyCenterX, canopyCenterY, 0]} scale={[canopyLength, profile.height, canopyWidth]} castShadow receiveShadow>
        <boxGeometry args={[1, 1, 1]} />
        <meshPhysicalMaterial
          color={profile.color}
          roughness={0.24}
          metalness={0.82}
          clearcoat={1}
          clearcoatRoughness={0.16}
        />
      </mesh>

      <mesh
        position={[canopyCenterX, canopyCenterY + profile.height / 2 + profile.roofLift / 2, 0]}
        scale={[canopyLength - 0.22, profile.roofLift + 0.05, canopyWidth - 0.14]}
        castShadow
        receiveShadow
      >
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial color="#f4f5f6" roughness={0.22} metalness={0.7} />
      </mesh>

      <mesh position={[canopyCenterX - 0.08, canopyCenterY + 0.02, 0.87]} scale={[canopyLength - 0.4, profile.height - 0.22, 0.03]} castShadow>
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial color={profile.windowTint} roughness={0.18} metalness={0.5} />
      </mesh>
      <mesh position={[canopyCenterX - 0.08, canopyCenterY + 0.02, -0.87]} scale={[canopyLength - 0.4, profile.height - 0.22, 0.03]} castShadow>
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial color={profile.windowTint} roughness={0.18} metalness={0.5} />
      </mesh>

      <mesh position={[canopyCenterX + canopyLength / 2 - 0.06, canopyCenterY - 0.02, 0]} scale={[0.05, profile.height - 0.12, canopyWidth - 0.18]} castShadow>
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial color="#15191e" roughness={0.2} metalness={0.45} />
      </mesh>
    </group>
  );
}

function SelectedAddOns({ modules, accessories, trayHeight, trayLength }) {
  const moduleSlugs = new Set(modules.map((item) => item.slug));
  const accessorySlugs = new Set(accessories.map((item) => item.slug));
  const parts = [];

  if (moduleSlugs.has("roof-rack-system")) {
    parts.push(
      <group key="roof-rack">
        <mesh position={[1.1, trayHeight + 1.62, 0]} scale={[trayLength - 0.12, 0.08, 1.82]} castShadow receiveShadow>
          <boxGeometry args={[1, 1, 1]} />
          <meshStandardMaterial {...darkMetalProps} />
        </mesh>
        {[-0.78, 0, 0.78].map((offset) => (
          <mesh key={offset} position={[1.1 + offset, trayHeight + 1.72, 0]} scale={[0.05, 0.18, 1.7]} castShadow receiveShadow>
            <boxGeometry args={[1, 1, 1]} />
            <meshStandardMaterial color="#c4c9ce" roughness={0.28} metalness={0.82} />
          </mesh>
        ))}
      </group>
    );
  }

  if (moduleSlugs.has("drawer-system")) {
    parts.push(
      <mesh key="drawer-system" position={[1.55, trayHeight + 0.16, 0]} scale={[0.95, 0.52, 1.26]} castShadow receiveShadow>
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial color="#2b2f34" roughness={0.56} metalness={0.48} />
      </mesh>
    );
  }

  if (moduleSlugs.has("storage-boxes")) {
    parts.push(
      <group key="storage-boxes">
        <mesh position={[0.55, trayHeight - 0.06, 1.12]} scale={[1.1, 0.44, 0.28]} castShadow receiveShadow>
          <boxGeometry args={[1, 1, 1]} />
          <meshStandardMaterial color="#14181d" roughness={0.56} metalness={0.46} />
        </mesh>
        <mesh position={[0.55, trayHeight - 0.06, -1.12]} scale={[1.1, 0.44, 0.28]} castShadow receiveShadow>
          <boxGeometry args={[1, 1, 1]} />
          <meshStandardMaterial color="#14181d" roughness={0.56} metalness={0.46} />
        </mesh>
      </group>
    );
  }

  if (moduleSlugs.has("battery-system")) {
    parts.push(
      <mesh key="battery-system" position={[0.1, trayHeight + 0.02, -0.66]} scale={[0.76, 0.4, 0.52]} castShadow receiveShadow>
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial color="#f9bf1a" roughness={0.38} metalness={0.6} />
      </mesh>
    );
  }

  if (accessorySlugs.has("awning")) {
    parts.push(
      <group key="awning">
        <mesh position={[0.9, trayHeight + 1.34, 1.08]} scale={[trayLength - 0.12, 0.1, 0.12]} castShadow receiveShadow>
          <boxGeometry args={[1, 1, 1]} />
          <meshStandardMaterial color="#efe6cc" roughness={0.74} metalness={0.08} />
        </mesh>
        <mesh position={[1.95, trayHeight + 0.58, 1.16]} scale={[0.05, 1.05, 0.05]} castShadow receiveShadow>
          <boxGeometry args={[1, 1, 1]} />
          <meshStandardMaterial {...metalProps} />
        </mesh>
      </group>
    );
  }

  if (accessorySlugs.has("ladder")) {
    parts.push(
      <group key="ladder">
        <mesh position={[2.48, trayHeight + 0.74, 0.42]} scale={[0.05, 1.32, 0.05]} castShadow receiveShadow>
          <boxGeometry args={[1, 1, 1]} />
          <meshStandardMaterial {...metalProps} />
        </mesh>
        <mesh position={[2.48, trayHeight + 0.74, 0.72]} scale={[0.05, 1.32, 0.05]} castShadow receiveShadow>
          <boxGeometry args={[1, 1, 1]} />
          <meshStandardMaterial {...metalProps} />
        </mesh>
        {[-0.44, -0.16, 0.12, 0.4].map((offset) => (
          <mesh key={offset} position={[2.48, trayHeight + 0.76 + offset, 0.57]} scale={[0.05, 0.04, 0.34]} castShadow receiveShadow>
            <boxGeometry args={[1, 1, 1]} />
            <meshStandardMaterial {...metalProps} />
          </mesh>
        ))}
      </group>
    );
  }

  if (accessorySlugs.has("fridge-slide")) {
    parts.push(
      <mesh key="fridge-slide" position={[1.85, trayHeight + 0.2, 0.38]} scale={[0.86, 0.4, 0.5]} castShadow receiveShadow>
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial color="#bcc3c8" roughness={0.34} metalness={0.78} />
      </mesh>
    );
  }

  if (accessorySlugs.has("water-tank")) {
    parts.push(
      <mesh key="water-tank" position={[0.18, trayHeight - 0.3, 0]} rotation={[0, 0, Math.PI / 2]} castShadow receiveShadow>
        <cylinderGeometry args={[0.24, 0.24, 1.12, 22]} />
        <meshStandardMaterial color="#5d6975" roughness={0.44} metalness={0.72} />
      </mesh>
    );
  }

  return parts;
}

function TruckScene({ vehicle, canopy, modules, accessories }) {
  const profile = vehicleProfiles[vehicle.slug] || defaultVehicleProfile;
  const trayHeight = profile.trayHeight;
  const frameOffset = vehicleFrameOffsets[vehicle.slug] || defaultVehicleFrameOffset;

  return (
    <group position={[-frameOffset.x, previewFrame.sceneYOffset, -frameOffset.z]}>
      {vehicle.modelUrl ? (
        <Suspense fallback={<ProceduralVehicle profile={profile} />}>
          <LoadedVehicleModel vehicle={vehicle} />
        </Suspense>
      ) : (
        <ProceduralVehicle profile={profile} />
      )}

      {canopy ? <CanopyShell trayLength={profile.trayLength} trayHeight={trayHeight} canopy={canopy} /> : null}
      {canopy ? (
        <SelectedAddOns
          modules={modules}
          accessories={accessories}
          trayHeight={trayHeight}
          trayLength={profile.trayLength}
        />
      ) : null}
    </group>
  );
}

function ShowroomStage() {
  return (
    <>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.68, 0]} receiveShadow>
        <planeGeometry args={[34, 34]} />
        <meshStandardMaterial color="#b8b1b7" roughness={0.94} metalness={0.05} />
      </mesh>

      <mesh position={[0, 5.4, -9.4]} receiveShadow>
        <planeGeometry args={[26, 12]} />
        <meshStandardMaterial color="#e5d9d2" roughness={0.92} metalness={0.03} />
      </mesh>

      <mesh position={[-8.8, 4.6, -3.2]} rotation={[0, Math.PI / 2.7, 0]}>
        <planeGeometry args={[14, 10]} />
        <meshStandardMaterial color="#d6cbc4" roughness={0.98} metalness={0.02} />
      </mesh>

      <mesh position={[8.8, 4.6, -3.2]} rotation={[0, -Math.PI / 2.7, 0]}>
        <planeGeometry args={[14, 10]} />
        <meshStandardMaterial color="#d6cbc4" roughness={0.98} metalness={0.02} />
      </mesh>

      <mesh position={[0, -0.63, -6.8]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[3.8, 9.2, 48]} />
        <meshBasicMaterial color="#9d949c" transparent opacity={0.16} />
      </mesh>

      <mesh position={[0, 4.6, -8.9]}>
        <planeGeometry args={[18, 7]} />
        <meshBasicMaterial color="#f2e9e4" transparent opacity={0.16} />
      </mesh>
    </>
  );
}

function PreviewControls({ sceneKey }) {
  const controlsRef = useRef(null);
  const { camera } = useThree();

  useLayoutEffect(() => {
    camera.position.set(...previewFrame.cameraPosition);
    camera.lookAt(...previewFrame.target);

    if (controlsRef.current) {
      controlsRef.current.target.set(...previewFrame.target);
      controlsRef.current.update();
    }
  }, [camera, sceneKey]);

  return (
    <OrbitControls
      ref={controlsRef}
      makeDefault
      enablePan={false}
      enableDamping
      dampingFactor={0.08}
      minDistance={previewFrame.minDistance}
      maxDistance={previewFrame.maxDistance}
      minPolarAngle={Math.PI / 3.3}
      maxPolarAngle={Math.PI / 2.02}
      rotateSpeed={0.72}
      zoomSpeed={1.35}
      target={previewFrame.target}
    />
  );
}

export default function ThreeDPreview({ vehicle, canopy, modules, accessories }) {
  const sceneKey = [
    vehicle?.slug || "vehicle",
    canopy?.slug || "canopy",
    modules.map((item) => item.slug).join(","),
    accessories.map((item) => item.slug).join(",")
  ].join("|");

  return (
    <Canvas camera={{ position: previewFrame.cameraPosition, fov: 34, near: 0.1, far: 60 }} shadows dpr={[1, 1.8]}>
      <color attach="background" args={["#d8d0cb"]} />
      <fog attach="fog" args={["#d8d0cb", 11, 20]} />

      <ambientLight intensity={1.45} />
      <directionalLight
        castShadow
        position={[7, 8, 5]}
        intensity={2.4}
        color="#ffe1a2"
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
      />
      <directionalLight position={[-6, 4, -5]} intensity={1.1} color="#8ea6ff" />
      <spotLight position={[0, 9, 0]} intensity={1.2} angle={0.3} penumbra={0.6} color="#f9bf1a" />
      <spotLight position={[-6, 7, -2]} intensity={0.6} angle={0.42} penumbra={0.9} color="#f5efe3" />

      <ShowroomStage />

      <TruckScene vehicle={vehicle} canopy={canopy} modules={modules} accessories={accessories} />

      <PreviewControls sceneKey={sceneKey} />
    </Canvas>
  );
}
