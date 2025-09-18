<template>
  <header :class="{ 'nav-open': navOpen }" class="header">
    <img :src="logo" alt="Logo" class="logo" />

    <nav class="main-nav" aria-label="Main navigation">
      <ul class="main-nav-list">
        <li v-for="link in links" :key="link.name">
          <a
            v-if="isHomePage"
            :href="link.to"
            class="main-nav-link"
            @click="handleLinkClick"
          >
            {{ link.name }}
          </a>
          <router-link
            v-else
            :to="link.to"
            class="main-nav-link"
            @click="handleLinkClick"
          >
            {{ link.name }}
          </router-link>
        </li>

        <div v-if="!isHomePage" class="cta-buttons">
          <li>
            <router-link to="/settings" class="main-nav-link nav-login nav-cta">
              Settings
            </router-link>
          </li>
          <li>
            <button @click="logout" class="main-nav-link nav-signup nav-cta">
              Logout
            </button>
          </li>
        </div>
        <div v-else class="cta-buttons">
          <li>
            <router-link to="/login" class="main-nav-link nav-login nav-cta"
              >Login</router-link
            >
          </li>
          <li>
            <router-link to="/sign-up" class="main-nav-link nav-signup nav-cta"
              >Sign Up</router-link
            >
          </li>
        </div>
      </ul>
    </nav>

    <!--  Mobile nav toggle button -->
    <button class="btn-mobile-nav" @click="toggleNav">
      <ion-icon name="menu-outline" class="icon-mobile-nav"></ion-icon>
      <ion-icon name="close-outline" class="icon-mobile-nav"></ion-icon>
    </button>
  </header>
</template>

<script setup>
import logo from "@/assets/images/logo.png";
import { ref, computed } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useAuthStore } from "@/stores/auth";

const route = useRoute();
const router = useRouter();
const isHomePage = computed(() => route.path === "/");

const links = computed(() => {
  return isHomePage.value
    ? [
        { name: "About", to: "#about" },
        { name: "Features", to: "#features" },
        { name: "How it Works", to: "#how-it-works" },
      ]
    : [
        { name: "My Closet", to: "/closets" },
        { name: "Decluttering Mode", to: "/decluttering-mode" },
        { name: "Outfits", to: "/outfits" },
      ];
});

const authStore = useAuthStore();
const logout = async () => {
  try {
    await authStore.logout();
    router.push({ name: "home" });
  } catch (error) {
    console.error("Error during logout:", error);
  }
};

//  Mobile nav toggle state
const navOpen = ref(false);
const toggleNav = () => {
  navOpen.value = !navOpen.value;
};

const handleLinkClick = () => {
  navOpen.value = false;
};
</script>

<style scoped>
header {
  background-color: #fff;
  display: flex;
  justify-content: space-between;
  padding: 1rem 2.4rem;
  align-items: center;
}
ul {
  list-style: none;
  display: flex;
  gap: 4rem;
}
li {
  display: inline;
}
a,
router-link {
  color: #333;
  font-size: 1.8rem;
  text-decoration: none;
  cursor: pointer;
  font-weight: 500;
}
a:hover,
router-link:hover {
  text-decoration: none;
  color: var(--color-tertiary);
}
img {
  height: 48px;
  padding-bottom: 2px;
}

.main-nav-list {
  list-style: none;
  display: flex;
  gap: 4.8rem;
  align-items: center;
}

:link,
.main-nav-link:visited {
  display: inline-block;
  text-decoration: none;
  color: #333;
  font-weight: 500;
  font-size: 1.8rem;
  transition: all 0.3s;
}

.main-nav-link:hover,
.main-nav-link:active {
  color: var(--color-tertiary);
}

.main-nav-link.nav-cta:link,
.main-nav-link.nav-cta:visited {
  padding: 1.2rem 2.4rem;
  border-radius: 9px;
}

.main-nav-link.nav-login:link,
.main-nav-link.nav-login:visited {
  color: #fff;
  background-color: var(--color-secundary);
}

.main-nav-link.nav-login:hover,
.main-nav-link.nav-login:active {
  background-color: var(--color-tertiary);
}

.main-nav-link.nav-signup:link,
.main-nav-link.nav-signup:visited {
  background-color: var(--light-gray);
}

.main-nav-link.nav-signup:hover,
.main-nav-link.nav-signup:active {
  background-color: var(--dark-gray);
  color: #fff;
}

.cta-buttons {
  display: flex;
  gap: 1rem;
}

.btn-mobile-nav {
  border: none;
  background: none;
  display: none;
  cursor: pointer;
}

.icon-mobile-nav {
  height: 4.8rem;
  width: 4.8rem;
  color: #333;
}

.icon-mobile-nav[name="close-outline"] {
  display: none;
}

.main-nav-link.nav-signup {
  color: inherit;
  padding: 1.2rem 2.4rem;
  border-radius: 9px;
  font-size: 1.8rem;
  font-weight: 500;
  transition: all 0.3s;
  text-align: center;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  line-height: 1;
  border: none;
  font-family: "Rubik", sans-serif;
}

@media (max-width: 61em) {
  .btn-mobile-nav {
    display: block;
    z-index: 1002;
  }
  .nav-open .icon-mobile-nav[name="close-outline"] {
    display: block;
  }

  .nav-open .icon-mobile-nav[name="menu-outline"] {
    display: none;
  }
  .main-nav {
    position: fixed; /* fixed to the viewport */
    inset: 0; /* top:0; right:0; bottom:0; left:0; */
    background-color: rgba(255, 255, 255, 0.95);
    backdrop-filter: blur(10px);
    transform: translateX(100%); /* off-canvas to the right */
    transition: transform 0.5s ease-in, opacity 0.3s;
    display: flex;
    align-items: center;
    justify-content: center;
    opacity: 0;
    pointer-events: none;
    visibility: hidden;
    z-index: 1001;
    /* Makes sure it doesn’t create a horizontal scrollbar while hidden */
    will-change: transform;
    contain: paint; /* avoids painting outside its box */
  }

  .nav-open .main-nav {
    transform: translateX(0);
    opacity: 1;
    pointer-events: auto;
    visibility: visible;
  }

  .main-nav-list {
    flex-direction: column;
    gap: 4.8rem;
  }

  .main-nav-link:link,
  .main-nav-link:visited {
    font-size: 3rem;
  }
  .cta-buttons {
    display: flex;
    gap: 1.2rem;
    flex-direction: column;
    align-items: center;
    margin-top: 2.4rem;
  }
}

/******************************/
/* Below (84*16) 1200px landscape tablets*/
/******************************/
@media (max-width: 75em) {
  .main-nav-list {
    gap: 3.2rem;
  }
  .main-nav-link:link,
  .main-nav-link:visited {
    font-size: 1.6rem;
  }

  .main-nav-link.nav-signup {
    font-size: 1.6rem;
  }
}
</style>
