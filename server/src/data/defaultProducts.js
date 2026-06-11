const vehiclePositions = {
  "toyota-hilux": { x: 470, y: 170, width: 310, height: 170 },
  "ford-ranger": { x: 472, y: 172, width: 312, height: 168 },
  "isuzu-d-max": { x: 468, y: 174, width: 308, height: 166 },
  "nissan-navara": { x: 466, y: 173, width: 306, height: 167 },
  "mitsubishi-triton": { x: 467, y: 174, width: 307, height: 166 },
  "vw-amarok": { x: 474, y: 171, width: 316, height: 169 }
};

const rackPositions = {
  "toyota-hilux": { x: 455, y: 145, width: 340, height: 58 },
  "ford-ranger": { x: 458, y: 148, width: 344, height: 58 },
  "isuzu-d-max": { x: 452, y: 150, width: 336, height: 56 },
  "nissan-navara": { x: 450, y: 149, width: 334, height: 56 },
  "mitsubishi-triton": { x: 451, y: 150, width: 334, height: 56 },
  "vw-amarok": { x: 460, y: 147, width: 346, height: 58 }
};

const awningPositions = {
  "toyota-hilux": { x: 425, y: 155, width: 380, height: 80 },
  "ford-ranger": { x: 430, y: 158, width: 380, height: 80 },
  "isuzu-d-max": { x: 425, y: 160, width: 372, height: 80 },
  "nissan-navara": { x: 420, y: 159, width: 370, height: 80 },
  "mitsubishi-triton": { x: 422, y: 160, width: 370, height: 80 },
  "vw-amarok": { x: 432, y: 157, width: 384, height: 80 }
};

const ladderPositions = {
  "toyota-hilux": { x: 735, y: 145, width: 40, height: 180 },
  "ford-ranger": { x: 740, y: 146, width: 40, height: 178 },
  "isuzu-d-max": { x: 730, y: 148, width: 40, height: 176 },
  "nissan-navara": { x: 726, y: 147, width: 40, height: 176 },
  "mitsubishi-triton": { x: 728, y: 148, width: 40, height: 176 },
  "vw-amarok": { x: 744, y: 146, width: 40, height: 180 }
};

const underbodyPositions = {
  "toyota-hilux": { x: 520, y: 255, width: 160, height: 72 },
  "ford-ranger": { x: 522, y: 258, width: 160, height: 70 },
  "isuzu-d-max": { x: 516, y: 260, width: 156, height: 68 },
  "nissan-navara": { x: 514, y: 259, width: 156, height: 68 },
  "mitsubishi-triton": { x: 515, y: 260, width: 156, height: 68 },
  "vw-amarok": { x: 524, y: 257, width: 162, height: 70 }
};

const lowerRearPositions = {
  "toyota-hilux": { x: 610, y: 250, width: 140, height: 88 },
  "ford-ranger": { x: 612, y: 252, width: 140, height: 86 },
  "isuzu-d-max": { x: 606, y: 255, width: 136, height: 84 },
  "nissan-navara": { x: 604, y: 254, width: 136, height: 84 },
  "mitsubishi-triton": { x: 605, y: 255, width: 136, height: 84 },
  "vw-amarok": { x: 614, y: 251, width: 142, height: 86 }
};

const tankPositions = {
  "toyota-hilux": { x: 480, y: 280, width: 120, height: 46 },
  "ford-ranger": { x: 484, y: 282, width: 120, height: 44 },
  "isuzu-d-max": { x: 478, y: 284, width: 116, height: 42 },
  "nissan-navara": { x: 476, y: 283, width: 116, height: 42 },
  "mitsubishi-triton": { x: 477, y: 284, width: 116, height: 42 },
  "vw-amarok": { x: 486, y: 281, width: 122, height: 44 }
};

const toPositionsArray = (positions) =>
  Object.entries(positions).map(([vehicleSlug, value]) => ({
    vehicleSlug,
    ...value
  }));

export const defaultProducts = [
  {
    name: "Trade Canopy",
    slug: "trade-canopy",
    type: "canopy",
    svg: "/assets/products/trade-canopy.svg",
    price: 7800,
    description: "Hard-wearing commercial canopy with clean lines and integrated side access.",
    positions: toPositionsArray(vehiclePositions)
  },
  {
    name: "Touring Canopy",
    slug: "touring-canopy",
    type: "canopy",
    svg: "/assets/products/touring-canopy.svg",
    price: 9400,
    description: "Adventure-focused canopy package with increased height and touring profile.",
    positions: toPositionsArray(vehiclePositions)
  },
  {
    name: "Premium Canopy",
    slug: "premium-canopy",
    type: "canopy",
    svg: "/assets/products/premium-canopy.svg",
    price: 11800,
    description: "Premium canopy shell with flush glazing and elevated finish detailing.",
    positions: toPositionsArray(vehiclePositions)
  },
  {
    name: "Tray + Canopy Package",
    slug: "tray-canopy-package",
    type: "canopy",
    svg: "/assets/products/tray-canopy-package.svg",
    price: 15900,
    description: "Integrated tray and canopy conversion for a full premium touring build.",
    positions: toPositionsArray(vehiclePositions)
  },
  {
    name: "Drawer System",
    slug: "drawer-system",
    type: "module",
    svg: "/assets/products/drawer-system.svg",
    price: 2450,
    description: "Twin heavy-duty drawer package for secure daily storage.",
    positions: toPositionsArray(lowerRearPositions)
  },
  {
    name: "Storage Boxes",
    slug: "storage-boxes",
    type: "module",
    svg: "/assets/products/storage-boxes.svg",
    price: 1780,
    description: "Lockable side-mounted storage boxes for tools and recovery gear.",
    positions: toPositionsArray(underbodyPositions)
  },
  {
    name: "Battery System",
    slug: "battery-system",
    type: "module",
    svg: "/assets/products/battery-system.svg",
    price: 3200,
    description: "Dual-battery power management module for touring and refrigeration.",
    positions: toPositionsArray(underbodyPositions)
  },
  {
    name: "Roof Rack System",
    slug: "roof-rack-system",
    type: "module",
    svg: "/assets/products/roof-rack-system.svg",
    price: 1980,
    description: "Low-profile roof rack platform for boards, swags, and load bars.",
    positions: toPositionsArray(rackPositions)
  },
  {
    name: "Awning",
    slug: "awning",
    type: "accessory",
    svg: "/assets/products/awning.svg",
    price: 890,
    description: "Side-mounted awning for instant weather cover at camp or on site.",
    positions: toPositionsArray(awningPositions)
  },
  {
    name: "Ladder",
    slug: "ladder",
    type: "accessory",
    svg: "/assets/products/ladder.svg",
    price: 620,
    description: "Rear ladder for fast roof access and overland utility.",
    positions: toPositionsArray(ladderPositions)
  },
  {
    name: "Fridge Slide",
    slug: "fridge-slide",
    type: "accessory",
    svg: "/assets/products/fridge-slide.svg",
    price: 940,
    description: "Locking fridge slide system for touring-ready storage.",
    positions: toPositionsArray(lowerRearPositions)
  },
  {
    name: "Water Tank",
    slug: "water-tank",
    type: "accessory",
    svg: "/assets/products/water-tank.svg",
    price: 760,
    description: "Integrated under-tray water storage tank for extended travel.",
    positions: toPositionsArray(tankPositions)
  }
];
