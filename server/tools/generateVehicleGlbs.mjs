import fs from "node:fs/promises";
import path from "node:path";

const repoRoot = process.cwd();
const outputDir = path.join(repoRoot, "client", "public", "assets", "vehicles", "models");

const MATERIALS = [
  {
    name: "body",
    pbrMetallicRoughness: {
      baseColorFactor: [0.68, 0.7, 0.74, 1],
      metallicFactor: 0.72,
      roughnessFactor: 0.34
    }
  },
  {
    name: "glass",
    pbrMetallicRoughness: {
      baseColorFactor: [0.12, 0.16, 0.2, 0.72],
      metallicFactor: 0.05,
      roughnessFactor: 0.06
    },
    alphaMode: "BLEND",
    doubleSided: true
  },
  {
    name: "wheel",
    pbrMetallicRoughness: {
      baseColorFactor: [0.08, 0.08, 0.09, 1],
      metallicFactor: 0.08,
      roughnessFactor: 0.88
    }
  },
  {
    name: "trim",
    pbrMetallicRoughness: {
      baseColorFactor: [0.18, 0.19, 0.22, 1],
      metallicFactor: 0.48,
      roughnessFactor: 0.42
    }
  }
];

const vehicleSpecs = [
  {
    slug: "toyota-hilux",
    frontWheelX: -1.14,
    rearWheelX: 1.76,
    frontBumperX: -2.08,
    rearBumperX: 2.32,
    cabFrontX: -1.22,
    cabRearX: 0.22,
    bedRearX: 2.16,
    wheelRadius: 0.49,
    wheelWidth: 0.34,
    trackWidth: 1.62,
    roofY: 1.72,
    hoodY: 1.16,
    windshieldAngleDeg: -26,
    bedTopY: 1.01,
    fenderY: 0.98,
    cabinWidth: 1.72,
    bedWidth: 1.76
  },
  {
    slug: "ford-ranger",
    frontWheelX: -1.17,
    rearWheelX: 1.82,
    frontBumperX: -2.13,
    rearBumperX: 2.4,
    cabFrontX: -1.24,
    cabRearX: 0.25,
    bedRearX: 2.22,
    wheelRadius: 0.5,
    wheelWidth: 0.35,
    trackWidth: 1.65,
    roofY: 1.76,
    hoodY: 1.2,
    windshieldAngleDeg: -24,
    bedTopY: 1.04,
    fenderY: 1.01,
    cabinWidth: 1.74,
    bedWidth: 1.78
  },
  {
    slug: "isuzu-d-max",
    frontWheelX: -1.1,
    rearWheelX: 1.72,
    frontBumperX: -2.03,
    rearBumperX: 2.26,
    cabFrontX: -1.18,
    cabRearX: 0.18,
    bedRearX: 2.1,
    wheelRadius: 0.48,
    wheelWidth: 0.33,
    trackWidth: 1.61,
    roofY: 1.68,
    hoodY: 1.14,
    windshieldAngleDeg: -27,
    bedTopY: 1,
    fenderY: 0.96,
    cabinWidth: 1.7,
    bedWidth: 1.74
  },
  {
    slug: "nissan-navara",
    frontWheelX: -1.08,
    rearWheelX: 1.7,
    frontBumperX: -1.98,
    rearBumperX: 2.2,
    cabFrontX: -1.15,
    cabRearX: 0.16,
    bedRearX: 2.04,
    wheelRadius: 0.47,
    wheelWidth: 0.33,
    trackWidth: 1.6,
    roofY: 1.66,
    hoodY: 1.11,
    windshieldAngleDeg: -29,
    bedTopY: 0.99,
    fenderY: 0.95,
    cabinWidth: 1.69,
    bedWidth: 1.73
  },
  {
    slug: "mitsubishi-triton",
    frontWheelX: -1.07,
    rearWheelX: 1.69,
    frontBumperX: -1.97,
    rearBumperX: 2.18,
    cabFrontX: -1.14,
    cabRearX: 0.14,
    bedRearX: 2.02,
    wheelRadius: 0.47,
    wheelWidth: 0.33,
    trackWidth: 1.6,
    roofY: 1.65,
    hoodY: 1.1,
    windshieldAngleDeg: -31,
    bedTopY: 0.99,
    fenderY: 0.95,
    cabinWidth: 1.68,
    bedWidth: 1.72
  },
  {
    slug: "vw-amarok",
    frontWheelX: -1.18,
    rearWheelX: 1.84,
    frontBumperX: -2.16,
    rearBumperX: 2.42,
    cabFrontX: -1.26,
    cabRearX: 0.27,
    bedRearX: 2.24,
    wheelRadius: 0.5,
    wheelWidth: 0.35,
    trackWidth: 1.67,
    roofY: 1.75,
    hoodY: 1.19,
    windshieldAngleDeg: -25,
    bedTopY: 1.03,
    fenderY: 1,
    cabinWidth: 1.76,
    bedWidth: 1.79
  }
];

