<template>
  <div class="error-page">
    <h1>{{ code }}</h1>
    <p>{{ message }}</p>
    <p v-if="details">{{ details }}</p>
    <router-link to="/" class="home-link">Back to Homepage</router-link>
  </div>
</template>

<script setup>
defineProps({
  code: {
    type: String,
    required: true,
  },
  message: {
    type: String,
    required: true,
  },
  details: {
    type: String,
    default: "",
  },
});
</script>

<style scoped>
.error-page {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  height: 100vh;
  background: linear-gradient(to bottom, white 68%, rgb(230, 73, 128));
  text-align: center;
  font-family: Arial, sans-serif;
  color: #333;
}

h1 {
  font-size: 8rem;
  margin: 0;
}

p {
  font-size: 1.5rem;
  margin: 10px 0;
}

.home-link {
  margin-top: 20px;
  padding: 10px 20px;
  font-size: 1.2rem;
  color: white;
  background-color: var(--darkest-pink);
  border: none;
  border-radius: 5px;
  text-decoration: none;
  transition: background-color 0.3s ease;
}

.home-link:hover {
  background-color: rgb(200, 60, 110);
}

/******************************/
/* Below  544px (smaller tablets) 550/16=34em*/
/******************************/
@media (max-width: 34em) {
  .home-link {
    font-size: 1.6rem;
  }
  p {
    padding: 0 2.4rem;
  }
}
</style>
