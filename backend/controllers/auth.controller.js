import User from "../models/user.model.js";
import jwt from "jsonwebtoken";
import redis from "../lib/redis.js";
import { sendEmail, generateRandomPin } from "../utils/index.js";
import crypto from "crypto";
import bcrypt from "bcryptjs";
import baseTemplate from "../utils/Templates/baseTemplate.js";

// ---------------- JWT HELPERS ----------------
const generateTokens = (userId) => {
  const accessToken = jwt.sign({ userId }, process.env.ACCESS_TOKEN_SECRET, {
    expiresIn: "15m",
  });
  const refreshToken = jwt.sign({ userId }, process.env.REFRESH_TOKEN_SECRET, {
    expiresIn: "7d",
  });
  return { accessToken, refreshToken };
};

const storeRefreshToken = async (userId, refreshToken) => {
  await redis.set(`refresh_token:${userId}`, refreshToken, {
    ex: 7 * 24 * 60 * 60,
  });
};

const setCookies = (res, accessToken, refreshToken) => {
  res.cookie("access_token", accessToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: 15 * 60 * 1000,
  });
  res.cookie("refreshToken", refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });
};

// ---------------- SIGNUP ----------------
export const signup = async (req, res) => {
  const { email, username, name, phone } = req.body;

  try {
    /* ============================
       VALIDATION
    ============================ */
    if (!email  || !name) {
      return res.status(400).json({ message: "Email, username, and name are required" });
    }

    /* ============================
       CHECK IF USER EXISTS
    ============================ */
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: "User already exists" });
    }

    /* ============================
       GENERATE RANDOM PASSWORD
    ============================ */
    const randomPassword = crypto.randomBytes(8).toString("hex");

    /* ============================
       CREATE USER
    ============================ */
    const newUser = await User.create({
      name,
      email,
      password: randomPassword, // Will be hashed by pre-save hook
      phone,
    });

    if (!newUser) {
      return res.status(400).json({ message: "Error while creating user account!" });
    }

    /* ============================
       SEND EMAIL WITH CREDENTIALS
    ============================ */
    try {
      const emailHtml = baseTemplate(`
        <h2 style="color:#1e3a8a">Account Created Successfully</h2>

        <p>Dear ${name},</p>

        <p>Your account has been <strong>created successfully</strong>.</p>

        <p><strong>Login Credentials</strong></p>
        <ul>
          <li>Email: <strong>${email}</strong></li>
          <li>Password: <strong>${randomPassword}</strong></li>
        </ul>

        <p>Please log in and change your password after first login.</p>

        <p>Regards,<br/>ACRS System</p>
      `);

      await sendEmail({
        to: email,
        subject: "Account Created - Login Credentials",
        html: emailHtml,
      });
    } catch (emailError) {
      console.error("Email sending failed:", emailError);
      // Continue even if email fails - user is still created
    }

    // Authenticate user
    const { accessToken, refreshToken } = generateTokens(newUser._id);
    await storeRefreshToken(newUser._id, refreshToken);
    setCookies(res, accessToken, refreshToken);

    return res.status(201).json({
      _id: newUser._id,
      name: newUser.name,
      email: newUser.email,
      phone: newUser.phone,
      role: newUser.role,
      message: "Account created successfully. Check your email for login credentials.",
    });
  } catch (error) {
    console.error("SIGNUP ERROR:", error);
    return res.status(500).json({ message: "Server error", error: error.message });
  }
};

