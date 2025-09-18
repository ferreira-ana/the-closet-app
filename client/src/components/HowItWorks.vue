<template>
  <section id="how-it-works" class="how-it-works-section">
    <h2 class="heading-second">How it works</h2>
    <div class="text-img-grid">
      <div class="step-container">
        <div class="step" v-for="(step, index) in steps" :key="index">
          <div class="howit-number">{{ index + 1 }}</div>
          <p class="steps-title">{{ step.title }}</p>
          <p class="steps-text">{{ step.text }}</p>
        </div>
      </div>
      <div class="img-container">
        <img :src="howit" alt="Matching clothing" class="howit-img" />
      </div>
    </div>
  </section>
</template>

<script setup>
import howit from "@/assets/images/howit-img.webp";

const steps = [
  {
    title: "Add Clothing items",
    text: "Take pictures of your clothing pieces and add them to your closet collection. Pick the categories that best describe them",
  },
  {
    title: "Add Categories",
    text: "Chose the best categories to classify your clothing items. You can then filter your clothing and save sets!",
  },
  {
    title: "Declutter",
    text: "Rate all your items and chose how extreme your wardrobe cleaning is going to be.",
  },
  {
    title: "Plan",
    text: "After decluttering you can take notes on what to buy next",
  },
];
</script>

<style lang="css" scoped>
/*---- Section container -----*/
.how-it-works-section {
  padding: 9.6rem 0;
}

/*---- Outer grid-----*/
.text-img-grid {
  display: grid;
  grid-template-columns: 2fr 1fr;
  padding: 0rem 6.4rem 4.8rem 6.4rem;
  gap: 6.4rem;
}

/* --- Image ---*/
.howit-img {
  width: 100%;
}
/* ---- Steps ---- */
.step-container {
  display: grid;
  grid-template-columns: 1fr 1fr;
  column-gap: 3.2rem;
  row-gap: 3.2rem;
}

.steps-title {
  font-size: 1.8rem;
  color: #444;
  font-weight: 600;
  margin-bottom: 1.6rem;
  letter-spacing: 0.06rem;
}

.steps-text {
  line-height: 1.2;
}

.step {
  width: 60%;
}

.img-container {
  margin-right: 68rem;
  width: 100%;
}

.howit-number {
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  background: radial-gradient(
    circle,
    var(--color-tertiary) 11%,
    var(--color-primary) 100%
  );
  height: 4.8rem;
  width: 4.8rem;
  margin-bottom: 2.4rem;
  padding: 1.8rem;
  border-radius: 50%;
  font-weight: bold;
}

.heading-second {
  margin-bottom: 8.8rem;
  margin-left: 6.4rem;
  color: #333;
}

/******************************/
/* Below (90*16) 1440px smaller desktops*/
/******************************/
@media (max-width: 90em) {
  .text-img-grid {
    grid-template-columns: 1fr 1fr;
    padding: 0rem 6.4rem 4.8rem 6.4rem;
    align-items: center;
    gap: 0;
  }

  .img-container {
    margin-right: 0;
  }

  .step {
    width: 80%;
  }
}

/******************************/
/* Below (84*16) 1200px landscape tablets*/
/******************************/
@media (max-width: 75em) {
  .heading-second {
    margin-left: 5.6rem;
  }

  .text-img-grid {
    padding: 0rem 5.6rem 4.8rem 5.6rem;
    gap: 3.2rem;
  }
  .step {
    width: 90%;
  }

  .step-container {
    column-gap: 2.4rem;
  }
  .steps-title {
    font-size: 1.7rem;
  }
  .howit-number {
    height: 4.4rem;
    width: 4.4rem;
  }
}
/******************************/
/* Below  976px (tablets)*/
/******************************/
@media (max-width: 61em) {
  .text-img-grid {
    padding: 0rem 3.2rem 4.8rem 3.2rem;
    grid-template-columns: 11fr 10fr;
  }
  .heading-second {
    margin-left: 3.2rem;
  }
}

/******************************/
/* Below  704px (smaller tablets)*/
/******************************/
@media (max-width: 44em) {
  .heading-second {
    margin-bottom: 4.8rem;
  }
  .text-img-grid {
    grid-template-columns: 1fr;
  }
}

/******************************/
/* Below  544px (smaller tablets) 550/16=34em*/
/******************************/
@media (max-width: 34em) {
  .text-img-grid {
    padding: 0rem 2.4rem 4.8rem 2.4rem;
  }
  .step-container {
    grid-template-columns: 1fr;
  }
  .heading-second {
    margin-left: 2.4rem;
  }
}
</style>
