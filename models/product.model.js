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

    category: {
      type: String,
      required: true,
      trim: true,
      lowercase: true, // optional but recommended
    },

    color: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
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

export default mongoose.model("Product", productSchema);
