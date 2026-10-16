import { useFavorites } from "../context/FavoritesContext";
import ProductCard from "../components/ProductCard";

const Favorites = () => {
  const { favorites } = useFavorites();

  return (
    <div className="px-6 py-10">
      <h2 className="text-2xl mb-6">Favorites</h2>

      {favorites.length === 0 ? (
        <p>No favorites added yet.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {favorites.map((product) => (
            <ProductCard key={product._id} product={product} />
          ))}
        </div>
      )}
    </div>
  );
};

export default Favorites;
