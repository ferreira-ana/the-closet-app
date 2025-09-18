<template>
  <section class="cta">
    <div class="cta-content">
      <div class="cta-text">
        <h2 class="cta-title">Want to stay organized for free?</h2>
        <p class="cta-description">
          People collect a lot of clothing items throughout the years. We even
          receive them as gifts! The closet is your ideal partner to help you
          sort through daily-life items!
        </p>
      </div>

      <router-link to="/sign-up" class="btn btn--full">Join Now!</router-link>
    </div>
  </section>
</template>

<script setup></script>

<style lang="css" scoped>
.cta-content {
  background-image: url("@/assets/images/cta-img.jpg");
  background-size: cover;
  background-position: center;
  padding: 3.2rem 6.4rem;
  color: white;
  text-align: left;
  position: relative;
  overflow: hidden;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
  height: 22rem;
  width: 100%;
  display: flex;
  justify-content: space-between;
  opacity: 0.8;
  align-items: center;
}

.cta {
  margin-bottom: 11.2rem;
}

.cta-content > * {
  position: relative;
  z-index: 2;
}

/* Overlay layer for darkening background image */
.cta-content::before {
  content: "";
  position: absolute;
  inset: 0;
  background: rgba(0, 0, 0, 0.5); /* dark overlay for contrast */
  z-index: 1;
}

.cta-description {
  width: 50%;
  line-height: 1.5;
}

.cta-title {
  margin-bottom: 2.4rem;
}

.btn--full {
  align-self: center;
  min-width: max-content;
}

/******************************/
/* Below (84*16) 1200px landscape tablets*/
/******************************/

@media (max-width: 75em) {
  .cta-content {
    padding: 3.2rem 5.6rem;
  }

  .btn--full {
    align-self: end;
  }

  .footer-text {
    width: 72%;
  }
}

/******************************/
/* Below  976px (tablets)*/
/******************************/
@media (max-width: 61em) {
  .cta-content {
    padding: 3.2rem 3.2rem;
  }

  .cta-description {
    width: 70%;
  }
}
/******************************/
/* Below  704px (smaller tablets)*/
/******************************/
@media (max-width: 44em) {
  .cta-description {
    width: 100%;
  }
  .cta-content {
    gap: 2.4rem;
  }
}

/******************************/
/* Below  544px (smaller tablets) 550/16=34em*/
/******************************/
@media (max-width: 34em) {
  .cta-content {
    padding: 3.2rem 2.4rem;
    flex-direction: column;
    height: 35rem;
    justify-content: center;
    gap: 2.4rem;
  }
  .btn--full {
    align-self: center;
  }
}
</style>
