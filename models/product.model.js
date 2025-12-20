import mongoose from "mongoose";

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    description: {
      type: String,
    },

    price: {
      type: Number,
      required: true,
    },

    image: {
      type: String,
      required: true,
    },

    // ✅ NEW
    color: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
    },
      category: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
    },

    // ✅ NEW
    size: {
      type: String,
      required: true,
      uppercase: true,
      trim: true, // S, M, L, XL
    },

    // ✅ NEW (Inventory)
    stock: {
      type: Number,
      required: true,
      min: 0,
    },
  },
  { timestamps: true }
);

export default mongoose.model("Product", productSchema);
