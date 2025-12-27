import redis from "../lib/redis.js";
import cloudinary from "../lib/cloudinary.js";
import Product from "../models/product.model.js";

/* ===========================
   CREATE PRODUCT (Admin)
=========================== */
export const createProduct = async (req, res) => {
  try {
    const { name, description, price, image, category, color, size, stock } =
      req.body;

    let cloudinaryResponse = null;

    if (image) {
      cloudinaryResponse = await cloudinary.uploader.upload(image, {
        folder: "products",
      });
    }

    const product = await Product.create({
      name,
      description,
      price,
      category,
      color,
      size,
      stock,
      image: cloudinaryResponse ? cloudinaryResponse.secure_url : "",
    });

    res.status(201).json(product);
  } catch (error) {
    console.error("Error creating product:", error.message);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

/* ===========================
   GET ALL PRODUCTS + SEARCH
=========================== */
export const getAllProducts = async (req, res) => {
  try {
    const { search } = req.query;

    let matchStage = {};

    if (search?.trim()) {
      matchStage = {
        $or: [
          { name: { $regex: search, $options: "i" } },
          { category: { $regex: search, $options: "i" } },
          { color: { $regex: search, $options: "i" } },
        ],
      };
    }

    const products = await Product.aggregate([
      { $match: matchStage },

      {
        $lookup: {
          from: "productvariants", // 🔴 collection name (plural, lowercase)
          localField: "_id",
          foreignField: "productId",
          as: "variants",
        },
      },

      {
        $addFields: {
          totalStock: { $sum: "$variants.stock" },
        },
      },

      { $sort: { createdAt: -1 } },
    ]);

    res.status(200).json({ products });
  } catch (error) {
    console.error("Error fetching products:", error.message);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};


/* ===========================
   GET FEATURED PRODUCTS
=========================== */
export const getFeaturedProducts = async (req, res) => {
  try {
    let cached = await redis.get("featured_products");

    if (cached) {
      const parsed = JSON.parse(
        Buffer.isBuffer(cached) ? cached.toString("utf-8") : cached
      );
      return res.json({ featuredProducts: parsed });
    }

    const featuredProducts = await Product.find({
      isFeatured: true,
    }).lean();

    if (!featuredProducts.length) {
      return res.status(404).json({ message: "No featured products found" });
    }

    await redis.set("featured_products", JSON.stringify(featuredProducts));

    res.json({ featuredProducts });
  } catch (error) {
    console.error("Error fetching featured products:", error.message);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

/* ===========================
   TOGGLE FEATURED PRODUCT
=========================== */
export const toggleFeaturedProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    product.isFeatured = !product.isFeatured;
    const updatedProduct = await product.save();

    await updateFeaturedProductsCache();

    res.json(updatedProduct);
  } catch (error) {
    console.error("Error toggling featured:", error.message);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

/* ===========================
   GET PRODUCTS BY CATEGORY
=========================== */
export const getProductsByCategory = async (req, res) => {
  try {
    const { category } = req.params;
    const products = await Product.find({ category });
    res.json({ products });
  } catch (error) {
    console.error("Error fetching category products:", error.message);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

/* ===========================
   GET RECOMMENDED PRODUCTS
=========================== */
export const getRecommendedProduct = async (req, res) => {
  try {
    const products = await Product.aggregate([
      { $sample: { size: 4 } },
      {
        $project: {
          _id: 1,
          name: 1,
          description: 1,
          price: 1,
          image: 1,
        },
      },
    ]);

    res.json(products);
  } catch (error) {
    console.error("Error fetching recommendations:", error.message);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

/* ===========================
   DELETE PRODUCT (Admin)
=========================== */
export const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    if (product.image) {
      const publicId = product.image.split("/").pop().split(".")[0];
      await cloudinary.uploader.destroy(`products/${publicId}`);
    }

    await Product.findByIdAndDelete(req.params.id);

    res.json({ message: "Product deleted successfully" });
  } catch (error) {
    console.error("Error deleting product:", error.message);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

/* ===========================
   UPDATE FEATURED CACHE
=========================== */
async function updateFeaturedProductsCache() {
  try {
    const featuredProducts = await Product.find({
      isFeatured: true,
    }).lean();

    await redis.set("featured_products", JSON.stringify(featuredProducts));
  } catch (error) {
    console.error("Redis cache update failed:", error.message);
  }
}