const createGroup = () => ({ positions: [], normals: [], indices: [] });

const createGroups = () => ({
  body: createGroup(),
  glass: createGroup(),
  wheel: createGroup(),
  trim: createGroup()
});

const rotateXY = (x, y, rz) => {
  if (!rz) {
    return [x, y];
  }

  const cos = Math.cos(rz);
  const sin = Math.sin(rz);
  return [x * cos - y * sin, x * sin + y * cos];
};

const addVertex = (group, position, normal) => {
  group.positions.push(...position);
  group.normals.push(...normal);
  return group.positions.length / 3 - 1;
};

const addQuad = (group, corners, normal) => {
  const base = group.positions.length / 3;
  corners.forEach((corner) => addVertex(group, corner, normal));
  group.indices.push(base, base + 1, base + 2, base, base + 2, base + 3);
};

const transformPoint = (point, transform) => {
  const [x, y] = rotateXY(point[0], point[1], transform.rz || 0);
  return [transform.cx + x, transform.cy + y, transform.cz + point[2]];
};

const transformNormal = (normal, transform) => {
  const [x, y] = rotateXY(normal[0], normal[1], transform.rz || 0);
  return [x, y, normal[2]];
};

const addBox = (groups, material, transform) => {
  const group = groups[material];
  const hx = transform.sx / 2;
  const hy = transform.sy / 2;
  const hz = transform.sz / 2;

  const faces = [
    {
      normal: [-1, 0, 0],
      corners: [
        [-hx, -hy, -hz],
        [-hx, -hy, hz],
        [-hx, hy, hz],
        [-hx, hy, -hz]
      ]
    },
    {
      normal: [1, 0, 0],
      corners: [
        [hx, -hy, hz],
        [hx, -hy, -hz],
        [hx, hy, -hz],
        [hx, hy, hz]
      ]
    },
    {
      normal: [0, -1, 0],
      corners: [
        [-hx, -hy, hz],
        [-hx, -hy, -hz],
        [hx, -hy, -hz],
        [hx, -hy, hz]
      ]
    },
    {
      normal: [0, 1, 0],
      corners: [
        [-hx, hy, -hz],
        [-hx, hy, hz],
        [hx, hy, hz],
        [hx, hy, -hz]
      ]
    },
    {
      normal: [0, 0, -1],
      corners: [
        [-hx, -hy, -hz],
        [-hx, hy, -hz],
        [hx, hy, -hz],
        [hx, -hy, -hz]
      ]
    },
    {
      normal: [0, 0, 1],
      corners: [
        [-hx, hy, hz],
        [-hx, -hy, hz],
        [hx, -hy, hz],
        [hx, hy, hz]
      ]
    }
  ];

  for (const face of faces) {
    addQuad(
      group,
      face.corners.map((corner) => transformPoint(corner, transform)),
      transformNormal(face.normal, transform)
    );
  }
};

