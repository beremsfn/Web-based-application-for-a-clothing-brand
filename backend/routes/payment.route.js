import express from "express";
import {
  initiatePayment,
  verifyPayment,
  chapaCallback,
  checkoutSuccess,
  paymentRedirect,
} from "../controllers/payment.controller.js";
import { protectRoute, optionalAuth } from "../middleware/auth.middleware.js";

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
 * Route with tx_ref in path: /verify/:tx_ref
 */
router.get("/verify/:tx_ref", verifyPayment);

/**
 * 3b️⃣ Payment redirect handler (Chapa → browser → backend → frontend)
 * Handles Chapa's return_url redirect and ensures tx_ref is passed to frontend
 */
router.get("/redirect", paymentRedirect);

/**
 * 4️⃣ Checkout success - Verify order exists (Frontend → backend)
 * Uses optionalAuth so it works even if cookies are lost during redirect
 */
router.post("/checkout-success", optionalAuth, checkoutSuccess);

export default router;
