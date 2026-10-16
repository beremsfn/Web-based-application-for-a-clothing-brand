import express from "express";
import { protectRoute } from "../middleware/auth.middleware.js";
import { getUserOrders, cancelOrder, getAllOrders } from "../controllers/order.controller.js";

const router = express.Router();

router.use(protectRoute);

router.get("/", getUserOrders);
router.get("/all", getAllOrders);
router.post("/cancel", cancelOrder);

export default router;