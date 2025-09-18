<template>
  <footer class="footer">
    <div class="footer-content">
      <img
        :src="logo"
        alt="Logo"
        class="logo"
        @click="scrollToTop"
        style="cursor: pointer"
      />
      <div class="footer-text">
        This website is a personal portfolio project. The brand, products, and
        services displayed are entirely fictitious and are intended solely to
        demonstrate front-end (HTML, CSS, Vue 3, JavaScript), back-end (Node.js,
        MongoDB), and UX/UI development skills. No commercial use is intended.
      </div>
    </div>
  </footer>
</template>

<script setup>
import logo from "@/assets/images/logo.png";
const scrollToTop = () => {
  window.scrollTo({
    top: 0,
    behavior: "smooth",
  });
};
</script>

<style scoped>
.footer {
  padding: 3.2rem 6.4rem;
  border-top: 1px solid #eee;
}

.footer-text {
  width: 70%;
  line-height: 1.2;
}

img {
  height: 6rem;
  margin-bottom: 2.4rem;
}

/******************************/
/* Below (84*16) 1200px landscape tablets*/
/******************************/
@media (max-width: 75em) {
  .footer {
    padding: 3.2rem 5.6rem;
  }
}

/******************************/
/* Below  976px (tablets)*/
/******************************/
@media (max-width: 61em) {
  .footer-text {
    font-size: 1.6rem;
    width: 80%;
  }
  .footer {
    padding: 3.2rem 3.2rem;
  }
}

/******************************/
/* Below  704px (smaller tablets)*/
/******************************/
@media (max-width: 44em) {
  .footer-text {
    width: 93%;
  }
}

/******************************/
/* Below  544px (smaller tablets) 550/16=34em*/
/******************************/
@media (max-width: 34em) {
  .footer {
    padding: 3.2rem 2.4rem;
  }
}
</style>
