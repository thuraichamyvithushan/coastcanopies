const transform = (position, size, options = {}) => ({
  position,
  rotation: options.rotation || [0, 0, 0],
  scale: options.scale || [1, 1, 1],
  placeholderSize: size,
  placeholderColor: options.color || "#4b4f52",
  instances: options.instances || null
});

// These values are intentionally centralised so Meshy exports can be aligned
// without touching rendering components. Rotation values use radians.
export const modelTransforms = {
  vehicle: transform([0, 0, 0], [5.2, 1.65, 1.85], { color: "#6e7378" }),
  tray: transform([1.02, 0.82, 0], [2.72, 0.24, 1.8], { color: "#181a1c" }),
  "trundle-drawer": transform([1.15, 0.55, 0], [1.45, 0.22, 1.3], { color: "#24272a" }),
  "under-tray-toolbox": transform([0.8, 0.58, 0], [1.05, 0.42, 0.28], {
    color: "#202326",
    instances: [
      { position: [0.8, 0.58, 1.05], scale: [1, 1, 1] },
      { position: [0.8, 0.58, -1.05], scale: [1, 1, -1] }
    ]
  }),
  "mud-guard": transform([1.65, 0.52, 0], [0.82, 0.48, 0.18], {
    color: "#111315",
    instances: [
      { position: [1.65, 0.52, 1.02], scale: [1, 1, 1] },
      { position: [1.65, 0.52, -1.02], scale: [1, 1, -1] }
    ]
  }),
  "side-board": transform([1.05, 1.02, 0], [2.65, 0.44, 1.82], { color: "#24272a" }),
  canopy: transform([1.12, 1.65, 0], [2.62, 1.38, 1.74], { color: "#d0d3d4" }),
  "fridge-50l": transform([1.65, 1.55, -0.48], [0.48, 0.86, 0.54], { color: "#d7d9d9" }),
  "slide-out-kitchen": transform([1.55, 1.35, 0.55], [1.05, 0.58, 0.55], { color: "#b9bdbe" }),
  "drawer-system": transform([0.55, 1.42, -0.5], [1.1, 0.8, 0.62], { color: "#33373a" }),
  divider: transform([1.08, 1.62, 0], [0.06, 1.15, 1.52], { color: "#8b9092" }),
  "gas-bottle-holder": transform([2.22, 1.13, -0.55], [0.34, 0.58, 0.34], { color: "#303437" }),
  "roof-rack": transform([1.1, 2.48, 0], [2.55, 0.12, 1.78], { color: "#17191b" }),
  ladder: transform([2.5, 1.55, 0.62], [0.12, 1.42, 0.48], { color: "#b8bcbd" }),
  "spare-wheel-holder": transform([2.55, 1.35, -0.48], [0.28, 0.85, 0.78], { color: "#202326" }),
  "rooftop-tent": transform([1.05, 2.72, 0], [2.35, 0.34, 1.62], { color: "#55514a" }),
  "solar-panel": transform([1.05, 2.92, 0], [1.7, 0.06, 1.1], { color: "#223846" }),
  awning: transform([0.9, 2.4, 1.02], [2.5, 0.15, 0.18], { color: "#d9d0b8" }),
  califont: transform([2.38, 1.48, 0.18], [0.24, 0.55, 0.38], { color: "#d7d9d9" }),
  "water-tank-40l": transform([-0.02, 1.05, 0], [0.42, 0.72, 1.28], { color: "#5e737e" }),
  "water-tank-30l": transform([0.35, 0.47, 0], [1.05, 0.3, 0.62], { color: "#5e737e" }),
  spotlight: transform([2.48, 2.05, 0], [0.18, 0.18, 0.18], { color: "#efc400" })
};

