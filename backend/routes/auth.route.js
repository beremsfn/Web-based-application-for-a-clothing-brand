import express from 'express';
import {
  signup,
  login,
  logout,
  refreshToken,
  getProfile,
  updateProfile,
  changePassword,
  sendOtp,
  verifyOtp
} from '../controllers/auth.controller.js';

import { protectRoute } from '../middleware/auth.middleware.js';

const router = express.Router();

/* ----------------- OTP ROUTES ----------------- */
router.post("/send-otp", sendOtp);
router.post("/verify-otp", verifyOtp);

/* ----------------- AUTH ROUTES ----------------- */
router.post("/signup", signup);        // Signup now requires OTP verified
router.post("/login", login);
router.post("/logout", logout);
router.post("/refresh-token", refreshToken);

router.get("/profile", protectRoute, getProfile);
router.get("/me", protectRoute, getProfile);
router.put("/updateprofile", protectRoute, updateProfile);
router.put("/password", protectRoute, changePassword);

export default router;
