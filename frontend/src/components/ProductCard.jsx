import toast from "react-hot-toast";
import { ShoppingCart } from "lucide-react";
import { useUserStore } from "../stores/useUserStore";
import { useCartStore } from "../stores/useCartStore";

const ProductCard = ({ product }) => {
  const { user } = useUserStore();
  const { addToCart } = useCartStore();

  const handleAddToCart = () => {
    if (!user) {
      toast.error("Please login to add products to cart", { id: "login" });
      return;
    }
    addToCart(product);
  };

  return (
    <div className="flex w-full relative flex-col overflow-hidden rounded-lg border border-gray-700 shadow-lg">
      
      {/* Image */}
      <div className="relative mx-3 mt-3 flex h-60 overflow-hidden rounded-xl">
        <img
          className="object-cover w-full"
          src={product.image}
          alt={product.name}
        />
        <div className="absolute inset-0 bg-black bg-opacity-20" />
      </div>

      {/* Content */}
      <div className="mt-4 px-5 pb-5">
        <h5 className="text-xl font-semibold tracking-tight text-white">
          {product.name}
        </h5>

        {/* Extra details (added, minimal impact) */}
        <div className="mt-1 text-sm text-gray-400 space-y-1">
          {product.color && <p>Color: {product.color}</p>}
          {product.size && <p>Size: {product.size}</p>}
          {product.stock !== undefined && (
            <p>
              In Stock:{" "}
              <span
                className={
                  product.stock > 0 ? "text-green-400" : "text-red-400"
                }
              >
                {product.stock}
              </span>
            </p>
          )}
        </div>

        {/* Price */}
        <div className="mt-2 mb-5 flex items-center justify-between">
          <p>
            <span className="text-3xl font-bold text-red-400">
              ${product.price}
            </span>
          </p>
        </div>

        {/* Button */}
        <button
          className="flex items-center justify-center rounded-lg bg-red-600 px-5 py-2.5 text-center text-sm font-medium
                     text-white hover:bg-red-700 focus:outline-none focus:ring-4 focus:ring-red-300"
          onClick={handleAddToCart}
          disabled={product.stock === 0}
        >
          <ShoppingCart size={22} className="mr-2" />
          {product.stock === 0 ? "Out of Stock" : "Add to cart"}
        </button>
      </div>
    </div>
  );
};

export default ProductCard;