const addCylinderX = (groups, material, { cx, cy, cz, radius, length, segments = 24 }) => {
  const group = groups[material];
  const half = length / 2;
  const startIndex = group.positions.length / 3;

  for (let index = 0; index < segments; index += 1) {
    const angle = (index / segments) * Math.PI * 2;
    const nextAngle = ((index + 1) / segments) * Math.PI * 2;

    const y1 = Math.cos(angle) * radius;
    const z1 = Math.sin(angle) * radius;
    const y2 = Math.cos(nextAngle) * radius;
    const z2 = Math.sin(nextAngle) * radius;

    const sideBase = group.positions.length / 3;
    addVertex(group, [cx - half, cy + y1, cz + z1], [0, Math.cos(angle), Math.sin(angle)]);
    addVertex(group, [cx - half, cy + y2, cz + z2], [0, Math.cos(nextAngle), Math.sin(nextAngle)]);
    addVertex(group, [cx + half, cy + y2, cz + z2], [0, Math.cos(nextAngle), Math.sin(nextAngle)]);
    addVertex(group, [cx + half, cy + y1, cz + z1], [0, Math.cos(angle), Math.sin(angle)]);
    group.indices.push(sideBase, sideBase + 1, sideBase + 2, sideBase, sideBase + 2, sideBase + 3);
  }

  const leftCenter = addVertex(group, [cx - half, cy, cz], [-1, 0, 0]);
  const rightCenter = addVertex(group, [cx + half, cy, cz], [1, 0, 0]);

  for (let index = 0; index < segments; index += 1) {
    const angle = (index / segments) * Math.PI * 2;
    const nextAngle = ((index + 1) / segments) * Math.PI * 2;

    const leftA = addVertex(group, [cx - half, cy + Math.cos(angle) * radius, cz + Math.sin(angle) * radius], [-1, 0, 0]);
    const leftB = addVertex(group, [cx - half, cy + Math.cos(nextAngle) * radius, cz + Math.sin(nextAngle) * radius], [-1, 0, 0]);
    group.indices.push(leftCenter, leftB, leftA);

    const rightA = addVertex(group, [cx + half, cy + Math.cos(angle) * radius, cz + Math.sin(angle) * radius], [1, 0, 0]);
    const rightB = addVertex(group, [cx + half, cy + Math.cos(nextAngle) * radius, cz + Math.sin(nextAngle) * radius], [1, 0, 0]);
    group.indices.push(rightCenter, rightA, rightB);
  }

  return startIndex;
};

