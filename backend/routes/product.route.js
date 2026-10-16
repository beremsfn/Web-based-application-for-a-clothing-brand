import express from "express";
import {
  createProduct,
  deleteProduct,
  getAllProducts,
  getFeaturedProducts,
  getProductsByCategory,
  getRecommendedProduct,
  toggleFeaturedProduct,
} from "../controllers/product.controller.js";
import { adminRoute, protectRoute } from "../middleware/auth.middleware.js";
import Product from "../models/product.model.js";

const router = express.Router();

/* ================= EXISTING ROUTES (UNCHANGED) ================= */

router.get("/", protectRoute, getAllProducts);
router.get("/featured", getFeaturedProducts);
router.get("/category/:category", getProductsByCategory);
router.get("/recommendations", getRecommendedProduct);

router.post("/", protectRoute, adminRoute, createProduct);
router.patch("/:id", protectRoute, adminRoute, toggleFeaturedProduct);
router.delete("/:id", protectRoute, adminRoute, deleteProduct);

/* ================= NEW ROUTE: UPDATE STOCK ================= */
/**
 * PATCH /api/products/:id/stock
 * Body: { stock: Number }
 * Access: admin + manager
 */
router.patch(
  "/:id/stock",
  protectRoute,
  async (req, res) => {
    try {
      // ✅ allow admin & inventory manager
      if (!["admin", "manager"].includes(req.user.role)) {
        return res.status(403).json({ message: "Not authorized" });
      }

      const { stock } = req.body;

      if (stock === undefined || stock < 0) {
        return res.status(400).json({ message: "Invalid stock value" });
      }

      const product = await Product.findByIdAndUpdate(
        req.params.id,
        { stock },
        { new: true }
      );

      if (!product) {
        return res.status(404).json({ message: "Product not found" });
      }

      res.status(200).json(product);
    } catch (error) {
      console.error("Update stock error:", error);
      res.status(500).json({ message: "Failed to update stock" });
    }
  }
);

export default router;
