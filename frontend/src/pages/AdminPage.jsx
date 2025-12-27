import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  BarChart,
  PlusCircle,
  ShoppingBasket,
  Users,
} from "lucide-react";

import AnalyticsTab from "../components/AnalyticsTab";
import CreateProductForm from "../components/CreateProductForm";
import ProductsList from "../components/ProductsList";
import UsersList from "../components/UsersList";

import { useProductStore } from "../stores/useProductStore";
import { useUserStore } from "../stores/useUserStore";

/**
 * Role-based tab configuration
 */
const TABS = [
  {
    id: "create",
    label: "Create Product",
    icon: PlusCircle,
    roles: ["manager"], // ONLY manager
  },
  {
    id: "products",
    label: "Products",
    icon: ShoppingBasket,
    roles: ["admin", "manager"],
  },
  {
    id: "users",
    label: "Users",
    icon: Users,
    roles: ["admin"],
  },
  {
    id: "analytics",
    label: "Analytics",
    icon: BarChart,
    roles: ["admin"],
  },
];

const AdminPage = () => {
  const { fetchAllProducts } = useProductStore();
  const { user, loading } = useUserStore();

  const [activeTab, setActiveTab] = useState(null);

  /**
   * Normalize role once
   */
  const role = useMemo(
    () => user?.role?.toLowerCase().trim(),
    [user]
  );

  /**
   * Fetch shared data
   */
  useEffect(() => {
    fetchAllProducts();
  }, [fetchAllProducts]);

  /**
   * Filter tabs safely
   */
  const visibleTabs = useMemo(() => {
    if (!role) return [];
    return TABS.filter(tab => tab.roles.includes(role));
  }, [role]);

  /**
   * Set default tab when role loads
   */
  useEffect(() => {
    if (!activeTab && visibleTabs.length > 0) {
      setActiveTab(visibleTabs[0].id);
    }
  }, [visibleTabs, activeTab]);

  /**
   * Loading / safety states
   */
  if (loading || !user) {
    return (
      <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
        Loading dashboard...
      </div>
    );
  }

  if (!["admin", "manager"].includes(role)) {
    return (
      <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
        Access denied
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <div className="container mx-auto px-4 py-16">

        {/* Title */}
        <motion.h1
          className="text-4xl font-bold mb-10 text-center"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          Dashboard
        </motion.h1>

        {/* Tabs */}
        <div className="flex justify-center flex-wrap gap-3 mb-10">
          {visibleTabs.map(tab => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;

            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-5 py-2 rounded-md text-sm font-medium transition-colors
                  ${
                    isActive
                      ? "bg-red-600 text-white"
                      : "bg-gray-700 text-gray-300 hover:bg-gray-600"
                  }`}
              >
                <Icon size={18} />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Content */}
        <div className="max-w-6xl mx-auto">
          {activeTab === "create" && role === "manager" && (
            <CreateProductForm />
          )}

          {activeTab === "products" && (
            <ProductsList />
          )}

          {activeTab === "users" && role === "admin" && (
            <UsersList />
          )}

          {activeTab === "analytics" && role === "admin" && (
            <AnalyticsTab />
          )}
        </div>

      </div>
    </div>
  );
};

export default AdminPage;
