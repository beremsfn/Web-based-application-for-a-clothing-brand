import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { api } from "../lib/apiClient";

const OrdersTab = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAllOrders();
  }, []);

  const fetchAllOrders = async () => {
    try {
      const res = await api.get("/orders/all");
      setOrders(res);
    } catch (error) {
      console.error("Failed to fetch orders", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <p className="text-center text-white text-lg">
        Loading orders...
      </p>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-gray-800 rounded-lg p-6"
    >
      <h2 className="text-2xl font-bold text-white mb-6">
        Orders Management
      </h2>

      {orders.length === 0 ? (
        <p className="text-gray-400">No orders found.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-white">
            <thead>
              <tr className="border-b border-gray-700">
                <th className="text-left py-3">Order ID</th>
                <th className="text-left py-3">Customer</th>
                <th className="text-left py-3">Date</th>
                <th className="text-left py-3">Total</th>
                <th className="text-left py-3">Status</th>
                <th className="text-left py-3">Products</th>
              </tr>
            </thead>

            <tbody>
              {orders.map((order) => (
                <tr
                  key={order._id}
                  className="border-b border-gray-700 hover:bg-gray-700/50"
                >
                  <td className="py-3">{order._id.slice(-8)}</td>
                  <td className="py-3">{order.user?.name || "N/A"}</td>
                  <td className="py-3">{new Date(order.createdAt).toLocaleDateString()}</td>
                  <td className="py-3">${order.totalAmount}</td>
                  <td className="py-3 capitalize">
                    <span className={`px-2 py-1 rounded text-xs ${
                      order.orderStatus === "delivered" ? "bg-green-600" :
                      order.orderStatus === "canceled" ? "bg-red-600" :
                      "bg-yellow-600"
                    }`}>
                      {order.orderStatus}
                    </span>
                  </td>
                  <td className="py-3">{order.products.length} items</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </motion.div>
  );
};

export default OrdersTab;