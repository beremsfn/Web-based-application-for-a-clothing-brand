import { motion } from "framer-motion";
import { Trash, Star } from "lucide-react";
import { useProductStore } from "../stores/useProductStore";

const ProductsList = () => {
  const { products, deleteProduct, toggleFeaturedProduct } = useProductStore();

  return (
    <motion.div
      className="bg-gray-800 shadow-lg rounded-lg overflow-hidden max-w-6xl mx-auto"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8 }}
    >
      <table className="min-w-full divide-y divide-gray-700">
        <thead className="bg-gray-700">
          <tr>
            <TableHeader title="Product" />
            <TableHeader title="Price" />
            <TableHeader title="Category" />
            <TableHeader title="Stock" />
            <TableHeader title="Featured" />
            <TableHeader title="Actions" />
          </tr>
        </thead>

        <tbody className="bg-gray-800 divide-y divide-gray-700">
          {products?.map((product) => (
            <tr key={product._id} className="hover:bg-gray-700 transition-colors duration-200">
              {/* Product Info */}
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="flex items-center">
                  <img
                    className="h-10 w-10 rounded-full object-cover flex-shrink-0"
                    src={product.image}
                    alt={product.name}
                  />
                  <div className="ml-4">
                    <div className="text-sm font-medium text-white">{product.name}</div>
                  </div>
                </div>
              </td>

              {/* Price */}
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm text-gray-300">${product.price?.toFixed(2)}</div>
              </td>

              {/* Category */}
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm text-gray-300">{product.category}</div>
              </td>

              {/* Stock (total stock from variants if available) */}
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm text-gray-300">
                  {product.totalStock ?? product.stock ?? 0}
                </div>
              </td>

              {/* Featured toggle */}
              <td className="px-6 py-4 whitespace-nowrap">
                <button
                  onClick={() => toggleFeaturedProduct(product._id)}
                  className={`p-1 rounded-full transition-colors duration-200 ${
                    product.isFeatured
                      ? "bg-yellow-400 text-gray-900 hover:bg-yellow-500"
                      : "bg-gray-600 text-gray-300 hover:bg-gray-500"
                  }`}
                >
                  <Star className="h-5 w-5" />
                </button>
              </td>

              {/* Actions */}
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                <button
                  onClick={() => deleteProduct(product._id)}
                  className="text-red-400 hover:text-red-300"
                >
                  <Trash className="h-5 w-5" />
                </button>
              </td>
            </tr>
          ))}

          {!products?.length && (
            <tr>
              <td colSpan={6} className="px-6 py-4 text-center text-gray-400">
                No products found.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </motion.div>
  );
};

// Reusable Table Header component
const TableHeader = ({ title }) => (
  <th
    scope="col"
    className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider"
  >
    {title}
  </th>
);

export default ProductsList;
