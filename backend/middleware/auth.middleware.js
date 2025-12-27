import jwt from "jsonwebtoken";
import User from "../models/user.model.js";

export const protectRoute = async (req, res, next) => {
  try {
    const access_token = req.cookies.access_token;

    if (!access_token) {
      return res.status(401).json({ message: "Unauthorized, no access token" });
    }

    try {
      const decoded = jwt.verify(
        access_token,
        process.env.ACCESS_TOKEN_SECRET
      );

      const user = await User.findById(decoded.userId).select("-password");

      if (!user) {
        return res.status(401).json({ message: "User not found" });
      }

      req.user = user;
      next();
    } catch (error) {
      if (error.name === "TokenExpiredError") {
        return res
          .status(401)
          .json({ message: "Unauthorized, token expired" });
      }
      throw error;
    }
  } catch (error) {
    console.log("Error in protect route middleware:", error.message);
    return res.status(401).json({ message: "Unauthorized, invalid token" });
  }
};

/**
 * ✅ Allows BOTH admin and inventory manager
 * (kept name to avoid breaking existing imports)
 */
export const adminRoute = (req, res, next) => {
  if (
    req.user &&
    (req.user.role === "admin" || req.user.role === "manager")
  ) {
    return next();
  }

  return res.status(403).json({
    message: "Forbidden, admin or manager access required",
  });
};
