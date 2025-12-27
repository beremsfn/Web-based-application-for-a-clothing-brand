import express from "express";
import { toggleFavorite, getFavorites } from "../controllers/favoriteController.js";
import { protectRoute } from "../middleware/auth.middleware.js";

const router = express.Router();

// Protect all routes
router.use(protectRoute);

router.post("/", toggleFavorite);
router.get("/", getFavorites);

export default router;
