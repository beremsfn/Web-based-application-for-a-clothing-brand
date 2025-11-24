import { create } from "zustand";
import { toast } from "react-hot-toast";
import { api } from "../lib/apiClient";

export const useCartStore = create((set, get) => ({
  cart: [],
  coupon: null,
  total: 0,
  subtotal: 0,
  isCouponApplied: false,

  getMyCoupon: async () => {
    try {
      const response = await api.get("/coupons");
      set({ coupon: response });
    } catch (error) {
      console.error("Error fetching coupon:", error);
    }
  },
  applyCoupon: async (code) => {
    try {
      const response = await api.post("/coupons/validate", { data: { code } });
      set({ coupon: response, isCouponApplied: true });
      get().calculateTotals();
      toast.success("Coupon applied successfully");
    } catch (error) {
      toast.error(error.message || "Failed to apply coupon");
    }
  },
  removeCoupon: () => {
    set({ coupon: null, isCouponApplied: false });
    get().calculateTotals();
    toast.success("Coupon removed");
  },

  getCartItems: async () => {
    try {
      const res = await api.get("/cart");
      set({ cart: res.cart || [] });
      get().calculateTotals();
    } catch (error) {
      set({ cart: [] });
      toast.error(error.message || "An error occurred");
    }
  },
  clearCart: async () => {
    set({ cart: [], coupon: null, total: 0, subtotal: 0 });
  },
  addToCart: async (product) => {
    try {
      const res = await api.post("/cart", {
        data: { productId: product._id },
      });
      toast.success("Product added to cart");

      if (res?.cart) {
        set({ cart: res.cart });
      } else {
        set((prevState) => {
          const existingItem = prevState.cart.find(
            (item) => item._id === product._id
          );
          const newCart = existingItem
            ? prevState.cart.map((item) =>
                item._id === product._id
                  ? { ...item, quantity: item.quantity + 1 }
                  : item
              )
            : [...prevState.cart, { ...product, quantity: 1 }];
          return { cart: newCart };
        });
      }
      get().calculateTotals();
    } catch (error) {
      toast.error(error.message || "An error occurred");
    }
  },
  removeFromCart: async (productId) => {
    try {
      const res = await api.delete("/cart", {
        data: { productId },
      });

      if (res?.cart) {
        set({ cart: res.cart });
      } else {
        set((prevState) => ({
          cart: prevState.cart.filter((item) => item._id !== productId),
        }));
      }
      get().calculateTotals();
    } catch (error) {
      toast.error(error.message || "Failed to remove product");
    }
  },
  updateQuantity: async (productId, quantity) => {
    if (quantity === 0) {
      get().removeFromCart(productId);
      return;
    }

    try {
      const res = await api.put(`/cart/${productId}`, {
        data: { quantity },
      });

      if (res?.cart) {
        set({ cart: res.cart });
      } else {
        set((prevState) => ({
          cart: prevState.cart.map((item) =>
            item._id === productId ? { ...item, quantity } : item
          ),
        }));
      }
      get().calculateTotals();
    } catch (error) {
      toast.error(error.message || "Failed to update quantity");
    }
  },
  calculateTotals: () => {
    const { cart, coupon } = get();
    const subtotal = cart.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    );
    let total = subtotal;

    if (coupon) {
      const discount = subtotal * (coupon.discountPercentage / 100);
      total = subtotal - discount;
    }

    set({ subtotal, total });
  },
}));
