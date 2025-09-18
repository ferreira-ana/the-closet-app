<template>
  <nav aria-label="Auth Navigation">
    <div class="main-nav-list">
      <ul class="cta-buttons">
        <li>
          <router-link
            to="/login"
            class="main-nav-link nav-login nav-cta"
            aria-label="Log in to your account"
            >Log In</router-link
          >
        </li>
        <li>
          <router-link
            to="/sign-up"
            class="main-nav-link nav-signup nav-cta"
            aria-label="Create a new account"
            >Sign Up</router-link
          >
        </li>
      </ul>
    </div>
  </nav>
</template>

<style scoped>
li {
  display: inline;
}
a,
router-link {
  text-decoration: none;
}
a:hover,
router-link:hover {
  text-decoration: underline;
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
  justify-content: center;
  margin-top: 7.2rem;
}

.main-nav-link:link,
.main-nav-link:visited {
  display: inline-block;
  text-decoration: none;
  color: #fff;
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

.router-link-active:link,
.router-link-active:link {
  color: #fff;
  background-color: var(--color-secundary);
}

.router-link-active:hover,
.router-link-active:active {
  color: #fff;
  background-color: var(--color-secundary);
  pointer-events: none;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

.cta-buttons {
  display: flex;
  gap: 1rem;
}
</style>
