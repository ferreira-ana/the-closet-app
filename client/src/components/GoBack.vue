<template>
  <router-link
    to="/"
    class="go-back"
    aria-label="Go back to homepage"
    title="Go back to homepage"
  >
    <ion-icon
      name="arrow-back-outline"
      class="arrow-back"
      aria-hidden="true"
    ></ion-icon>
  </router-link>
</template>

<style scoped>
.go-back {
  position: absolute;
  display: flex;
  align-items: center;
  justify-content: center;
  height: 64px;
  width: 64px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 50%;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.2);
  color: #fff;
  cursor: pointer;
  transition: 0.2s;
  left: 0;
  top: 0;
  margin-left: 2rem;
  margin-top: 2rem;
}

.arrow-back {
  font-size: 18px;
}
/******************************/
/* Below  976px (tablets)*/
/******************************/
@media (max-width: 61em) {
  .go-back {
    height: 6.4rem;
    width: 6.4rem;
  }
}
</style>
