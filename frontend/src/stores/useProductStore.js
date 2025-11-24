import { create } from "zustand";
import toast from "react-hot-toast";
import axios from "axios";

const BACKENDURL = `${import.meta.env.VITE_BACKEND}`;

const productClient = axios.create({
  baseURL: BACKENDURL,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

const apiRequest = async (config) => {
  try {
    const response = await productClient.request(config);
    return response.data;
  } catch (error) {
    const message =
      error.response?.data?.error ||
      error.response?.data?.message ||
      error.message ||
      "Request failed";
    const wrappedError = new Error(message);
    wrappedError.data = error.response?.data;
    throw wrappedError;
  }
};

export const useProductStore = create((set) => ({
  products: [],
  loading: false,

  setProducts: (products) => set({ products }),
  createProduct: async (productData) => {
    set({ loading: true });
    try {
      const data = await apiRequest({
        url: "/products",
        method: "POST",
        data: productData,
      });
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
      const data = await apiRequest({ url: "/products" });
      set({ products: data.products || [], loading: false });
    } catch (error) {
      set({ error: "Failed to fetch products", loading: false });
      toast.error(error.message || "Failed to fetch products");
    }
  },
  fetchProductsByCategory: async (category) => {
    set({ loading: true });
    try {
      const data = await apiRequest({ url: `/products/category/${category}` });
      set({ products: data.products || [], loading: false });
    } catch (error) {
      set({ error: "Failed to fetch products", loading: false });
      toast.error(error.message || "Failed to fetch products");
    }
  },
  deleteProduct: async (productId) => {
    set({ loading: true });
    try {
      await apiRequest({ url: `/products/${productId}`, method: "DELETE" });
      set((state) => ({
        products: state.products.filter((product) => product._id !== productId),
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
      const data = await apiRequest({
        url: `/products/${productId}`,
        method: "PATCH",
      });
      // this will update the isFeatured prop of the product
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
      const data = await apiRequest({ url: "/products/featured" });
      set({ products: data, loading: false });
    } catch (error) {
      set({ error: "Failed to fetch products", loading: false });
      console.log("Error fetching featured products:", error);
    }
  },
}));
