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

const vehicleSchema = new mongoose.Schema(
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
    brand: {
      type: String,
      required: true,
      trim: true
    },
    svgBase: {
      type: String,
      required: true,
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
    canvasSize: {
      width: {
        type: Number,
        required: true
      },
      height: {
        type: Number,
        required: true
      }
    }
  },
  {
    timestamps: true
  }
);

export const Vehicle = mongoose.model("Vehicle", vehicleSchema);
