import express from "express"
import {
	initiatePayment,
	verifyPayment,
} from "../controllers/payment.controller.js"
import { protectRoute } from "../middleware/auth.middleware.js"

const router = express.Router()

router.post("/pay", protectRoute, initiatePayment)
router.get("/verify/:tx_ref", verifyPayment)

export default router
