import {
  ShoppingCart,
  UserPlus,
  LogIn,
  LogOut,
  Lock,
  User,
  Settings,
  Heart,
  Package,
} from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { useUserStore } from "../stores/useUserStore";
import { useCartStore } from "../stores/useCartStore";
import { useProductStore } from "../stores/useProductStore";
import { useFavorites } from "../context/FavoritesContext";
import { useState, useRef, useEffect } from "react";

const Navbar = () => {
  const { user, logout } = useUserStore();
  const { cart } = useCartStore();
  const { favorites } = useFavorites();

  const isAdminOrManager =
    user?.role === "admin" || user?.role === "manager";

  const location = useLocation();
  const { fetchProducts } = useProductStore();
  const isAdminPage = location.pathname.startsWith("/admin");

  const handleSearch = (e) => {
    fetchProducts(e.target.value);
  };

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
    <header className="fixed top-0 left-0 w-full bg-gray-900 bg-opacity-90 backdrop-blur-md shadow-lg z-40 border-b border-red-800">
      <div className="container mx-auto px-4 py-3">
        <div className="flex flex-wrap justify-between items-center">

          {/* Logo */}
          <Link to="/" className="flex items-center">
            <img src="logo.png" className="w-[150px]" alt="Cottex" />
          </Link>

          {/* Search */}
          {user && !isAdminPage && (
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
          <nav className="flex items-center gap-5">
            <Link to="/" className="text-gray-300 hover:primary transition">
              Home
            </Link>

            {user && (
              <>
                {/* FAVORITES */}
                <Link
                  to="/favorites"
                  className="relative group text-gray-300 hover:primary transition"
                >
                  <Heart
                    size={20}
                    className="group-hover:scale-110 transition"
                  />
                  {favorites.length > 0 && (
                    <span className="absolute -top-2 -left-2 bg-primary text-white rounded-full px-2 text-xs">
                      {favorites.length}
                    </span>
                  )}
                </Link>

                {/* CART */}
                <Link
                  to="/cart"
                  className="relative group text-gray-300 hover:primary transition"
                >
                  <ShoppingCart size={20} />
                  {cart.length > 0 && (
                    <span className="absolute -top-2 -left-2 bg-primary text-white rounded-full px-2 text-xs">
                      {cart.length}
                    </span>
                  )}
                </Link>
              </>
            )}

            {isAdminOrManager && (
              <Link
                to="/secret-dashboard"
                className="bg-primary text-white px-3 py-1 rounded-md flex items-center"
              >
                <Lock size={18} className="mr-1" />
                Dashboard
              </Link>
            )}

            {/* User Dropdown */}
            {user ? (
              <div className="relative" ref={userMenuRef}>
                <button
                  onClick={() => setOpenUserMenu(!openUserMenu)}
                  className="w-10 h-10 rounded-full bg-gray-700 flex items-center justify-center"
                >
                  <User size={20} className="text-white" />
                </button>

                {openUserMenu && (
                  <div className="absolute right-0 mt-3 w-56 rounded-xl bg-gray-800 border border-gray-700 shadow-xl">
                    <div className="px-4 py-3 border-b border-gray-700">
                      <p className="text-white text-sm">{user.name}</p>
                      <p className="text-gray-400 text-xs">{user.email}</p>
                    </div>

                    <Link
                      to="/setting"
                      className="flex items-center gap-2 px-4 py-3 text-gray-200 hover:bg-gray-700"
                    >
                      <Settings size={16} />
                      Settings
                    </Link>

                    <Link
                      to="/orders"
                      className="flex items-center gap-2 px-4 py-3 text-gray-200 hover:bg-gray-700"
                    >
                      <Package size={16} />
                      Orders
                    </Link>

                    <button
                      onClick={logout}
                      className="w-full flex items-center gap-2 px-4 py-3 text-red-400 hover:bg-red-500/10"
                    >
                      <LogOut size={16} />
                      Logout
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <>
                <Link to="/signup" className="bg-primary px-4 py-2 rounded text-white flex items-center">
                  <UserPlus size={18} className="mr-2" />
                  Sign Up
                </Link>

                <Link to="/login" className="bg-gray-700 px-4 py-2 rounded text-white flex items-center">
                  <LogIn size={18} className="mr-2" />
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
