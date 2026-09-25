import mongoose from "mongoose";

const vector3Schema = new mongoose.Schema(
  {
    x: {
      type: Number,
      required: true
    },
    y: {
      type: Number,
      required: true
    },
    z: {
      type: Number,
      required: true
    }
  },
  {
    _id: false
  }
);

const productPositionSchema = new mongoose.Schema(
  {
    vehicleSlug: {
      type: String,
      required: true,
      trim: true
    },
    x: {
      type: Number,
      required: true
    },
    y: {
      type: Number,
      required: true
    },
    z: {
      type: Number,
      default: 0
    },
    width: {
      type: Number,
      required: true
    },
    height: {
      type: Number,
      required: true
    }
  },
  {
    _id: false
  }
);

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      trim: true
    },
    type: {
      type: String,
      required: true,
      enum: ["canopy", "tray", "accessory"]
    },
    svg: {
      type: String,
      default: "",
      trim: true
    },
    modelUrl: {
      type: String,
      default: "",
      trim: true
    },
    modelScale: {
      type: vector3Schema,
      default: () => ({ x: 1, y: 1, z: 1 })
    },
    modelPosition: {
      type: vector3Schema,
      default: () => ({ x: 0, y: 0, z: 0 })
    },
    modelRotation: {
      type: vector3Schema,
      default: () => ({ x: 0, y: 0, z: 0 })
    },
    price: {
      type: Number,
      required: true,
      min: 0
    },
    positions: {
      type: [productPositionSchema],
      default: []
    },
    description: {
      type: String,
      default: "",
      trim: true
    }
  },
  {
    timestamps: true
  }
);

export const Product = mongoose.model("Product", productSchema);
