<template>
  <div class="form-group">
    <p class="season-label">Select Categories:</p>
    <div class="categories-wrapper">
      <label class="season-label">
        <span>All Seasons</span>
        <input
          type="checkbox"
          value="all"
          :checked="isAllSelected"
          @change="handleAllSeasons"
          aria-label="Select all seasons"
        />
      </label>

      <label
        class="season-label"
        v-for="season in seasons"
        :key="season.value"
        :class="{ 'margin-0': season.value === 'autumn' }"
      >
        <span>{{ season.label }}</span>
        <input
          type="checkbox"
          :value="season.value"
          v-model="modelValue"
          :aria-label="`Select ${season.label}`"
        />
      </label>
    </div>
  </div>
</template>
<script setup>
import { computed, watch } from "vue";

const props = defineProps({
  modelValue: Array,
});

const emit = defineEmits(["update:modelValue"]);

const seasons = [
  { label: "Winter", value: "winter" },
  { label: "Spring", value: "spring" },
  { label: "Summer", value: "summer" },
  { label: "Autumn", value: "autumn" },
];

// Two-way binding
const modelValue = computed({
  get: () => props.modelValue,
  set: (val) => emit("update:modelValue", val),
});

// Compute whether all seasons are selected
const isAllSelected = computed(() =>
  seasons.every((s) => modelValue.value.includes(s.value))
);

// Watch to ensure data remains normalized
watch(modelValue, (val) => {
  // Normalize if all seasons are selected individually
  const all = seasons.map((s) => s.value);
  const isComplete = all.every((s) => val.includes(s));
  if (isComplete && val.length !== all.length) {
    modelValue.value = all;
  }
});

// Toggle all seasons
const handleAllSeasons = (event) => {
  modelValue.value = event.target.checked ? seasons.map((s) => s.value) : [];
};
</script>

<style scoped>
.form-group {
  margin-bottom: 2.4rem;
}

.season-label {
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 1.6rem;
  font-weight: 500;
  margin-bottom: 1.2rem;
}

.categories-wrapper {
  display: grid;
  grid-template-columns: 1fr 1fr;
  column-gap: 9.6rem;
  background-color: #fff;
  padding: 1.2rem;
  font-size: 1.8rem;
  font-family: inherit;
  color: inherit;
  border: none;
  border-radius: 9px;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
}

.margin-0 {
  margin-bottom: 0px !important;
}

/******************************/
/* Below  544px (smaller tablets) 550/16=34em*/
/******************************/
@media (max-width: 34em) {
  .categories-wrapper {
    column-gap: 5.6rem;
  }
}
</style>
