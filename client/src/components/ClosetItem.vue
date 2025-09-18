<template>
  <div class="grid-item">
    <img
      :src="imageSrc"
      :key="imageSrc"
      alt="Closet Item"
      class="closet-image"
      crossorigin="anonymous"
    />

    <div class="description-container">
      <h3 class="clothing-name">{{ closet.title }}</h3>
      <div class="info-container">
        <div class="seasons">
          <p class="info-title">Seasons:</p>
          <ul class="all-seasons-list">
            <li v-for="season in allSeasons" :key="season">
              <label>
                <input
                  type="checkbox"
                  :checked="lowerCategories.includes(season.toLowerCase())"
                  disabled
                />
                {{ season }}
              </label>
            </li>
          </ul>
        </div>
        <p class="info-title">Colors:</p>
        <span v-if="closet.colors.length">{{ closet.colors.join(", ") }}</span>
        <span v-else>No colors added</span>
      </div>
    </div>

    <div class="button-container">
      <button
        class="edit-btn"
        @click="$emit('edit', closet)"
        aria-label="Edit clothing item"
      >
        <ion-icon name="pencil-outline"></ion-icon>
      </button>
      <button
        class="delete-btn"
        @click="$emit('delete', closet)"
        aria-label="Delete clothing item"
      >
        <ion-icon name="trash-outline"></ion-icon>
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, onUnmounted, computed } from "vue";
import api from "@/api";

const props = defineProps({
  closet: {
    type: Object,
    required: true,
  },
});
const lowerCategories = computed(() =>
  props.closet.categories.map((c) => c.toLowerCase())
);

const emit = defineEmits(["edit", "delete"]);

const imageSrc = ref("");
let currentObjectUrl = null;
const allSeasons = ["Spring", "Summer", "Autumn", "Winter"];

// Function to securely fetch the image blob
const getSecureImageUrl = async (photoPath) => {
  if (!photoPath) return "";

  const filename = photoPath.split(/[/\\]/).pop();

  try {
    const response = await api.get(
      `/closets/image/${filename}?v=${Date.now()}`,
      {
        responseType: "blob",
      }
    );

    if (currentObjectUrl) {
      URL.revokeObjectURL(currentObjectUrl);
    }

    currentObjectUrl = URL.createObjectURL(response.data);
    return currentObjectUrl;
  } catch (err) {
    console.error("Failed to fetch image:", err);
    return "";
  }
};

// Watch for changes to closet.photo
watch(
  () => props.closet.photo,
  async (newPhoto) => {
    imageSrc.value = await getSecureImageUrl(newPhoto);
  },
  { immediate: true } // also run once when mounted
);

onUnmounted(() => {
  if (currentObjectUrl) {
    URL.revokeObjectURL(currentObjectUrl);
  }
});
</script>

<style scoped>
.grid-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  border-radius: 8px;
  padding: 1rem;
  gap: 1.5rem;
  box-shadow: 0 2.4rem 4.8rem rgba(0, 0, 0, 0.075);
  transition: all 0.4s;
  position: relative;
  height: 48rem;
}

.grid-item img.closet-image {
  width: 100%;
  height: 220px;
  object-fit: cover;
  border-radius: 4px;
}

.grid-item:hover {
  transform: translateY(-1.2rem);
  box-shadow: 0 3.2rem 6.4rem rgba(0, 0, 0, 0.06);
}

.button-container {
  display: flex;
  gap: 0.4rem;
  margin-top: auto;
  position: absolute;
  top: 3%;
  right: 4%;
}

.edit-btn,
.delete-btn {
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-weight: 500;
  backdrop-filter: blur(10px);
  color: #333;
  background-color: rgba(255, 255, 255, 0.598);
}

.edit-btn:hover {
  background-color: #333;
  color: white;
}

.delete-btn:hover {
  background-color: var(--darkest-pink);
  color: white;
}

.clothing-name {
  text-align: center;
}

.all-seasons-list {
  list-style: none;
  display: grid;
  grid-template-columns: 1fr 1fr;
  column-gap: 3.2rem;
  row-gap: 0.8rem;
}

.description-container {
  width: 100%;
}

.info-container {
  position: absolute;
  bottom: 8%;
}
.info-title {
  margin-bottom: 1.2rem;
}

.seasons {
  margin-bottom: 3.2rem;
}

/******************************/
/* Below  976px (tablets)*/
/******************************/
@media (max-width: 61em) {
  .edit-btn,
  .delete-btn {
    font-size: 2rem;
    color: #444;
  }
}
</style>
