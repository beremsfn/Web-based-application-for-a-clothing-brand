import express from "express";
import dotenv from "dotenv";
dotenv.config();
console.log("BASE_URL =", process.env.BASE_URL);
console.log("FRONTEND_URL =", process.env.FRONTEND_URL);
import cookiesParser from "cookie-parser";
import authRoutes from "./routes/auth.route.js";
import productRoutes from "./routes/product.route.js";
import cartRoutes from "./routes/cart.route.js";
import userRoutes from "./routes/admin.route.js";
import analyticsRoutes from "./routes/analytics.route.js"
import paymentRoutes from "./routes/payment.route.js";
import favoriteRoutes from "./routes/favoriteRoutes.js";
import orderRoutes from "./routes/order.route.js";
import { connectDB } from "./lib/db.js";
import cors from "cors";


const app = express();

// CORS must come before other middleware
app.use(
  cors({
    origin: ["http://localhost:5173", "http://localhost:5174", "https://yusa-ecommerce.vercel.app"],
    credentials: true,
  })
);

// Body parsing middleware - must be before routes
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));

const PORT = process.env.PORT || 3000;

app.use(cookiesParser());

app.use("/api/auth", authRoutes);
app.use("/products", productRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/products", productRoutes);
app.use("/api/users", userRoutes);
app.use("/api/analytics",analyticsRoutes)
app.use("/api/favorites", favoriteRoutes);
app.use("/api/payment", paymentRoutes)
app.use("/api/orders", orderRoutes)
app.listen(PORT, () => {
  console.log("Server is running on http://localhost:" + PORT);

  connectDB();
});
