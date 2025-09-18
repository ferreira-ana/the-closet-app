<template>
  <div class="layout-wrapper">
    <Navbar />
    <main class="container-closet">
      <h2 class="welcome-message">
        Hello, welcome to your closet management page!
      </h2>
      <div class="closet-grid">
        <ClosetItem
          v-for="closet in closets"
          :key="closet._id"
          :closet="closet"
          @edit="handleEdit"
          @delete="handleDelete"
        />
      </div>
      <AddClosetButton @click="handleAdd" />
    </main>

    <BaseModal
      :hasCloseButton="true"
      :modal-active="modalActive"
      @close-modal="toggleModal"
    >
      <form @submit.prevent="submitForm" class="form-style">
        <h2 class="form-title">
          {{ isEditing ? "Edit Clothing Item" : "Add a Clothing Item" }}
        </h2>
        <p class="instructions">
          {{
            isEditing
              ? `When editing please remember to use a descriptive title so you can use it to find your item later. When you
        have an all-year-long piece of clothing please select "All Seasons" in
        order to help you find items for each season later on.`
              : `Please insert a picture of the clothing piece and
        a descriptive title so you can use it to find your item later. When you
        have an all-year-long piece of clothing please select "All Seasons" in
        order to help you find items for each season later on.`
          }}
        </p>

        <!-- Title -->
        <div class="form-group">
          <label for="title">Title:</label>
          <input
            class="full-width-input"
            type="text"
            id="title"
            v-model="formData.title"
            required
            placeholder="Enter title"
          />
        </div>

        <!-- Image Upload -->
        <div class="form-group">
          <label for="photo">Upload Image:</label>
          <input
            class="full-width-input"
            type="file"
            id="photo"
            @change="handleFileUpload"
            accept="image/*"
            :required="!isEditing"
          />
          <div v-if="isEditing && formData.currentPhoto" class="current-photo">
            <p>Current photo will be kept if no new photo is selected</p>
          </div>
        </div>

        <!-- Categories -->
        <SeasonSelector v-model="formData.categories" />

        <!-- Add Colors -->
        <ClosetColors v-model="formData.colors" />

        <!-- Submit Button -->
        <button type="submit" class="submit-btn">
          {{ isEditing ? "Update Closet" : "Add Closet" }}
        </button>
      </form>
    </BaseModal>
    <BaseModal
      :hasCloseButton="false"
      :modal-active="showDeleteConfirm"
      @close-modal="showDeleteConfirm = false"
    >
      <div class="form-style">
        <h3 class="double-check">
          Are you sure you want to delete
          <span class="closet-title">"{{ closetToDelete?.title }}"</span>?
        </h3>
        <div class="button-group">
          <button class="confirm" @click="confirmDelete">Delete</button>
          <button class="cancel" @click="showDeleteConfirm = false">
            Cancel
          </button>
        </div>
      </div>
    </BaseModal>
    <Footer />
  </div>
</template>

<script setup>
import Footer from "../components/Footer.vue";
import Navbar from "../components/Navbar.vue";
import ClosetItem from "../components/ClosetItem.vue";
import AddClosetButton from "../components/AddClosetButton.vue";
import { ref, onMounted } from "vue";
import api from "@/api";
import BaseModal from "@/components/BaseModal.vue";
import SeasonSelector from "@/components/SeasonSelector.vue";
import ClosetColors from "@/components/ClosetColors.vue";

const isEditing = ref(false);
const editingId = ref(null);
const closets = ref([]);
const modalActive = ref(null);
const formData = ref({
  title: "",
  photo: null,
  categories: [],
  colors: [],
});
const newColor = ref(""); // Holds the current color input
const showDeleteConfirm = ref(false);
const closetToDelete = ref(null);

// Fetch closets from the backend when the component mounts
const fetchClosets = async () => {
  try {
    const response = await api.get("/closets");
    closets.value = response.data;
  } catch (error) {
    console.error("Error fetching closets:", error);
  }
};

const resetForm = () => {
  formData.value = {
    title: "",
    photo: null,
    currentPhoto: null,
    categories: [],
    colors: [],
  };
  newColor.value = "";
};

const toggleModal = () => {
  modalActive.value = !modalActive.value;
};

const handleAdd = () => {
  isEditing.value = false;
  editingId.value = null;
  resetForm();
  toggleModal();
};

// Handle image file upload
const handleFileUpload = (event) => {
  const file = event.target.files[0];
  if (file) {
    formData.value.photo = file;
    console.log("File uploaded:", file);
  } else {
    console.error("No file selected");
  }
};

// Handle edit button clicks
const handleEdit = (closet) => {
  isEditing.value = true;
  editingId.value = closet._id;

  // Populate form with existing data
  formData.value = {
    title: closet.title,
    photo: null, // We'll keep the existing photo unless changed
    currentPhoto: closet.photo, // Store the current photo path
    categories: [...closet.categories],
    colors: [...closet.colors],
  };

  toggleModal();
};

const handleDelete = (closet) => {
  closetToDelete.value = closet;
  showDeleteConfirm.value = true;
};

const confirmDelete = async () => {
  try {
    await api.delete(`/closets/${closetToDelete.value._id}`);
    closets.value = closets.value.filter(
      (closet) => closet._id !== closetToDelete.value._id
    );
    console.log("Closet deleted successfully.");
  } catch (error) {
    console.error(
      "Error deleting closet:",
      error.response?.data || error.message
    );
  } finally {
    showDeleteConfirm.value = false;
    closetToDelete.value = null;
  }
};

