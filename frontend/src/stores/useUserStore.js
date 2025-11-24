import { create } from "zustand";
import axios from "axios";
import { toast } from "react-hot-toast";

const AUTH_BASE_URL = `${import.meta.env.VITE_BACKEND}/api/auth`;

const authClient = axios.create({
  baseURL: AUTH_BASE_URL,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

const formatError = (error) => {
  if (error.response?.data?.message) {
    return new Error(error.response.data.message);
  }
  return new Error(error.message || "An error occurred");
};

const rawAuthRequest = async (config) => {
  try {
    const response = await authClient.request(config);
    return response.data;
  } catch (error) {
    throw formatError(error);
  }
};

let refreshPromise = null;

const authRequest = async (config, retry = true) => {
  try {
    const response = await authClient.request(config);
    return response.data;
  } catch (error) {
    const status = error.response?.status;

    if (status === 401 && retry) {
      try {
        if (!refreshPromise) {
          refreshPromise = useUserStore.getState().refreshToken();
        }
        await refreshPromise;
        refreshPromise = null;
        return authRequest(config, false);
      } catch (refreshError) {
        refreshPromise = null;
        useUserStore.getState().logout();
        throw formatError(refreshError);
      }
    }

    throw formatError(error);
  }
};

export const useUserStore = create((set, get) => ({
  user: null,
  loading: false,
  checkingAuth: true,
  refreshingToken: false,

  signup: async ({ name, email, password, confirmPassword }) => {
    set({ loading: true });

    if (password !== confirmPassword) {
      set({ loading: false });
      return toast.error("Passwords do not match");
    }

    try {
      const data = await authRequest({
        url: "/signup",
        method: "POST",
        data: { name, email, password },
      });
      set({ user: data, loading: false });
    } catch (error) {
      set({ loading: false });
      toast.error(error.message || "An error occurred");
    }
  },
  login: async (email, password) => {
    set({ loading: true });

    try {
      const data = await authRequest({
        url: "/login",
        method: "POST",
        data: { email, password },
      });

      set({ user: data, loading: false });
    } catch (error) {
      set({ loading: false });
      toast.error(error.message || "An error occurred");
    }
  },

  logout: async () => {
    try {
      await rawAuthRequest({ url: "/logout", method: "POST" });
      set({ user: null });
    } catch (error) {
      toast.error(error.message || "An error occurred during logout");
    }
  },

  checkAuth: async () => {
    set({ checkingAuth: true });
    try {
      const data = await rawAuthRequest({ url: "/profile" });
      set({ user: data, checkingAuth: false });
    } catch (error) {
      console.log(error.message);
      set({ checkingAuth: false, user: null });
    }
  },

  refreshToken: async () => {
    if (get().refreshingToken) return;

    set({ refreshingToken: true });
    try {
      const data = await rawAuthRequest({
        url: "/refresh-token",
        method: "POST",
      });
      set({ refreshingToken: false });
      return data;
    } catch (error) {
      set({ user: null, refreshingToken: false });
      throw error;
    }
  },
}));
