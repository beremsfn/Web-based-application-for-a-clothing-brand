import express from "express";
import Product from "../models/product.model.js";
import User from "../models/user.model.js";
import { protectRoute } from "../middleware/auth.middleware.js";

const router = express.Router();

router.use(protectRoute);

const populateUserCart = async (user) => {
  await user.populate({
    path: "cartItems.product",
    select: "name price description image category isFeatured",
  });
  return user;
};

const formatCartResponse = (cartItems = []) =>
  cartItems
    .map((item) => {
      if (!item.product) return null;
      const productData =
        typeof item.product.toObject === "function"
          ? item.product.toObject()
          : item.product;

      return {
        ...productData,
        quantity: item.quantity,
      };
    })
    .filter(Boolean);

router.get("/", async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    await populateUserCart(user);
    return res.json({ cart: formatCartResponse(user.cartItems) });
  } catch (error) {
    console.error("Error fetching cart:", error);
    return res.status(500).json({ message: "Failed to load cart" });
  }
});

router.post("/", async (req, res) => {
  try {
    const { productId } = req.body || {};

    if (!productId) {
      return res.status(400).json({ message: "productId is required" });
    }

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const existingItem = user.cartItems.find(
      (item) => item.product.toString() === productId
    );

    if (existingItem) {
      existingItem.quantity += 1;
    } else {
      user.cartItems.push({ product: productId, quantity: 1 });
    }

    await user.save();
    await populateUserCart(user);

    return res.status(201).json({ cart: formatCartResponse(user.cartItems) });
  } catch (error) {
    console.error("Error adding to cart:", error);
    return res.status(500).json({ message: "Failed to add product to cart" });
  }
});

router.put("/:productId", async (req, res) => {
  try {
    const { productId } = req.params;
    const { quantity } = req.body || {};

    if (!Number.isInteger(quantity) || quantity < 1) {
      return res
        .status(400)
        .json({ message: "Quantity must be a positive integer" });
    }

    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const cartItem = user.cartItems.find(
      (item) => item.product.toString() === productId
    );

    if (!cartItem) {
      return res.status(404).json({ message: "Product not in cart" });
    }

    cartItem.quantity = quantity;
    await user.save();
    await populateUserCart(user);

    return res.json({ cart: formatCartResponse(user.cartItems) });
  } catch (error) {
    console.error("Error updating cart item:", error);
    return res.status(500).json({ message: "Failed to update cart item" });
  }
});

router.delete("/", async (req, res) => {
  try {
    const { productId } = req.body || {};

    if (!productId) {
      return res.status(400).json({ message: "productId is required" });
    }

    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const initialLength = user.cartItems.length;
    user.cartItems = user.cartItems.filter(
      (item) => item.product.toString() !== productId
    );

    if (initialLength === user.cartItems.length) {
      return res.status(404).json({ message: "Product not in cart" });
    }

    await user.save();
    await populateUserCart(user);

    return res.json({ cart: formatCartResponse(user.cartItems) });
  } catch (error) {
    console.error("Error removing cart item:", error);
    return res.status(500).json({ message: "Failed to remove cart item" });
  }
});

export default router;

