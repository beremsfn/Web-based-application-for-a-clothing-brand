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

const routher = express.Router();

routher.get("/", protectRoute, getAllProducts);
routher.get("/featured", getFeaturedProducts);
routher.get("/category/:category", getProductsByCategory);
routher.get("/recommendations", getRecommendedProduct);
routher.post("/", protectRoute, adminRoute, createProduct);
routher.patch("/:id", protectRoute, adminRoute, toggleFeaturedProduct);
routher.delete("/:id", protectRoute, adminRoute, deleteProduct);

export default routher;
