import axios from "axios";
import { useAuthStore } from "@/stores/auth";
import router from "@/router";

// Create Axios instance with base URL and cookie support
const api = axios.create({
  baseURL: "http://localhost:3000/api/v1",
  withCredentials: true, // Include cookies for refresh token
});

// Request Interceptor: attach Authorization token + handle FormData
api.interceptors.request.use((config) => {
  const authStore = useAuthStore();
  // Attach access token to Authorization header if present
  if (authStore.accessToken) {
    config.headers.Authorization = `Bearer ${authStore.accessToken}`;
  }
  // We only adjust Content-Type for FormData; Axios handles JSON automatically
  if (config.data instanceof FormData) {
    delete config.headers["Content-Type"];
  }
  return config;
});

// Handles 401 errors and refresh token logic
api.interceptors.response.use(
  (res) => res, // Pass through successful responses
  async (error) => {
    const { response, config } = error;
    if (!response) return Promise.reject(error);

    const authStore = useAuthStore();
    const is401 = response.status === 401;
    const isRefreshCall = (config?.url || "").includes("/users/refresh");

    // Skip refresh if this was immediately after logout
    if (authStore.justLoggedOut) {
      return Promise.reject(error);
    }

    if (is401 && !isRefreshCall && !config._retry) {
      try {
        config._retry = true;
        const ok = await authStore.silentTryRefresh(); // will be no-op if cookie missing (204)
        if (ok && authStore.accessToken) {
          config.headers.Authorization = `Bearer ${authStore.accessToken}`;
          return api.request(config);
        }
      } catch (refreshError) {
        if (import.meta.env.DEV) {
          console.warn("Silent refresh failed:", refreshError);
        }
        // Intentionally ignored: refresh token missing or invalid (handled below with logout)
      }
      // If refresh fails, log out and redirect to login
      await authStore.logout({ silent: true });
      if (router.currentRoute.value.meta?.requiresAuth) {
        router.push({ name: "login" });
      }
      return Promise.reject(error);
    }

    // Handles 500 errors globally
    if (response.status === 500) {
      router.push("/500");
    }
    return Promise.reject(error);
  }
);

export default api;
