import Favorite from "../models/Favorite.js";

/**
 * TOGGLE FAVORITE
 */
export const toggleFavorite = async (req, res) => {
  const userId = req.user.id;
  const { productId } = req.body;

  try {
    const existing = await Favorite.findOne({
      user: userId,
      product: productId,
    });

    if (existing) {
      await Favorite.deleteOne({ _id: existing._id });
      return res.json({ favorited: false });
    }

    await Favorite.create({
      user: userId,
      product: productId,
    });

    res.json({ favorited: true });
  } catch (error) {
    console.log("Error in toggleFavorite controller", error.message);
    res.status(500).json({ message: "Favorite error" });
  }
};

/**
 * GET FAVORITES
 */
export const getFavorites = async (req, res) => {
  try {
    const favorites = await Favorite.find({ user: req.user.id }).populate(
      "product"
    );
    res.json(favorites);
  } catch (error) {
    console.log("Error in getFavorites controller", error.message);
    res.status(500).json({ message: "Failed to load favorites" });
  }
};

/**
 * ADD FAVORITE FLAG TO PRODUCTS
 * (same logic as provided, structure adapted)
 */
export const addFavoriteFlagToProducts = async (products, req) => {
  const favorites = await Favorite.find({ user: req.user?.id });
  const favIds = favorites.map((f) => f.product.toString());

  return products.map((p) => ({
    ...p.toObject(),
    isFavorited: favIds.includes(p._id.toString()),
  }));
};
