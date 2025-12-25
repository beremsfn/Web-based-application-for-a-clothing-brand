import express from 'express';
import { signup, login, logout, refreshToken, getProfile, updateProfile, changePassword } from '../controllers/auth.controller.js';
import { protectRoute } from '../middleware/auth.middleware.js';

const router = express.Router();

router.post("/signup",signup);
router.post("/login",login);
router.post("/logout",logout);
router.post("/refresh-token",refreshToken);
router.get("/profile", protectRoute, getProfile);
router.put("/updateprofile", protectRoute, updateProfile);
router.put("/password", protectRoute, changePassword);
router.get("/me", protectRoute, getProfile);
export default router;