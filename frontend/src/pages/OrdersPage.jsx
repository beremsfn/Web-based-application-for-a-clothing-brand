import { useState, useEffect } from "react";
import { api } from "../lib/apiClient";
import { toast } from "react-hot-toast";
import LoadingSpinner from "../components/LoadingSpinner";

const OrdersPage = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const res = await api.get("/orders");
      setOrders(res);
    } catch (error) {
      toast.error("Failed to load orders");
    } finally {
      setLoading(false);
    }
  };

  const cancelOrder = async (orderId) => {
    try {
      await api.post("/orders/cancel", { data: { orderId } });
      setOrders(orders.map(order =>
        order._id === orderId ? { ...order, orderStatus: "canceled" } : order
      ));
      toast.success("Order canceled successfully");
    } catch (error) {
      toast.error(error.message || "Failed to cancel order");
    }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="min-h-screen bg-gray-900 text-white pt-20">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">My Orders</h1>

        {orders.length === 0 ? (
          <p className="text-gray-400">No orders found.</p>
        ) : (
          <div className="space-y-6">
            {orders.map((order) => (
              <div key={order._id} className="bg-gray-800 rounded-lg p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <p className="text-sm text-gray-400">
                      Order ID: {order._id}
                    </p>
                    <p className="text-sm text-gray-400">
                      Date: {new Date(order.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-semibold">
                      Total: ${order.totalAmount}
                    </p>
                    <p className={`text-sm ${
                      order.orderStatus === "delivered" ? "text-green-400" :
                      order.orderStatus === "canceled" ? "text-red-400" :
                      "text-yellow-400"
                    }`}>
                      Status: {order.orderStatus}
                    </p>
                  </div>
                </div>

                <div className="space-y-2 mb-4">
                  {order.products.map((item, index) => (
                    <div key={index} className="flex items-center gap-4">
                      <img
                        src={item.product.image}
                        alt={item.product.name}
                        className="w-16 h-16 object-cover rounded"
                      />
                      <div className="flex-1">
                        <p className="font-medium">{item.product.name}</p>
                        <p className="text-sm text-gray-400">
                          Quantity: {item.quantity} | Price: ${item.price}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                {order.orderStatus === "pending" && (
                  <button
                    onClick={() => cancelOrder(order._id)}
                    className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded"
                  >
                    Cancel Order
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default OrdersPage;