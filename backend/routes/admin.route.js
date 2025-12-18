import express from "express";
import {
  getAllUsers,
  getUserById,
  deleteUser,
  updateUserRole,
} from "../controllers/admin.controller.js";

// import { adminRoute } from "../middleware/auth.middleware.js";

const router = express.Router();
router.get("/", getAllUsers);
router.get("/:id", getUserById);
router.delete("/:id", deleteUser);
router.put("/:id/role", updateUserRole);

export default router;
