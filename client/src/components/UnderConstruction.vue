<template>
  <div class="content-container">
    <h2>{{ title }}</h2>
    <p class="content-update">
      This page is being updated! Please come back soon.
    </p>
  </div>
</template>

<script setup>
defineProps({
  title: {
    type: String,
    required: true,
  },
});
</script>

<style scoped>
.content-container {
  margin: 9.2rem 6.4rem;
}

.content-update {
  margin-top: 8rem;
}

/******************************/
/* Below (84*16) 1200px landscape tablets*/
/******************************/
@media (max-width: 75em) {
  .content-container {
    margin: 8rem 5.6rem;
  }
}
/******************************/
/* Below  976px (tablets)*/
/******************************/
@media (max-width: 61em) {
  .content-container {
    margin: 8rem 3.2rem;
  }
}
/******************************/
/* Below  544px (smaller tablets) 550/16=34em*/
/******************************/
@media (max-width: 34em) {
  .content-container {
    margin: 8rem 2.4rem;
  }
}
</style>
