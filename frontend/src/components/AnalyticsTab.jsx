import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import axios from "../lib/axios";
import { Users, Package, ShoppingCart, DollarSign } from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

const AnalyticsTab = () => {
  const [analyticsData, setAnalyticsData] = useState({
    users: 0,
    products: 0,
    totalSales: 0,
    totalRevenue: 0,
  });

  const [dailySalesData, setDailySalesData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchAnalyticsData = async () => {
      try {
        // ✅ Correct endpoint (matches app.use("/analytics"))
        const response = await axios.get("/analytics");

        setAnalyticsData(response.data.analyticsData);
        setDailySalesData(response.data.dailySalesData || []);
      } catch (error) {
        console.error("Error fetching analytics data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAnalyticsData();
  }, []);

  if (isLoading) {
    return <div className="text-center text-gray-300">Loading analytics...</div>;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* STAT CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <AnalyticsCard
          title="Total Users"
          value={analyticsData.users.toLocaleString()}
          icon={Users}
        />
        <AnalyticsCard
          title="Total Products"
          value={analyticsData.products.toLocaleString()}
          icon={Package}
        />
        <AnalyticsCard
          title="Total Sales"
          value={analyticsData.totalSales.toLocaleString()}
          icon={ShoppingCart}
        />
        <AnalyticsCard
          title="Total Revenue"
          value={`$${analyticsData.totalRevenue.toLocaleString()}`}
          icon={DollarSign}
        />
      </div>

      {/* SALES CHART */}
      <motion.div
        className="bg-gray-800/60 rounded-lg p-6 shadow-lg"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        {dailySalesData.length === 0 ? (
          <p className="text-center text-gray-400">
            No sales data available
          </p>
        ) : (
          <ResponsiveContainer width="100%" height={400}>
            <LineChart data={dailySalesData}>
              <CartesianGrid strokeDasharray="3 3" />
              
              {/* ✅ FIXED: correct X-axis key */}
              <XAxis dataKey="date" stroke="#D1D5DB" />

              <YAxis yAxisId="left" stroke="#D1D5DB" />
              <YAxis yAxisId="right" orientation="right" stroke="#D1D5DB" />

              <Tooltip />
              <Legend />

              <Line
                yAxisId="left"
                type="monotone"
                dataKey="sales"
                stroke="#10B981"
                activeDot={{ r: 6 }}
                name="Sales"
              />

              <Line
                yAxisId="right"
                type="monotone"
                dataKey="revenue"
                stroke="#3B82F6"
                activeDot={{ r: 6 }}
                name="Revenue"
              />
            </LineChart>
          </ResponsiveContainer>
        )}
      </motion.div>
    </div>
  );
};

export default AnalyticsTab;

const AnalyticsCard = ({ title, value, icon: Icon }) => (
  <motion.div
    className="bg-gray-800 rounded-lg p-6 shadow-lg relative overflow-hidden"
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.4 }}
  >
    <div className="relative z-10">
      <p className="text-gray-300 text-sm mb-1 font-semibold">{title}</p>
      <h3 className="text-white text-3xl font-bold">{value}</h3>
    </div>

    <div className="absolute inset-0 bg-gradient-to-br from-red-600 to-red-900 opacity-30" />
    <div className="absolute -bottom-4 -right-4 text-red-800 opacity-40">
      <Icon className="h-28 w-28" />
    </div>
  </motion.div>
);
