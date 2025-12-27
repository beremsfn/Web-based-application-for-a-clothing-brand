import { create } from "zustand";
import toast from "react-hot-toast";
import { api } from "../lib/apiClient";

export const useProductStore = create((set) => ({
  products: [],
  loading: false,

  setProducts: (products) => set({ products }),

  fetchProducts: async (search = "") => {
    set({ loading: true });
    try {
      const data = await api.get(`/products?search=${search}`);
      set({ products: data.products || data || [], loading: false });
    } catch (error) {
      set({ loading: false });
      toast.error(error.message || "Failed to search products");
    }
  },
  
  createProduct: async (productData) => {
    set({ loading: true });
    try {
      const data = await api.post("/products", { data: productData });
      set((state) => ({
        products: [...state.products, data],
        loading: false,
      }));
    } catch (error) {
      toast.error(error.message);
      set({ loading: false });
    }
  },

  fetchAllProducts: async () => {
    set({ loading: true });
    try {
      const data = await api.get("/products");
      set({ products: data.products || [], loading: false });
    } catch (error) {
      set({ error: "Failed to fetch products", loading: false });
      toast.error(error.message || "Failed to fetch products");
    }
  },

  fetchProductsByCategory: async (category) => {
    set({ loading: true });
    try {
      const data = await api.get(`/products/category/${category}`);
      set({ products: data.products || [], loading: false });
    } catch (error) {
      set({ error: "Failed to fetch products", loading: false });
      toast.error(error.message || "Failed to fetch products");
    }
  },

  deleteProduct: async (productId) => {
    set({ loading: true });
    try {
      await api.delete(`/products/${productId}`);
      set((state) => ({
        products: state.products.filter(
          (product) => product._id !== productId
        ),
        loading: false,
      }));
    } catch (error) {
      set({ loading: false });
      toast.error(error.message || "Failed to delete product");
    }
  },

  toggleFeaturedProduct: async (productId) => {
    set({ loading: true });
    try {
      const data = await api.patch(`/products/${productId}`);
      set((state) => ({
        products: state.products.map((product) =>
          product._id === productId
            ? { ...product, isFeatured: data.isFeatured }
            : product
        ),
        loading: false,
      }));
    } catch (error) {
      set({ loading: false });
      toast.error(error.message || "Failed to update product");
    }
  },

  fetchFeaturedProducts: async () => {
    set({ loading: true });
    try {
      const data = await api.get("/products/featured");
      set({ products: data, loading: false });
    } catch (error) {
      set({ error: "Failed to fetch products", loading: false });
      console.log("Error fetching featured products:", error);
    }
  },

}));
