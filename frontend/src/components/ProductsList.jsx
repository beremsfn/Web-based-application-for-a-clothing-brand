import { motion } from "framer-motion";
import { Trash, Star, Edit, Save, X } from "lucide-react";
import { useState } from "react";
import toast from "react-hot-toast";

import { useProductStore } from "../stores/useProductStore";
import { useUserStore } from "../stores/useUserStore";
import { api } from "../lib/apiClient";

const ProductsList = () => {
  const { products, deleteProduct, toggleFeaturedProduct, fetchAllProducts } =
    useProductStore();
  const { user } = useUserStore();

  const canEditStock =
    user?.role === "admin" || user?.role === "manager";

  const [editingId, setEditingId] = useState(null);
  const [stockValue, setStockValue] = useState(0);
  const [saving, setSaving] = useState(false);

  const startEdit = (product) => {
    setEditingId(product._id);
    setStockValue(product.totalStock ?? product.stock ?? 0);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setStockValue(0);
  };

  const saveStock = async (productId) => {
    try {
      setSaving(true);
      await api.patch(`/products/${productId}/stock`, {
        stock: stockValue,
      });

      toast.success("Stock updated");
      fetchAllProducts();
      cancelEdit();
    } catch (error) {
      toast.error("Failed to update stock");
    } finally {
      setSaving(false);
    }
  };

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
          {products?.map((product) => {
            const isEditing = editingId === product._id;

            return (
              <tr
                key={product._id}
                className="hover:bg-gray-700 transition-colors duration-200"
              >
                {/* Product Info */}
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <img
                      className="h-10 w-10 rounded-full object-cover flex-shrink-0"
                      src={product.image}
                      alt={product.name}
                    />
                    <div className="ml-4">
                      <div className="text-sm font-medium text-white">
                        {product.name}
                      </div>
                    </div>
                  </div>
                </td>

                {/* Price */}
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-300">
                    ${product.price?.toFixed(2)}
                  </div>
                </td>

                {/* Category */}
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-300">
                    {product.category}
                  </div>
                </td>

                {/* Stock */}
                <td className="px-6 py-4 whitespace-nowrap">
                  {isEditing ? (
                    <input
                      type="number"
                      min="0"
                      value={stockValue}
                      onChange={(e) =>
                        setStockValue(Number(e.target.value))
                      }
                      className="w-20 px-2 py-1 rounded bg-gray-900 border border-gray-600 text-white"
                    />
                  ) : (
                    <span
                      className={`text-sm ${
                        (product.totalStock ?? product.stock ?? 0) > 0
                          ? "text-green-400"
                          : "text-red-400"
                      }`}
                    >
                      {product.totalStock ?? product.stock ?? 0}
                    </span>
                  )}
                </td>

                {/* Featured */}
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
                  <div className="flex items-center gap-3">
                    {canEditStock && (
                      isEditing ? (
                        <>
                          <button
                            onClick={() => saveStock(product._id)}
                            disabled={saving}
                            className="text-green-400 hover:text-green-300"
                          >
                            <Save className="h-5 w-5" />
                          </button>
                          <button
                            onClick={cancelEdit}
                            className="text-gray-400 hover:text-gray-300"
                          >
                            <X className="h-5 w-5" />
                          </button>
                        </>
                      ) : (
                        <button
                          onClick={() => startEdit(product)}
                          className="text-blue-400 hover:text-blue-300"
                        >
                          <Edit className="h-5 w-5" />
                        </button>
                      )
                    )}

                    <button
                      onClick={() => deleteProduct(product._id)}
                      className="text-red-400 hover:text-red-300"
                    >
                      <Trash className="h-5 w-5" />
                    </button>
                  </div>
                </td>
              </tr>
            );
          })}

          {!products?.length && (
            <tr>
              <td
                colSpan={6}
                className="px-6 py-4 text-center text-gray-400"
              >
                No products found.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </motion.div>
  );
};

const TableHeader = ({ title }) => (
  <th
    scope="col"
    className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider"
  >
    {title}
  </th>
);

export default ProductsList;
