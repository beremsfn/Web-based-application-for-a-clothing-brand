import { create } from "zustand";
import { toast } from "react-hot-toast";
import { authApi } from "../lib/apiClient";
import { api } from "../lib/apiClient"; // normal api


/* =======================
   Helpers
======================= */

const formatError = (error) => {
  const formatted = new Error(error.message || "An error occurred");
  if (error.status) formatted.status = error.status;
  if (error.data) formatted.data = error.data;
  return formatted;
};

const rawAuthRequest = async (config) => {
  try {
    return await authApi(config);
  } catch (error) {
    throw formatError(error);
  }
};

let refreshPromise = null;

const authRequest = async (config, retry = true) => {
  try {
    return await rawAuthRequest(config);
  } catch (error) {
    const status = error.status;

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

/* =======================
   Store
======================= */

export const useUserStore = create((set, get) => ({
  /* ---------- Auth State ---------- */
  user: null,
  loading: false,
  checkingAuth: true,
  refreshingToken: false,

  /* ---------- Admin State ---------- */
  users: [],
  usersLoading: false,

  /* =======================
     AUTH ACTIONS
  ======================= */

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
    const { data } = await authApi.get("/me");

    set({
      user: data,
      checkingAuth: false,
    });
  } catch {
    set({
      user: null,
      checkingAuth: false,
    });
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

  updateProfile: async ({ name, email }) => {
    set({ loading: true });

    try {
      const data = await authRequest({
        url: "/profile",
        method: "PUT",
        data: { name, email },
      });

      set({ user: data.user, loading: false });
      toast.success("Profile updated!");
    } catch (error) {
      set({ loading: false });
      toast.error(error.message || "Failed to update profile");
    }
  },

  changePassword: async ({ currentPassword, newPassword }) => {
    set({ loading: true });
    try {
      await authRequest({
        url: "/password",
        method: "PUT",
        data: { currentPassword, newPassword },
      });
      set({ loading: false });
      toast.success("Password updated!");
    } catch (error) {
      set({ loading: false });
      toast.error(error.message || "Failed to update password");
    }
  },

  /* =======================
     ADMIN ACTIONS
  ======================= */

  fetchAllUsers: async () => {
    set({ usersLoading: true });

    try {
      const res = await api.get("/users"); // ✅ correct endpoint
      set({ users: res, usersLoading: false });
    } catch (error) {
      set({ usersLoading: false });
      toast.error(error.message || "Failed to fetch users");
    }
  },

  deleteUser: async (userId) => {
    try {
      await api.delete(`/users/${userId}`);
      set((state) => ({
        users: state.users.filter((u) => u._id !== userId),
      }));
      toast.success("User deleted successfully");
    } catch (error) {
      toast.error(error.message || "Failed to delete user");
    }
  },
}));
