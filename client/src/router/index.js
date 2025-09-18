import { createRouter, createWebHistory } from "vue-router";
import Home from "../views/Home.vue";
import Login from "../views/Login.vue";
import SignUp from "../views/SignUp.vue";
import Closets from "../views/Closets.vue";
import Decluttering from "@/views/Decluttering.vue";
import Outfits from "@/views/Outfits.vue";
import Settings from "@/views/Settings.vue";
import { useAuthStore } from "@/stores/auth";

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    { path: "/", name: "home", component: Home },
    { path: "/login", name: "login", component: Login },
    { path: "/sign-up", name: "sign-up", component: SignUp },
    {
      path: "/closets",
      name: "closets",
      component: Closets,
      meta: { requiresAuth: true },
    },
    {
      path: "/decluttering-mode",
      name: "decluttering",
      component: Decluttering,
      meta: { requiresAuth: true },
    },
    {
      path: "/outfits",
      name: "outfits",
      component: Outfits,
      meta: { requiresAuth: true },
    },
    {
      path: "/settings",
      name: "settings",
      component: Settings,
      meta: { requiresAuth: true },
    },
    {
      path: "/:pathMatch(.*)*",
      name: "NotFound",
      component: () => import("@/views/errorPages/NotFound.vue"),
    },
    {
      path: "/500",
      name: "ServerError",
      component: () => import("@/views/errorPages/ServerError.vue"),
    },
  ],
});

// Global navigation guard
router.beforeEach(async (to, from, next) => {
  const auth = useAuthStore();

  // If route requires authentication, ensure token is valid (or silently refresh)
  if (to.meta.requiresAuth) {
    const ok = await auth.ensureAuthForProtected();
    return ok ? next() : next({ name: "login" });
  }

  // If visiting a public page and we already have a session (or refresh works), skip to main app
  if (["home", "login", "sign-up"].includes(to.name)) {
    const got = auth.accessToken ? true : await auth.silentTryRefresh();
    if (got) return next({ name: "closets" });
  }

  return next();
});

export default router;
