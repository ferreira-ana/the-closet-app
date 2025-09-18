<template>
  <div class="page-wrapper">
    <Navbar />
    <div class="container-settings">
      <h2>Settings</h2>
      <div class="content-update">
        More setting features are being developed.
      </div>
      <p class="delete-text">
        You can delete your account here and all the data it contains:
      </p>

      <button class="delete-account" @click="openDeleteModal">
        Delete Account
      </button>
    </div>

    <BaseModal
      :hasCloseButton="false"
      :modal-active="showDeleteAccountModal"
      @close-modal="closeDeleteModal"
    >
      <div class="form-style">
        <div v-if="showError">
          <h3>❌ Error deleting account. Please contact the admin.</h3>
        </div>
        <div v-else-if="deleting"><h3>Deleting account...</h3></div>
        <div v-else>
          <h3 class="double-check">
            Are you sure you want to delete your account?
          </h3>
          <p class="warning-text">
            All your data and pictures will be permanently erased.
          </p>
          <div class="button-group">
            <button class="confirm" @click="handleAccountDelete">Delete</button>
            <button class="cancel" @click="closeDeleteModal">Cancel</button>
          </div>
        </div>
      </div>
    </BaseModal>
    <Footer />
  </div>
</template>

<script setup>
import { ref } from "vue";
import { useAuthStore } from "@/stores/auth";
import Navbar from "@/components/Navbar.vue";
import Footer from "@/components/Footer.vue";
import BaseModal from "@/components/BaseModal.vue";
import { useRouter } from "vue-router";

const router = useRouter();
const authStore = useAuthStore();

const showError = ref(false);
const deleting = ref(false);
const showDeleteAccountModal = ref(false);

const openDeleteModal = () => {
  const scrollTop = window.scrollY;
  document.documentElement.style.setProperty(
    "--modal-top",
    `${scrollTop + 100}px`
  );
  showDeleteAccountModal.value = true;
};

const closeDeleteModal = () => {
  showDeleteAccountModal.value = false;
};

const handleAccountDelete = async () => {
  try {
    deleting.value = true;
    await authStore.deleteAccount();
    setTimeout(() => {
      router.push("/"); // Redirect to homepage after 3 seconds
    }, 3000);
  } catch (error) {
    showError.value = true;
  } finally {
    closeDeleteModal();
    deleting.value = false;
  }
};
</script>

<style scoped>
.container-settings {
  margin: 9.2rem 6.4rem;
}
.page-wrapper {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}

.container-settings {
  flex: 1;
}
.content-update {
  margin-top: 8rem;
  margin-bottom: 4rem;
}
.delete-text {
  margin-bottom: 2.4rem;
}

.delete-account {
  border-radius: 8px;
  cursor: pointer;
  padding: 1.2rem 2.4rem;
  border-radius: 9px;
  background-color: var(--dark-pink);
  transition: all 0.4s;
  color: #fff;
  border: none;
  box-shadow: 0 3.2rem 6.4rem rgba(0, 0, 0, 0.25);
}

.delete-account:hover {
  transform: translateY(-0.8rem);
  box-shadow: 0 3.2rem 6.4rem rgba(0, 0, 0, 0.08);
}

/*----Modal----*/

.form-style {
  padding: 4.8rem 9.6rem;
  display: flex;
  flex-direction: column;
  gap: 1.2rem;
}

.double-check {
  margin-bottom: 1.2rem;
}

.warning-text {
  margin-bottom: 2.4rem;
}

/*--------Modal Buttons-------*/

.button-group {
  display: flex;
  gap: 2.4rem;
  justify-content: center;
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
  width: 23%;
  font-weight: 600;
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

/******************************/
/* Below (84*16) 1200px landscape tablets*/
/******************************/

@media (max-width: 75em) {
  .container-settings {
    margin: 8rem 5.6rem;
  }
  .form-style {
    padding: 4.8rem 5.6rem;
  }
}
/******************************/
/* Below  976px (tablets)*/
/******************************/
@media (max-width: 61em) {
  .container-settings {
    margin: 8rem 3.2rem;
  }
  .form-style {
    padding: 4.8rem 3.2rem;
    align-items: center;
  }
}

/******************************/
/* Below  704px (smaller tablets)*/
/******************************/
@media (max-width: 44em) {
  .form-style {
    padding: 4.8rem 3.2em;
  }
}
/******************************/
/* Below  544px (smaller tablets) 550/16=34em*/
/******************************/
@media (max-width: 34em) {
  .container-settings {
    margin: 8rem 2.4rem;
  }
}
</style>
