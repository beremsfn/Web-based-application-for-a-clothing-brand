import mongoose from "mongoose";

const inventorySchema = new mongoose.Schema(
  {
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },

    color: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
    },

    gender: {
      type: String,
      required: true,
      lowercase: true,
      enum: ["men", "women", "unisex"],
    },

    size: {
      type: String,
      required: true,
      uppercase: true,
      trim: true,
    },

    stock: {
      type: Number,
      required: true,
      min: 0,
    },
  },
  { timestamps: true }
);

export default mongoose.model("Inventory", inventorySchema);
