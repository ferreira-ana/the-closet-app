<template>
  <section id="features" class="features">
    <div class="features-heading responsive-size">
      <h2 class="features-title">A closer look at our core features</h2>
    </div>

    <div class="features-grid grid grid--4-cols responsive-size">
      <div
        v-for="(feature, index) in features"
        :key="index"
        class="feature-card"
      >
        <img
          class="feature-img"
          :src="getImagePath(feature.imageId)"
          :alt="feature.alt"
        />
        <p class="feature-text">{{ feature.text }}</p>
      </div>
    </div>
  </section>
</template>

<script setup>
// Dynamic image path generator
const getImagePath = (imageId) => {
  return new URL(
    `../assets/images/features/feature${imageId}.webp`,
    import.meta.url
  ).href;
};

const features = [
  {
    text: "Declutter your closet",
    imageId: 1,
    alt: "Organized clothes on hangers",
  },
  {
    text: "Organize your space",
    imageId: 2,
    alt: "Neatly arranged clothes in a closet",
  },
  {
    text: "Chose matching outfits and create looks",
    imageId: 3,
    alt: "Person wearing a stylish outfit",
  },
  {
    text: "Get inspiration for your next buy",
    imageId: 4,
    alt: "Clothing-filled shopping bags",
  },
];
</script>

<style>
.features {
  background-color: var(--color-primary);
  padding: 9.6rem 0;
}

.features-heading {
  color: #444;
}

.features-title {
  margin-bottom: 8.8rem;
}

.features-description {
  margin-bottom: 3.2rem;
}

.feature-img {
  width: 100%;
  height: auto;
  object-fit: cover;
}

.features-grid {
  column-gap: 4.8rem;
}

.feature-card {
  background-color: white;
  display: flex;
  justify-content: flex-start;
  gap: 1.6rem;
  flex-direction: column;
  padding: 0.8rem 0.8rem 1.6rem 0.8rem;
  border-radius: 8px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

.feature-text {
  text-align: center;
}

/******************************/
/* Below (90*16) 1440px smaller desktops*/
/******************************/
@media (max-width: 90em) {
  .features-grid {
    column-gap: 4rem;
  }

  .feature-card {
    padding: 0.6rem 0.6rem 1.6rem 0.6rem;
  }
}

/******************************/
/* Below (84*16) 1200px landscape tablets*/
/******************************/

@media (max-width: 75em) {
  .features-grid {
    column-gap: 3.2rem;
  }
}

/******************************/
/* Below  976px (tablets)*/
/******************************/
@media (max-width: 61em) {
  .features-grid {
    grid-template-columns: repeat(3, 1fr);
    row-gap: 3.2rem;
    column-gap: 2.4rem;
  }

  .feature-text {
    font-size: 2rem;
  }
}
/******************************/
/* Below  704px (smaller tablets)*/
/******************************/
@media (max-width: 44em) {
  .features-title {
    margin-bottom: 4.8rem;
  }

  .features-grid {
    grid-template-columns: repeat(2, 1fr);
    row-gap: 4.8rem;
    column-gap: 4.8rem;
  }
}
/******************************/
/* Below  544px (smaller tablets) 550/16=34em*/
/******************************/
@media (max-width: 34em) {
  .features-grid {
    grid-template-columns: 1fr;
    justify-items: center;
  }

  .feature-card {
    width: 35rem;
  }
}
</style>
