<template>
  <button
    class="add-closet"
    @click="$emit('click')"
    aria-label="Add a clothing item"
  >
    <span class="add-symbol">+</span>
    <span>Add a Clothing Piece</span>
  </button>
</template>

<script setup>
defineEmits(["click"]);
</script>

<style scoped>
.add-closet {
  display: flex;
  gap: 0.8rem;
  cursor: pointer;
  padding: 1.2rem 2.4rem;
  border-radius: 9px;
  background-color: var(--dark-pink);
  transition: all 0.4s;
  color: #fff;
  border: none;
  box-shadow: 0 3.2rem 6.4rem rgba(0, 0, 0, 0.25);
}

.add-closet:hover {
  transform: translateY(-0.8rem);
  box-shadow: 0 3.2rem 6.4rem rgba(0, 0, 0, 0.08);
}
</style>
