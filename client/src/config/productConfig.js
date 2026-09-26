const includedAccessory = (config) => ({
  included: true,
  price: 0,
  visible: true,
  defaultVisible: true,
  ...config
});

export const categoryOrder = [
  "Package",
  "Tray & Storage",
  "Canopy",
  "Kitchen",
  "Electrical & Water",
  "Roof & Touring",
  "Accessories",
  "Summary"
];

export const productConfig = {
  brand: "Coast Canopies",
  currency: "NZD",
  standardInclusionCount: 26,
  description:
    "A premium, off-road-ready aluminium tray and canopy system designed for serious touring and work use. Featuring integrated storage, water, power, cooking and sleeping solutions, this setup delivers durability, smart organisation and total self-sufficiency.",
  vehicle: {
    id: "base-vehicle",
    name: "Coast Canopies Base Vehicle"
  },
  accessories: [
    includedAccessory({ id: "tray", name: "Black Ute Tray – 1800L x 1800W", category: "Tray & Storage" }),
    includedAccessory({ id: "trundle-drawer", name: "Trundle Drawer", category: "Tray & Storage" }),
    includedAccessory({ id: "under-tray-toolbox", name: "Rear Under-Tray Toolboxes", category: "Tray & Storage" }),
    includedAccessory({ id: "mud-guard", name: "Mud Guards", category: "Tray & Storage" }),
    includedAccessory({ id: "side-board", name: "Removable Side Boards & Tailgate", category: "Tray & Storage" }),
    includedAccessory({ id: "canopy", adminSlugs: ["premium-canopy", "canopy"], name: "Premium Canopy Box", category: "Canopy" }),
    includedAccessory({ id: "drawer-system", name: "Three-Drawer Driver-Side Storage", category: "Canopy" }),
    includedAccessory({ id: "divider", name: "Internal Canopy Divider", category: "Canopy" }),
    includedAccessory({ id: "gas-bottle-holder", name: "Gas Bottle Holder", category: "Canopy" }),
    includedAccessory({ id: "fridge-50l", name: "50L Upright Fridge", category: "Kitchen" }),
    includedAccessory({ id: "slide-out-kitchen", name: "Slide-Out Kitchen", category: "Kitchen" }),
    includedAccessory({ id: "water-tank-40l", name: "40L Headboard Water Tank", category: "Electrical & Water" }),
    includedAccessory({ id: "water-tank-30l", name: "30L Under-Tray Water Tank", category: "Electrical & Water" }),
    includedAccessory({ id: "solar-panel", name: "Rooftop Solar Panel", category: "Electrical & Water" }),
    includedAccessory({ id: "califont", name: "6L Califont Hot Water Heater", category: "Electrical & Water" }),
    includedAccessory({ id: "roof-rack", adminSlugs: ["roof-rack-system", "roof-rack"], name: "Canopy Roof Racks", category: "Roof & Touring" }),
    includedAccessory({
      id: "rooftop-tent",
      name: "2-Person Rooftop Tent",
      category: "Roof & Touring",
      states: {
        closed: true,
        open: true
      }
    }),
    includedAccessory({
      id: "awning",
      name: "270-Degree Awning",
      category: "Roof & Touring",
      states: {
        closed: true,
        open: true
      }
    }),
    includedAccessory({ id: "ladder", name: "Ladder", category: "Accessories" }),
    includedAccessory({ id: "spare-wheel-holder", name: "Heavy-Duty Spare Wheel Holder", category: "Accessories" }),
    includedAccessory({ id: "spotlight", name: "Tail Spotlight", category: "Accessories" })
  ],
  specificationGroups: [
    {
      name: "Tray & Chassis",
      items: [
        "Black Ute Tray – 1800L x 1800W (includes headboard)",
        "Tray bed",
        "Trundle drawer",
        "Mud guards",
        "Rear under-tray toolboxes – both sides",
        "LED tail lights",
        "Tail spotlight",
        "Removable side boards & tailgate"
      ]
    },
    {
      name: "Water System",
      items: [
        "Water tanks – 40L in headboard & 30L under-tray",
        "6L Califont hot water heater (mounted behind ladder)"
      ]
    },
    {
      name: "Canopy & Storage",
      items: [
        "Canopy box with jack-off legs for easy removal",
        "Spice rack/pantry",
        "LED lighting under canopy doors",
        "Three-drawer setup on the driver’s side",
        "Divider to split canopy into two sections",
        "Gas bottle holder (gas bottle not included)"
      ]
    },
    {
      name: "Kitchen & Refrigeration",
      items: [
        "50L upright fridge",
        "Slide-out kitchen – includes sink, stove & water pump"
      ]
    },
    {
      name: "Electrical & Solar",
      items: ["Electrical circuit system with solar panels on the rooftop tent"]
    },
    {
      name: "Touring Equipment",
      items: [
        "Canopy roof racks",
        "Ladder",
        "Heavy-duty spare wheel holder"
      ]
    },
    {
      name: "Rooftop Tent & Awning",
      items: [
        "Rooftop tent – 2-person",
        "USB charging point and LED lights as part of the rooftop tent",
        "270-degree awning"
      ]
    },
    {
      name: "Construction & Finish",
      items: ["Powder-coated aluminium construction with external stainless steel bolts & fittings"]
    }
  ]
};