const createProxyVehicle = (spec) => {
  const groups = createGroups();

  const bedFrontX = spec.cabRearX + 0.08;
  const cabLength = spec.cabRearX - spec.cabFrontX;
  const bedLength = spec.bedRearX - bedFrontX;
  const cabCenterX = (spec.cabFrontX + spec.cabRearX) / 2;
  const bedCenterX = (bedFrontX + spec.bedRearX) / 2;
  const doorCenterX = (spec.frontWheelX + spec.rearWheelX) / 2 - 0.45;

  addBox(groups, "trim", {
    cx: (spec.frontBumperX + spec.rearBumperX) / 2,
    cy: 0.34,
    cz: 0,
    sx: spec.rearBumperX - spec.frontBumperX - 0.18,
    sy: 0.12,
    sz: 0.12
  });
  addBox(groups, "trim", {
    cx: (spec.frontBumperX + spec.rearBumperX) / 2,
    cy: 0.34,
    cz: 0.56,
    sx: spec.rearBumperX - spec.frontBumperX - 0.18,
    sy: 0.08,
    sz: 0.08
  });
  addBox(groups, "trim", {
    cx: (spec.frontBumperX + spec.rearBumperX) / 2,
    cy: 0.34,
    cz: -0.56,
    sx: spec.rearBumperX - spec.frontBumperX - 0.18,
    sy: 0.08,
    sz: 0.08
  });

  addBox(groups, "body", {
    cx: spec.frontWheelX - 0.22,
    cy: spec.fenderY,
    cz: 0,
    sx: 0.86,
    sy: 0.38,
    sz: spec.cabinWidth
  });
  addBox(groups, "body", {
    cx: spec.frontWheelX - 0.05,
    cy: spec.hoodY,
    cz: 0,
    sx: 1.06,
    sy: 0.2,
    sz: spec.cabinWidth - 0.1
  });
  addBox(groups, "body", {
    cx: spec.frontBumperX + 0.18,
    cy: 0.82,
    cz: 0,
    sx: 0.26,
    sy: 0.34,
    sz: spec.cabinWidth - 0.04
  });
  addBox(groups, "trim", {
    cx: spec.frontBumperX + 0.12,
    cy: 0.94,
    cz: 0,
    sx: 0.08,
    sy: 0.24,
    sz: spec.cabinWidth - 0.38
  });

  addBox(groups, "body", {
    cx: doorCenterX,
    cy: 0.82,
    cz: 0,
    sx: 1.62,
    sy: 0.44,
    sz: spec.cabinWidth - 0.08
  });
  addBox(groups, "body", {
    cx: cabCenterX + 0.02,
    cy: 1.18,
    cz: 0,
    sx: cabLength - 0.08,
    sy: 0.52,
    sz: spec.cabinWidth
  });
  addBox(groups, "body", {
    cx: cabCenterX + 0.14,
    cy: spec.roofY,
    cz: 0,
    sx: cabLength - 0.48,
    sy: 0.14,
    sz: spec.cabinWidth - 0.14
  });
  addBox(groups, "body", {
    cx: spec.cabRearX - 0.02,
    cy: 1.34,
    cz: 0,
    sx: 0.08,
    sy: 0.7,
    sz: spec.cabinWidth - 0.2
  });

  addBox(groups, "glass", {
    cx: spec.cabFrontX + 0.32,
    cy: 1.42,
    cz: 0,
    sx: 0.12,
    sy: 0.86,
    sz: spec.cabinWidth - 0.26,
    rz: (spec.windshieldAngleDeg * Math.PI) / 180
  });
  addBox(groups, "glass", {
    cx: cabCenterX - 0.16,
    cy: 1.46,
    cz: (spec.cabinWidth / 2) - 0.03,
    sx: 0.66,
    sy: 0.34,
    sz: 0.04
  });
  addBox(groups, "glass", {
    cx: cabCenterX + 0.38,
    cy: 1.44,
    cz: (spec.cabinWidth / 2) - 0.03,
    sx: 0.4,
    sy: 0.3,
    sz: 0.04
  });
  addBox(groups, "glass", {
    cx: cabCenterX - 0.16,
    cy: 1.46,
    cz: -(spec.cabinWidth / 2) + 0.03,
    sx: 0.66,
    sy: 0.34,
    sz: 0.04
  });
  addBox(groups, "glass", {
    cx: cabCenterX + 0.38,
    cy: 1.44,
    cz: -(spec.cabinWidth / 2) + 0.03,
    sx: 0.4,
    sy: 0.3,
    sz: 0.04
  });
  addBox(groups, "glass", {
    cx: spec.cabRearX - 0.02,
    cy: 1.42,
    cz: 0,
    sx: 0.04,
    sy: 0.44,
    sz: spec.cabinWidth - 0.3
  });

  addBox(groups, "trim", {
    cx: cabCenterX - 0.05,
    cy: 0.56,
    cz: (spec.cabinWidth / 2) + 0.03,
    sx: 1.74,
    sy: 0.08,
    sz: 0.08
  });
  addBox(groups, "trim", {
    cx: cabCenterX - 0.05,
    cy: 0.56,
    cz: -(spec.cabinWidth / 2) - 0.03,
    sx: 1.74,
    sy: 0.08,
    sz: 0.08
  });
  addBox(groups, "trim", {
    cx: spec.cabFrontX + 0.64,
    cy: 1.2,
    cz: (spec.cabinWidth / 2) + 0.1,
    sx: 0.16,
    sy: 0.1,
    sz: 0.2
  });
  addBox(groups, "trim", {
    cx: spec.cabFrontX + 0.64,
    cy: 1.2,
    cz: -(spec.cabinWidth / 2) - 0.1,
    sx: 0.16,
    sy: 0.1,
    sz: 0.2
  });

  addBox(groups, "body", {
    cx: bedCenterX,
    cy: spec.bedTopY - 0.18,
    cz: 0,
    sx: bedLength,
    sy: 0.12,
    sz: spec.bedWidth
  });
  addBox(groups, "body", {
    cx: bedFrontX + 0.02,
    cy: spec.bedTopY + 0.04,
    cz: 0,
    sx: 0.08,
    sy: 0.44,
    sz: spec.bedWidth - 0.1
  });
  addBox(groups, "body", {
    cx: spec.bedRearX,
    cy: spec.bedTopY + 0.04,
    cz: 0,
    sx: 0.08,
    sy: 0.44,
    sz: spec.bedWidth - 0.12
  });
  addBox(groups, "body", {
    cx: bedCenterX,
    cy: spec.bedTopY + 0.04,
    cz: (spec.bedWidth / 2) - 0.04,
    sx: bedLength - 0.08,
    sy: 0.4,
    sz: 0.08
  });
  addBox(groups, "body", {
    cx: bedCenterX,
    cy: spec.bedTopY + 0.04,
    cz: -(spec.bedWidth / 2) + 0.04,
    sx: bedLength - 0.08,
    sy: 0.4,
    sz: 0.08
  });
  addBox(groups, "body", {
    cx: spec.rearWheelX - 0.04,
    cy: spec.bedTopY + 0.02,
    cz: 0,
    sx: 1.08,
    sy: 0.42,
    sz: spec.bedWidth
  });
  addBox(groups, "trim", {
    cx: spec.rearBumperX - 0.04,
    cy: 0.78,
    cz: 0,
    sx: 0.14,
    sy: 0.22,
    sz: spec.bedWidth - 0.34
  });

  addCylinderX(groups, "wheel", {
    cx: spec.frontWheelX,
    cy: spec.wheelRadius + 0.02,
    cz: spec.trackWidth / 2,
    radius: spec.wheelRadius,
    length: spec.wheelWidth
  });
  addCylinderX(groups, "wheel", {
    cx: spec.frontWheelX,
    cy: spec.wheelRadius + 0.02,
    cz: -spec.trackWidth / 2,
    radius: spec.wheelRadius,
    length: spec.wheelWidth
  });
  addCylinderX(groups, "wheel", {
    cx: spec.rearWheelX,
    cy: spec.wheelRadius + 0.02,
    cz: spec.trackWidth / 2,
    radius: spec.wheelRadius,
    length: spec.wheelWidth
  });
  addCylinderX(groups, "wheel", {
    cx: spec.rearWheelX,
    cy: spec.wheelRadius + 0.02,
    cz: -spec.trackWidth / 2,
    radius: spec.wheelRadius,
    length: spec.wheelWidth
  });

  addCylinderX(groups, "trim", {
    cx: spec.frontWheelX,
    cy: spec.wheelRadius + 0.02,
    cz: spec.trackWidth / 2,
    radius: spec.wheelRadius * 0.48,
    length: spec.wheelWidth + 0.05,
    segments: 18
  });
  addCylinderX(groups, "trim", {
    cx: spec.frontWheelX,
    cy: spec.wheelRadius + 0.02,
    cz: -spec.trackWidth / 2,
    radius: spec.wheelRadius * 0.48,
    length: spec.wheelWidth + 0.05,
    segments: 18
  });
  addCylinderX(groups, "trim", {
    cx: spec.rearWheelX,
    cy: spec.wheelRadius + 0.02,
    cz: spec.trackWidth / 2,
    radius: spec.wheelRadius * 0.48,
    length: spec.wheelWidth + 0.05,
    segments: 18
  });
  addCylinderX(groups, "trim", {
    cx: spec.rearWheelX,
    cy: spec.wheelRadius + 0.02,
    cz: -spec.trackWidth / 2,
    radius: spec.wheelRadius * 0.48,
    length: spec.wheelWidth + 0.05,
    segments: 18
  });

  return groups;
};