// Modify submitForm to handle both create and edit
const submitForm = async () => {
  try {
    formData.value.colors = formData.value.colors.filter(
      (color) => color.trim() !== ""
    ); // Remove empty strings
    const dataToSend = new FormData();
    dataToSend.append("title", formData.value.title);
    dataToSend.append("categories", formData.value.categories.join(","));
    if (formData.value.colors === "") {
      formData.value.colors = [];
    }
    dataToSend.append("colors", formData.value.colors.join(","));

    // Only append photo if a new one was selected
    if (formData.value.photo) {
      dataToSend.append("photo", formData.value.photo);
    }
    console.log("dados" + formData.value.colors);
    let response;
    if (isEditing.value) {
      response = await api.patch(`/closets/${editingId.value}`, dataToSend);
    } else {
      response = await api.post("/closets", dataToSend);
    }

    console.log(
      isEditing.value ? "Closet updated:" : "Closet created:",
      response
    );
    await fetchClosets();
    resetForm();
    toggleModal();
    isEditing.value = false;
    editingId.value = null;
  } catch (error) {
    console.error("Error:", error.message);
  }
};

// Fetch closets on component mount
onMounted(fetchClosets);
</script>

<style scoped>
html,
body {
  height: 100%;
  margin: 0;
  padding: 0;
}

.layout-wrapper {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

main.container-closet {
  flex: 1; /* Makes the main content take up available space */
}

.container-closet {
  margin: 9.2rem 6.4rem;
}

.welcome-message {
  margin-bottom: 6rem;
}

.closet-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, 32rem);
  gap: 3.6rem;
  width: 100%;
  margin-bottom: 3.6rem;
  max-width: calc(100vw - 12.8rem);
  margin-left: auto;
  margin-right: auto;
}

/*------- Form ------*/
.form-style {
  padding: 4.8rem 9.6rem;
  display: flex;
  flex-direction: column;
  gap: 1.2rem;
}

.form-title {
  margin-bottom: 1.2rem;
}

.current-photo {
  margin-top: 0.5rem;
  font-size: 0.9em;
  color: #666;
}

.form-style label {
  display: block;
  font-size: 1.6rem;
  font-weight: 500;
  margin-bottom: 1.2rem;
}

.form-style input,
.form-style select,
.form-style textarea {
  padding: 1.2rem;
  font-size: 1.8rem;
  font-family: inherit;
  color: inherit;
  border: none;
  border-radius: 9px;
  background-color: #fff;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
}

.form-style .full-width-input {
  width: 100%;
}

.form-style input::placeholder,
.cta-style textarea::placeholder {
  color: #aaa;
}

.instructions {
  font-size: 1.8rem;
  margin-bottom: 48px;
  line-height: 1.6;
}

.submit-btn,
.confirm,
.cancel {
  padding: 1.2rem 2.4rem;
  border-radius: 8px;
  color: #fff;
  border: none;
  font-size: 15px;
  background-color: var(--darkest-pink);
  cursor: pointer;
}

.submit-btn {
  white-space: nowrap;
  font-weight: 600;
  display: inline-block;
  width: auto;
  align-self: flex-start;
}

.submit-btn:hover,
.confirm:hover {
  background-color: #d6336c;
}

.cancel,
.confirm {
  font-size: 18px;
  width: 12rem;
}

.cancel {
  color: #333;
  background-color: var(--light-gray);
}

.cancel:hover,
.cancel:active {
  background-color: var(--dark-gray);
  color: #fff;
}

.button-group {
  display: flex;
  gap: 2.4rem;
  justify-content: center;
}

.double-check {
  margin-bottom: 2.4rem;
}

.form-group {
  margin-bottom: 2.4rem;
}

/******************************/
/* Below (90*16) 1440px smaller desktops*/
/******************************/
@media (max-width: 90em) {
  .form-style {
    padding: 4.8rem 6.4rem;
  }
}

/******************************/
/* Below (84*16) 1200px landscape tablets*/
/******************************/

@media (max-width: 75em) {
  .container-closet {
    margin: 8rem 5.6rem;
  }
  .form-style {
    padding: 9.6rem 5.6rem;
  }
}

/******************************/
/* Below  976px (tablets)*/
/******************************/
@media (max-width: 61em) {
  .closet-grid {
    position: relative;
  }
  .container-closet {
    margin: 8rem 3.2rem;
  }
  .closet-grid {
    max-width: calc(100vw - 6.6rem);
    grid-template-columns: repeat(auto-fit, 38rem);
  }
  .grid-item {
    height: 56rem;
  }
  .form-style {
    padding: 9.6rem 3.2rem;
  }
}
/******************************/
/* Below  704px (smaller tablets)*/
/******************************/
@media (max-width: 44em) {
  .closet-grid {
    justify-content: center;
  }
  .instructions {
    margin-bottom: 4.8rem;
  }
}

/******************************/
/* Below  544px (smaller tablets) 550/16=34em*/
/******************************/
@media (max-width: 34em) {
  .form-style {
    padding: 8rem 2.4rem;
  }
  .container-closet {
    margin: 8rem 2.4rem;
  }
}
</style>
