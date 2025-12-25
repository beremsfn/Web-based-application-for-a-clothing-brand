import express from "express";
import User from "../models/user.model.js";
import Product from "../models/product.model.js";
import { protectRoute } from "../middleware/auth.middleware.js";

const router = express.Router();

// Protect all favorite routes
router.use(protectRoute);

/**
 * GET user's favorite products
 */
router.get("/", async (req, res) => {
  try {
    const user = await User.findById(req.user._id).populate({
      path: "favorites",
      select: "name price description image category isFeatured",
    });

    res.json({ favorites: user.favorites });
  } catch (error) {
    console.error("Error fetching favorites:", error);
    res.status(500).json({ message: "Failed to fetch favorites" });
  }
});

/**
 * ADD product to favorites
 */
router.post("/:productId", async (req, res) => {
  try {
    const { productId } = req.params;

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    const user = await User.findById(req.user._id);

    if (!user.favorites.includes(productId)) {
      user.favorites.push(productId);
      await user.save();
    }

    res.json({ message: "Added to favorites" });
  } catch (error) {
    console.error("Error adding favorite:", error);
    res.status(500).json({ message: "Failed to add favorite" });
  }
});

/**
 * REMOVE product from favorites
 */
router.delete("/:productId", async (req, res) => {
  try {
    const { productId } = req.params;

    await User.findByIdAndUpdate(req.user._id, {
      $pull: { favorites: productId },
    });

    res.json({ message: "Removed from favorites" });
  } catch (error) {
    console.error("Error removing favorite:", error);
    res.status(500).json({ message: "Failed to remove favorite" });
  }
});

export default router;
