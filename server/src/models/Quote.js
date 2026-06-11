import mongoose from "mongoose";

const quoteItemSchema = new mongoose.Schema(
  {
    referenceId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true
    },
    name: {
      type: String,
      required: true
    },
    slug: {
      type: String,
      required: true
    },
    price: {
      type: Number,
      required: true
    },
    svg: {
      type: String,
      default: ""
    }
  },
  {
    _id: false
  }
);

const quoteSchema = new mongoose.Schema(
  {
    vehicle: {
      type: quoteItemSchema,
      required: true
    },
    baseSystem: {
      type: quoteItemSchema,
      required: true
    },
    modules: {
      type: [quoteItemSchema],
      default: []
    },
    accessories: {
      type: [quoteItemSchema],
      default: []
    },
    totalPrice: {
      type: Number,
      required: true,
      min: 0
    },
    customerInfo: {
      name: {
        type: String,
        required: true
      },
      email: {
        type: String,
        required: true
      },
      phone: {
        type: String,
        required: true
      },
      address: {
        type: String,
        required: true
      },
      notes: {
        type: String,
        default: ""
      }
    },
    status: {
      type: String,
      enum: ["new", "reviewed", "quoted", "closed"],
      default: "new"
    }
  },
  {
    timestamps: true
  }
);

export const Quote = mongoose.model("Quote", quoteSchema);
