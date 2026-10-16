import express from 'express';
import {
  signup,
  login,
  logout,
  refreshToken,
  getProfile,
  updateProfile,
  changePassword,
  forgotPassword,
  resetPassword
} from '../controllers/auth.controller.js';

import { protectRoute } from '../middleware/auth.middleware.js';

const router = express.Router();

/* ----------------- AUTH ROUTES ----------------- */
router.post("/signup", signup);
router.post("/login", login);
router.post("/logout", logout);
router.post("/refresh-token", refreshToken);

/* ----------------- PASSWORD RESET ROUTES ----------------- */
router.post("/forgot-password", forgotPassword);
router.post("/reset-password", resetPassword);

router.get("/profile", protectRoute, getProfile);
router.get("/me", protectRoute, getProfile);
router.put("/updateprofile", protectRoute, updateProfile);
router.put("/password", protectRoute, changePassword);

export default router;