// ---------------- LOGIN ----------------
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });

    if (user && (await user.comparePassword(password))) {
      const { accessToken, refreshToken } = generateTokens(user._id);
      await storeRefreshToken(user._id, refreshToken);
      setCookies(res, accessToken, refreshToken);

      res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      });
    } else {
      res.status(401).json({ message: "Invalid email or password" });
    }
  } catch (error) {
    console.log("Error in login controller", error.message);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// ---------------- LOGOUT ----------------
export const logout = async (req, res) => {
  try {
    const refreshToken = req.cookies.refreshToken;
    if (refreshToken) {
      const decode = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);
      await redis.del(`refresh_token:${decode.userId}`);
    }
    res.clearCookie("access_token");
    res.clearCookie("refreshToken");
    res.json({ message: "Logged out successfully" });
  } catch (error) {
    console.log("Error in logout controller", error.message);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// ---------------- REFRESH TOKEN ----------------
export const refreshToken = async (req, res) => {
  try {
    const refreshToken = req.cookies.refreshToken;
    if (!refreshToken) {
      return res.status(401).json({ message: "No refresh token provided" });
    }
    const decode = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);
    const storedToken = await redis.get(`refresh_token:${decode.userId}`);

    if (storedToken !== refreshToken) {
      return res.status(403).json({ message: "Invalid refresh token" });
    }

    const access_token = jwt.sign(
      { userId: decode.userId },
      process.env.ACCESS_TOKEN_SECRET,
      { expiresIn: "15m" }
    );
    res.cookie("access_token", access_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 15 * 60 * 1000,
    });
    res.json({ message: "Access token refreshed" });
  } catch (error) {
    console.log("Error in refresh token controller", error.message);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// ---------------- PROFILE ----------------
export const getProfile = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    res.status(200).json({
      _id: req.user._id,
      name: req.user.name,
      email: req.user.email,
      role: req.user.role,
    });
  } catch (error) {
    console.log("Error in profile controller", error.message);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

export const updateProfile = async (req, res) => {
  try {
    const userId = req.user?._id;

    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const { name, email } = req.body;

    if (!name || !email) {
      return res.status(400).json({ message: "Name and Email are required" });
    }

    const userExists = await User.findOne({ email });

    if (userExists && userExists._id.toString() !== userId.toString()) {
      return res.status(400).json({ message: "Email already in use" });
    }

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { name, email },
      { new: true }
    ).select("-password");

    res.status(200).json({
      message: "Profile updated successfully",
      user: {
        _id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        role: updatedUser.role,
      },
    });
  } catch (error) {
    console.log("Error in updateProfile controller", error.message);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// ---------------- CHANGE PASSWORD ----------------
export const changePassword = async (req, res) => {
  try {
    const userId = req.user?._id;

    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const user = await User.findById(userId);

    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) {
      return res.status(400).json({ message: "Incorrect current password" });
    }

    user.password = newPassword;
    await user.save();

    await redis.del(`refresh_token:${userId}`);

    const accessToken = jwt.sign(
      { userId },
      process.env.ACCESS_TOKEN_SECRET,
      { expiresIn: "15m" }
    );
    const refreshToken = jwt.sign(
      { userId },
      process.env.REFRESH_TOKEN_SECRET,
      { expiresIn: "7d" }
    );

    await redis.set(`refresh_token:${userId}`, refreshToken, {
      ex: 7 * 24 * 60 * 60,
    });

    setCookies(res, accessToken, refreshToken);

    res.status(200).json({ message: "Password updated successfully" });
  } catch (error) {
    console.log("Error in changePassword controller", error.message);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// ---------------- FORGOT PASSWORD ----------------
export const forgotPassword = async (req, res) => {
  try {
    // Check if req.body exists
    if (!req.body) {
      return res.status(400).json({ message: "Request body is missing" });
    }

    const { email } = req.body;

    if (!email || !email.trim()) {
      console.error("Email is missing or empty");
      return res.status(400).json({ message: "Email is required" });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      console.error("Invalid email format:", email);
      return res.status(400).json({ message: "Please enter a valid email address" });
    }

    /* ============================
       FIND USER
    ============================ */
    const user = await User.findOne({ email }).select("_id email name");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    /* ============================
       GENERATE TEMP PIN
    ============================ */
    const tempPin = generateRandomPin(8);
    const hashedPin = await bcrypt.hash(tempPin, 10);

    /* ============================
       UPDATE PASSWORD
    ============================ */
    const updateResult = await User.updateOne(
      { _id: user._id },
      { password: hashedPin }
    );

    if (!updateResult || updateResult.modifiedCount === 0) {
      return res.status(400).json({ error: "Error while updating password" });
    }

    /* ============================
       SEND EMAIL
    ============================ */
    try {
      await sendEmail({
        to: user.email,
        subject: "Temporary Password Reset",
        html: `
          <p>Dear ${user.name},</p>
          <p>Your password has been reset successfully.</p>
          <p><strong>Temporary Password:</strong> ${tempPin}</p>
          <p>Please log in and change your password immediately.</p>
          <p>If you did not request this reset, contact the system administrator.</p>
        `,
      });

      return res.status(200).json({
        message: "Temporary password sent to your email",
      });
    } catch (emailError) {
      console.error("Email sending failed:", emailError);
      return res.status(500).json({
        message: "Password updated but failed to send email. Please contact support.",
        error: emailError.message,
      });
    }
  } catch (error) {
    console.error("FORGOT PASSWORD ERROR:", error);
    return res.status(500).json({
      message: "Failed to reset password",
    });
  }
};

// ---------------- RESET PASSWORD ----------------
export const resetPassword = async (req, res) => {
  try {
    const { email, token, newPassword } = req.body;

    if (!email || !token || !newPassword) {
      return res.status(400).json({ message: "Email, token, and new password are required" });
    }

    const user = await User.findOne({ 
      email,
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({ message: "Invalid or expired reset token" });
    }

    // Update password
    user.password = newPassword;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    // Invalidate all refresh tokens
    await redis.del(`refresh_token:${user._id}`);

    res.status(200).json({ message: "Password reset successfully" });
  } catch (error) {
    console.log("Error in resetPassword controller", error.message);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

