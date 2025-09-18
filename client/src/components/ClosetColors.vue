<template>
  <div class="form-group">
    <label class="label" for="colors">Add Colors:</label>
    <div class="color-input-wrapper">
      <input
        class="color-input full-width-input"
        type="text"
        id="colors"
        v-model="newColor"
        placeholder="Enter a color"
        @keydown.enter.prevent="addColor"
      />
      <button
        class="add-color-btn"
        type="button"
        @click="addColor"
        :disabled="!newColor"
      >
        Add Color
      </button>
    </div>
    <ul class="color-list">
      <li v-for="(color, index) in modelValue" :key="index">
        {{ color }}
        <button type="button" @click="removeColor(index)">Remove</button>
      </li>
    </ul>
  </div>
</template>

<script setup>
import { ref, watch } from "vue";

const props = defineProps({
  modelValue: {
    type: Array,
    required: true,
  },
});

const emit = defineEmits(["update:modelValue"]);
const newColor = ref("");

// Add a new color
const addColor = () => {
  const trimmed = newColor.value.trim().toLowerCase();
  if (trimmed && !props.modelValue.includes(trimmed)) {
    emit("update:modelValue", [...props.modelValue, trimmed]);
    newColor.value = "";
  }
};

// Remove a color
const removeColor = (index) => {
  const updatedColors = [...props.modelValue];
  updatedColors.splice(index, 1);
  emit("update:modelValue", updatedColors);
};
</script>

<style scoped>
.form-group {
  margin-bottom: 2.4rem;
}

.color-input-wrapper {
  display: flex;
  gap: 1.2rem;
}

.color-input.full-width-input {
  flex: 1;
  padding: 1.2rem;
  font-size: 1.8rem;
  font-family: inherit;
  color: inherit;
  border: none;
  border-radius: 9px;
  background-color: #fff;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
}

.add-color-btn {
  padding: 0.4rem 2.4rem;
  background-color: var(--color-tertiary);
  color: #fff;
  border: none;
  font-weight: 600;
  width: 24%;
  border-radius: 8px;
  font-size: 15px;
  cursor: pointer;
  transition: all 0.3s;
}

.add-color-btn:hover,
.add-color-btn:active {
  background-color: var(--darkest-pink);
}

.color-list {
  margin-top: 1.2rem;
  list-style: none;
  padding: 0;
}

.color-list li {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: #f8f9fa;
  padding: 0.6rem 1.2rem;
  border-radius: 6px;
  margin-bottom: 0.6rem;
  font-size: 1.4rem;
}

.color-list button {
  background: none;
  border: none;
  color: #d6336c;
  font-weight: bold;
  cursor: pointer;
}

.label {
  display: block;
  font-size: 1.6rem;
  font-weight: 500;
  margin-bottom: 1.2rem;
}

/******************************/
/* Below  704px (smaller tablets)*/
/******************************/
@media (max-width: 44em) {
  .add-color-btn {
    width: 32%;
  }
}

/******************************/
/* Below  544px (smaller tablets) 550/16=34em*/
/******************************/
@media (max-width: 34em) {
  .color-input-wrapper {
    flex-direction: column;
  }
  .add-color-btn {
    width: 100%;
  }
}
</style>
