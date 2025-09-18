<template>
  <section class="section-hero">
    <div class="hero">
      <div class="hero-text-box">
        <h1 class="heading-primary">
          Take the first step to declutter your wardrobe
        </h1>
        <p class="hero-description">
          Welcome to the website that helps you keep track of all the clothing
          in your closet. Tailored to allow you to categorise all your items as
          you wish.
        </p>
        <router-link to="/sign-up" class="btn btn--full margin-right-sm"
          >Start decluttering</router-link
        >
        <a
          href="#about"
          @click.prevent="scrollToSection('about')"
          class="btn btn--outline"
          >Learn more &darr;</a
        >
      </div>
      <div class="hero-img-box">
        <img
          :src="hero"
          alt="various images of well kept closets"
          class="hero-img"
          fetchpriority="high"
          loading="eager"
          decoding="async"
          width="1411"
          height="1387"
        />
      </div>
    </div>
  </section>
</template>

<script setup>
import hero from "@/assets/images/hero.webp";
import { scrollToSection } from "@/composables/scrollToSection";
</script>

<style>
.section-hero {
  background-color: var(--color-primary);
  padding: 4.8rem 0 9.6rem 0;
  height: 95vh;
}

.hero {
  display: grid;
  grid-template-columns: 1fr 1fr;
  margin: 0 auto;
  padding: 4.8rem 3.2rem;
  max-width: 135rem;
  align-items: center;
  gap: 9.6rem;
}

.hero-description {
  font-size: 2rem;
  line-height: 1.6;
  margin-bottom: 4.8rem;
}

.hero-img {
  width: 100%;
  height: auto;
}

/******************************/
/* Below (90*16) 1440px smaller desktops*/
/******************************/
@media (max-width: 90em) {
  .hero {
    width: 90%;
  }
}

/******************************/
/* Below (84*16) 1200px landscape tablets*/
/******************************/
@media (max-width: 75em) {
  .hero {
    gap: 4.8rem;
  }

  .heading-primary {
    font-size: 4.4rem;
  }
  .hero {
    width: 100%;
    padding: 4.8rem 5.6rem;
  }

  .btn.btn--full,
  .btn.btn--outline {
    font-size: 1.6rem;
  }

  .section-hero {
    display: flex;
  }
}
/******************************/
/* Below  976px (tablets)*/
/******************************/
@media (max-width: 61em) {
  .hero {
    grid-template-columns: 1fr;
  }
  .hero-img {
    width: 46vh;
  }

  .hero-text-box,
  .hero-img-box {
    text-align: center;
  }
}
/******************************/
/* Below  544px (smaller tablets) 550/16=34em*/
/******************************/
@media (max-width: 34em) {
  .hero {
    padding: 4.8rem 2.4rem;
  }
  .hero-img {
    width: 82%;
  }
  .btn,
  .btn:visited,
  .btn:link {
    padding: 2.4rem 1.6rem;
    display: inline-block;
  }
  .section-hero {
    padding: 4.8rem 0 6.4rem 0;
  }
}
</style>
