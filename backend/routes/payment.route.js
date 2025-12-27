import express from "express";
import {
  initiatePayment,
  verifyPayment,
  chapaCallback,
} from "../controllers/payment.controller.js";
import { protectRoute } from "../middleware/auth.middleware.js";

const router = express.Router();

/**
 * 1️⃣ Start payment (frontend → backend → Chapa)
 */
router.post("/pay", protectRoute, initiatePayment);

/**
 * 2️⃣ Chapa callback (Chapa → backend)
 * MUST be POST
 * tx_ref comes in req.body
 */
router.post("/verify", chapaCallback);

/**
 * 3️⃣ Browser redirect verification (Chapa → browser → backend)
 */
router.get("/verify/:tx_ref", verifyPayment);

export default router;
