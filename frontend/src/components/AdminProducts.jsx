import { useEffect } from "react";
import { useProductStore } from "../stores/useProductStore";

const AdminProducts = () => {
  const { products, fetchProducts } = useProductStore();

  useEffect(() => {
    fetchProducts();
  }, []);

  return (
    <div className="overflow-x-auto rounded-lg shadow-lg border border-gray-700 bg-gray-800">
      <table className="min-w-full divide-y divide-gray-700 text-sm text-gray-300">
        <thead className="bg-gray-900 text-gray-400 uppercase text-xs">
          <tr>
            <th className="px-6 py-4 text-left">Name</th>
            <th className="px-6 py-4 text-left">Color</th>
            <th className="px-6 py-4 text-left">Size</th>
            <th className="px-6 py-4 text-left">Stock</th>
          </tr>
        </thead>

        <tbody className="divide-y divide-gray-700">
          {products.map((p) => (
            <tr
              key={p._id}
              className="hover:bg-gray-700 transition duration-200"
            >
              <td className="px-6 py-4 font-medium text-white">
                {p.name}
              </td>
              <td className="px-6 py-4">{p.color}</td>
              <td className="px-6 py-4">{p.size}</td>
              <td className="px-6 py-4">
                <span
                  className={`font-semibold ${
                    p.stock > 0 ? "text-green-400" : "text-red-400"
                  }`}
                >
                  {p.stock}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {products.length === 0 && (
        <div className="text-center text-gray-400 py-6">
          No products found
        </div>
      )}
    </div>
  );
};

export default AdminProducts;
