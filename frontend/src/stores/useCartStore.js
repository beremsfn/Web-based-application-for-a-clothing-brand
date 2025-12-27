import { create } from "zustand";
import { toast } from "react-hot-toast";
import { api } from "../lib/apiClient";

export const useCartStore = create((set, get) => ({
  /* =======================
     STATE
  ======================== */
  cart: [],
  coupon: null,
  isCouponApplied: false,
  subtotal: 0,
  total: 0,
  paymentLoading: false,

  /* =======================
     COUPONS
  ======================== */
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
      const response = await api.post("/coupons/validate", {
        data: { code },
      });

      set({
        coupon: response,
        isCouponApplied: true,
      });

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

  /* =======================
     CART ACTIONS
  ======================== */
  getCartItems: async () => {
    try {
      const res = await api.get("/cart");
      set({ cart: res.cart || [] });
      get().calculateTotals();
    } catch (error) {
      set({ cart: [] });
      toast.error(error.message || "Failed to load cart");
    }
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
        set((state) => {
          const existing = state.cart.find(
            (item) => item._id === product._id
          );

          const updatedCart = existing
            ? state.cart.map((item) =>
                item._id === product._id
                  ? { ...item, quantity: item.quantity + 1 }
                  : item
              )
            : [...state.cart, { ...product, quantity: 1 }];

          return { cart: updatedCart };
        });
      }

      get().calculateTotals();
    } catch (error) {
      toast.error(error.message || "Failed to add product");
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
        set((state) => ({
          cart: state.cart.filter((item) => item._id !== productId),
        }));
      }

      get().calculateTotals();
    } catch (error) {
      toast.error(error.message || "Failed to remove product");
    }
  },

  updateQuantity: async (productId, quantity) => {
    if (quantity <= 0) {
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
        set((state) => ({
          cart: state.cart.map((item) =>
            item._id === productId ? { ...item, quantity } : item
          ),
        }));
      }

      get().calculateTotals();
    } catch (error) {
      toast.error(error.message || "Failed to update quantity");
    }
  },

  clearCart: () => {
    set({
      cart: [],
      coupon: null,
      isCouponApplied: false,
      subtotal: 0,
      total: 0,
    });
  },

  /* =======================
     TOTALS
  ======================== */
  calculateTotals: () => {
    const { cart, coupon } = get();

    const subtotal = cart.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    );

    let total = subtotal;

    if (coupon?.discountPercentage) {
      total = subtotal - subtotal * (coupon.discountPercentage / 100);
    }

    set({ subtotal, total });
  },

  /* =======================
     PAYMENT
  ======================== */
  initiatePayment: async () => {
    try {
      set({ paymentLoading: true });

      const { total } = get();

      const res = await api.post("/payment/pay", {
        data: { totalAmount: total },
      });

      window.location.href = res.checkoutUrl;
    } catch (error) {
      set({ paymentLoading: false });
      toast.error(error.message || "Failed to initiate payment");
    }
  },
}));
