import express from "express";
import dotenv from "dotenv";
import cookiesParser from "cookie-parser";
import authRoutes from "./routes/auth.route.js";
import productRoutes from "./routes/product.route.js";
import cartRoutes from "./routes/cart.route.js";
import userRoutes from "./routes/admin.route.js";
import { connectDB } from "./lib/db.js";
import cors from "cors";

dotenv.config();
import bodyParser from "body-parser";

const app = express();

app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));

app.use(bodyParser.json({ limit: "50mb" }));
app.use(bodyParser.urlencoded({ limit: "50mb", extended: true }));

const PORT = process.env.PORT || 3000;

app.use(cookiesParser());
app.use(
  cors({
    origin: ["http://localhost:5173", "https://yusa-ecommerce.vercel.app"],
    credentials: true,
  })
);

app.use("/api/auth", authRoutes);
app.use("/products", productRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/products", productRoutes);
app.use("/api/users", userRoutes);

app.listen(PORT, () => {
  console.log("Server is running on http://localhost:" + PORT);

  connectDB();
});
// lKkLMHc294cPggga
