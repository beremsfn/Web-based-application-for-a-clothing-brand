import {
  ShoppingCart,
  UserPlus,
  LogIn,
  LogOut,
  Lock,
  User,
  Settings,
} from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { useUserStore } from "../stores/useUserStore";
import { useCartStore } from "../stores/useCartStore";
import { useProductStore } from "../stores/useProductStore";
import { useState, useRef, useEffect } from "react";

const Navbar = () => {
  const { user, logout } = useUserStore();
  const isAdminOrManager =
    user?.role === "admin" || user?.role === "manager";
  const { cart } = useCartStore();

  // 🔍 Search logic
  const location = useLocation();
  const { fetchProducts } = useProductStore();
  const isAdminPage = location.pathname.startsWith("/admin");

  const handleSearch = (e) => {
    fetchProducts(e.target.value);
  };

  // 👤 User dropdown logic
  const [openUserMenu, setOpenUserMenu] = useState(false);
  const userMenuRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target)) {
        setOpenUserMenu(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () =>
      document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <header className="fixed top-0 left-0 w-full bg-gray-900 bg-opacity-90 backdrop-blur-md shadow-lg z-40 transition-all duration-300 border-b border-red-800">
      <div className="container mx-auto px-4 py-3">
        <div className="flex flex-wrap justify-between items-center">

          {/* Logo */}
          <Link
            to="/"
            className="text-2xl font-bold primary items-center space-x-2 flex"
          >
            <img src="logo.png" className="w-[150px]" alt="Cottex" />
          </Link>

          {/* 🔍 Search */}
          {user && (
            <input
              type="text"
              placeholder="Search by name or color..."
              onChange={handleSearch}
              className="border p-2 rounded w-64 bg-gray-800 text-gray-200
                         border-gray-700 focus:outline-none focus:border-primary
                         transition duration-300 mx-4"
            />
          )}

          {/* Nav Items */}
          <nav className="flex flex-wrap items-center gap-4">
            <Link
              to={"/"}
              className="text-gray-300 hover:primary transition duration-300 ease-in-out"
            >
              Home
            </Link>

            {user && (
              <Link
                to={"/cart"}
                className="relative group text-gray-300 hover:primary transition duration-300 ease-in-out"
              >
                <ShoppingCart
                  className="inline-block mr-1 group-hover:primary"
                  size={20}
                />
                <span className="hidden sm:inline">Cart</span>
                {cart.length > 0 && (
                  <span
                    className="absolute -top-2 -left-2 bg-primary text-white rounded-full px-2 py-0.5 
                               text-xs transition duration-300 ease-in-out"
                  >
                    {cart.length}
                  </span>
                )}
              </Link>
            )}

            {isAdminOrManager && (
              <Link
                className="bg-primary hover:bg-primary text-white px-3 py-1 rounded-md font-medium
                           transition duration-300 ease-in-out flex items-center"
                to={"/secret-dashboard"}
              >
                <Lock className="inline-block mr-1" size={18} />
                <span className="hidden sm:inline">Dashboard</span>
              </Link>
            )}

            {/* 👤 USER DROPDOWN */}
            {user ? (
              <div className="relative" ref={userMenuRef}>
                <button
                  onClick={() => setOpenUserMenu(!openUserMenu)}
                  className="flex items-center justify-center w-10 h-10 rounded-full
                             bg-gray-700 hover:bg-gray-600 transition duration-300"
                >
                  <User size={20} className="text-white" />
                </button>

                {openUserMenu && (
                  <div
                    className="absolute right-0 mt-3 w-56 rounded-xl bg-gray-800
                               shadow-xl border border-gray-700 overflow-hidden
                               animate-fade-in"
                  >
                    {/* User Info */}
                    <div className="px-4 py-3 border-b border-gray-700">
                      <p className="text-sm text-white font-medium truncate">
                        {user.name || "User"}
                      </p>
                      <p className="text-xs text-gray-400 truncate">
                        {user.email || ""}
                      </p>
                    </div>

                    {/* Settings */}
                    <Link
                      to="/setting"
                      onClick={() => setOpenUserMenu(false)}
                      className="flex items-center gap-2 px-4 py-3 text-gray-200
                                 hover:bg-gray-700 transition"
                    >
                      <Settings size={16} />
                      Settings
                    </Link>

                    <div className="border-t border-gray-700" />

                    {/* Logout */}
                    <button
                      onClick={logout}
                      className="w-full flex items-center gap-2 px-4 py-3
                                 text-red-400 hover:bg-red-500/10 transition"
                    >
                      <LogOut size={16} />
                      Logout
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <>
                <Link
                  to={"/signup"}
                  className="Bg-primary hover:primary text-white py-2 px-4 
                             rounded-md flex items-center transition duration-300 ease-in-out"
                >
                  <UserPlus className="mr-2" size={18} />
                  Sign Up
                </Link>

                <Link
                  to={"/login"}
                  className="bg-gray-700 hover:bg-gray-600 text-white py-2 px-4 
                             rounded-md flex items-center transition duration-300 ease-in-out"
                >
                  <LogIn className="mr-2" size={18} />
                  Login
                </Link>
              </>
            )}
          </nav>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
