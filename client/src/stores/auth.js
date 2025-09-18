import { defineStore } from "pinia";
import axios from "axios";
import api from "@/api"; // Axios instance with interceptors

// Raw Axios instance with no interceptors, used only for refresh & logout
const raw = axios.create({
  baseURL: "http://localhost:3000/api/v1",
  withCredentials: true, // Needed to send cookies (like refreshJwt)
});

export const useAuthStore = defineStore("auth", {
  state: () => ({
    accessToken: null,
    user: null,
    justLoggedOut: false, // prevent refresh attempts right after logout
  }),

  getters: {
    isAuthenticated: (state) => !!state.accessToken && !!state.user,
  },

  actions: {
    /**
     * Silent background refresh attempt
     * Used for:
     * - Public pages ("/", "/login", etc.)
     * - Axios interceptor retry
     *
     * Returns true if a new accessToken was obtained
     */
    async silentTryRefresh() {
      if (this.justLoggedOut) return false; // Don't refresh right after logout

      try {
        const res = await raw.get("/users/refresh"); // Try getting a new access token
        if (res.status === 200 && res.data?.token) {
          this.accessToken = res.data.token;
          // Set user from response if available, fallback to a stub
          this.user ??= res.data.data?.user ?? { id: "self" };
          return true;
        }
        return false; // 204 or unexpected shape
      } catch {
        return false; // invalid/expired cookie → not logged in
      }
    },
    /**
     * Ensures a valid token for protected pages
     * If missing, attempts silent refresh
     */
    async ensureAuthForProtected() {
      if (!this.accessToken) {
        const didRefresh = await this.silentTryRefresh();
        if (!didRefresh) return false;
      }
      if (!this.user) this.user = { id: "self" };
      return true;
    },
    /**
     * - Logs the user in
     * - Sends credentials to backend
     * - Stores accessToken and user in state
     * - Errors are caught inside a component
     */
    async login(email, password) {
      const res = await api.post("/users/login", { email, password });
      this.accessToken = res.data.token;
      this.user = res.data.data.user;
      this.justLoggedOut = false; // Clear logout flag (safe to refresh again)
      return { success: true };
    },
    /**
     * - Logs the user out
     * - Calls backend to clear cookie
     * - Resets local state
     */
    async logout({ silent = false } = {}) {
      try {
        await raw.get("/users/logout");
      } catch (e) {
        if (!silent && import.meta.env.DEV) {
          console.error("Logout error:", e);
        }
      } finally {
        // Reset everything
        this.accessToken = null;
        this.user = null;
        this.justLoggedOut = true; // Block immediate refreshes
        // Automatically reset flag after short cooldown
        setTimeout(() => (this.justLoggedOut = false), 1000);
      }
    },

    /**
     * - Creates a new user and logs them in
     * - Sends signup data to backend
     * - Saves tokens on success
     */
    async signup(name, email, password, passwordConfirm) {
      const res = await api.post("/users/signup", {
        name,
        email,
        password,
        passwordConfirm,
      });
      this.accessToken = res.data.token;
      this.user = res.data.data.user;
      this.justLoggedOut = false;
      return { success: true };
    },

    /**
     *  Deletes the current user account
     * - Then logs out silently
     */
    async deleteAccount() {
      await api.delete("/users/deleteMe");
      await this.logout({ silent: true });
    },
  },
});
