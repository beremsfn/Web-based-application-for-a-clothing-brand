import axios from "axios";

const resolveOrigin = () => {
  const envOrigin = import.meta.env.VITE_BACKEND?.trim();
  if (envOrigin) {
    return envOrigin.replace(/\/$/, "");
  }

  if (import.meta.env.MODE === "development") {
    return "http://localhost:5000";
  }

  console.warn(
    "[apiClient] VITE_BACKEND is missing; falling back to relative requests."
  );
  return "";
};

const resolveBaseURL = (segment = "/api") => {
  const origin = resolveOrigin();
  const trimmedSegment = segment.replace(/^\/+/, "").replace(/\/+$/, "");
  const normalizedSegment = trimmedSegment ? `/${trimmedSegment}` : "";
  return `${origin}${normalizedSegment}` || "/";
};

const buildError = (error) => {
  const message =
    error.response?.data?.message ||
    error.response?.data?.error ||
    error.message ||
    "Request failed";
  const wrappedError = new Error(message);
  wrappedError.data = error.response?.data;
  wrappedError.status = error.response?.status;
  return wrappedError;
};

const createApi = (segment = "/api") => {
  const client = axios.create({
    baseURL: resolveBaseURL(segment),
    withCredentials: true,
    headers: {
      "Content-Type": "application/json",
    },
  });

  const request = async (urlOrConfig, config = {}) => {
    const finalConfig =
      typeof urlOrConfig === "string"
        ? { url: urlOrConfig, ...config }
        : urlOrConfig;

    try {
      const response = await client(finalConfig);
      return response.data;
    } catch (error) {
      throw buildError(error);
    }
  };

  ["get", "post", "put", "patch", "delete"].forEach((method) => {
    request[method] = (url, config = {}) =>
      request({
        url,
        method: method.toUpperCase(),
        ...config,
      });
  });

  return request;
};

const api = createApi("/api");
const authApi = createApi("/api/auth");

export { api, authApi, createApi };