const computeMinMax = (array) => {
  const min = [Infinity, Infinity, Infinity];
  const max = [-Infinity, -Infinity, -Infinity];

  for (let index = 0; index < array.length; index += 3) {
    min[0] = Math.min(min[0], array[index]);
    min[1] = Math.min(min[1], array[index + 1]);
    min[2] = Math.min(min[2], array[index + 2]);
    max[0] = Math.max(max[0], array[index]);
    max[1] = Math.max(max[1], array[index + 1]);
    max[2] = Math.max(max[2], array[index + 2]);
  }

  return { min, max };
};

const pad4 = (value) => (4 - (value % 4 || 4)) % 4;

const buildGlb = (groups) => {
  const meshPrimitives = [];
  const bufferViews = [];
  const accessors = [];
  const binChunks = [];
  let byteOffset = 0;

  const pushBinary = (typedArray, target) => {
    const buffer = Buffer.from(typedArray.buffer, typedArray.byteOffset, typedArray.byteLength);
    const padding = Buffer.alloc(pad4(buffer.length));
    const currentOffset = byteOffset;
    binChunks.push(buffer, padding);
    byteOffset += buffer.length + padding.length;
    bufferViews.push({
      buffer: 0,
      byteOffset: currentOffset,
      byteLength: buffer.length,
      target
    });
    return bufferViews.length - 1;
  };

  const pushAccessor = (bufferView, componentType, count, type, min, max) => {
    accessors.push({
      bufferView,
      componentType,
      count,
      type,
      ...(min ? { min } : {}),
      ...(max ? { max } : {})
    });
    return accessors.length - 1;
  };

  for (const [materialIndex, materialName] of ["body", "glass", "wheel", "trim"].entries()) {
    const group = groups[materialName];
    if (!group.positions.length) {
      continue;
    }

    const positions = new Float32Array(group.positions);
    const normals = new Float32Array(group.normals);
    const indices = new Uint32Array(group.indices);
    const { min, max } = computeMinMax(group.positions);

    const positionView = pushBinary(positions, 34962);
    const normalView = pushBinary(normals, 34962);
    const indexView = pushBinary(indices, 34963);

    const positionAccessor = pushAccessor(positionView, 5126, positions.length / 3, "VEC3", min, max);
    const normalAccessor = pushAccessor(normalView, 5126, normals.length / 3, "VEC3");
    const indexAccessor = pushAccessor(indexView, 5125, indices.length, "SCALAR");

    meshPrimitives.push({
      attributes: {
        POSITION: positionAccessor,
        NORMAL: normalAccessor
      },
      indices: indexAccessor,
      material: materialIndex
    });
  }

  const gltf = {
    asset: {
      version: "2.0",
      generator: "Coast Canopies proxy vehicle generator"
    },
    scene: 0,
    scenes: [{ nodes: [0] }],
    nodes: [{ mesh: 0, name: "Vehicle" }],
    meshes: [{ name: "Vehicle", primitives: meshPrimitives }],
    materials: MATERIALS,
    buffers: [{ byteLength: byteOffset }],
    bufferViews,
    accessors
  };

  const jsonBuffer = Buffer.from(JSON.stringify(gltf), "utf8");
  const jsonPadding = Buffer.alloc(pad4(jsonBuffer.length), 0x20);
  const binBuffer = Buffer.concat(binChunks);
  const binPadding = Buffer.alloc(pad4(binBuffer.length));
  const totalLength = 12 + 8 + jsonBuffer.length + jsonPadding.length + 8 + binBuffer.length + binPadding.length;

  const header = Buffer.alloc(12);
  header.writeUInt32LE(0x46546c67, 0);
  header.writeUInt32LE(2, 4);
  header.writeUInt32LE(totalLength, 8);

  const jsonHeader = Buffer.alloc(8);
  jsonHeader.writeUInt32LE(jsonBuffer.length + jsonPadding.length, 0);
  jsonHeader.writeUInt32LE(0x4e4f534a, 4);

  const binHeader = Buffer.alloc(8);
  binHeader.writeUInt32LE(binBuffer.length + binPadding.length, 0);
  binHeader.writeUInt32LE(0x004e4942, 4);

  return Buffer.concat([header, jsonHeader, jsonBuffer, jsonPadding, binHeader, binBuffer, binPadding]);
};

await fs.mkdir(outputDir, { recursive: true });

for (const spec of vehicleSpecs) {
  const groups = createProxyVehicle(spec);
  const glb = buildGlb(groups);
  await fs.writeFile(path.join(outputDir, `${spec.slug}.glb`), glb);
}

console.log(`Generated ${vehicleSpecs.length} proxy vehicle GLB files in ${outputDir}`);
