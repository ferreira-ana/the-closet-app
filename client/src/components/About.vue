<template>
  <section id="about" class="about center-text">
    <div class="about-grid">
      <div class="img-container">
        <img
          :src="about"
          alt="Someone seating back, looking at a computer"
          class="about-img"
        />
        <div class="circle"></div>
      </div>

      <div class="text-area">
        <h2 class="about-title">About</h2>
        <div class="about-text">
          <p>
            The closet is designed to help you keep track of your clothing
            items. you can organize them by color, by season, and many more! You
            can even create your own categories!
          </p>
          <p>
            Take a look at the advantages of keeping track of all your clothing
            in one application!
          </p>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
import about from "@/assets/images/about-img.webp";
</script>

<style scoped>
.about {
  background-color: #fff;
  padding: 18.2rem 6.4rem;
}

.about-img {
  width: 100%;
}

.text-area {
  margin-left: 4.8rem;
  position: relative;
  display: flex;
  justify-content: flex-start;
  flex-direction: column;
}

.about-text {
  position: absolute;
  top: 50%;
  line-height: 2;
  text-align: center;
}

.about-title {
  text-align: start;
  color: #444;
  margin-bottom: 8.8rem;
  margin-top: 9.6rem;
}

.img-container {
  width: 100%;
  position: relative;
}

.about-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 6.4rem;
}

.circle {
  opacity: 20%;
  height: 77%;
  width: 83%;
  background-image: linear-gradient(
    to right bottom,
    #000000,
    rgba(127, 124, 124, 0.179)
  );
  position: absolute;
  top: -5%;
  right: -6%;
  border-radius: 9px;
}

/******************************/
/* Below (84*16) 1200px landscape tablets*/
/******************************/
@media (max-width: 75em) {
  .about-text {
    text-align: justify;
    line-height: 1.6;
  }

  .text-area {
    margin-bottom: 0.6rem;
  }

  .about-title {
    margin-top: 3.2rem;
    margin-bottom: 0;
  }

  .about-grid {
    gap: 4.8rem;
  }
  .about {
    padding: 18.2rem 5.6rem;
  }
}

/******************************/
/* Below  976px (tablets)*/
/******************************/
@media (max-width: 61em) {
  .about {
    padding: 18.2rem 3.2rem;
  }
  .about-grid {
    grid-template-columns: 10fr 11fr;
    gap: 0rem;
  }
}

/******************************/
/* Below  704px (smaller tablets)*/
/******************************/
@media (max-width: 44em) {
  .text-area {
    margin-left: 3.2rem;
  }
  .about-text {
    line-height: 1.2;
  }
}

/******************************/
/* Below  544px (smaller tablets) 550/16=34em*/
/******************************/
@media (max-width: 34em) {
  .about {
    padding: 9.2rem 2.4rem;
  }
  .about-title {
    margin-top: 0;
    margin-bottom: 8rem;
  }

  .img-container {
    width: 94%;
  }

  .about-grid {
    grid-template-columns: 1fr;
    gap: 20rem;
  }

  .about-grid > :nth-child(1) {
    grid-row: 2;
  }

  .about-grid > :nth-child(2) {
    grid-row: 1;
  }
}
</style>
