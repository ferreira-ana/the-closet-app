<template>
  <div
    v-if="errorMessage"
    class="error-message"
    role="alert"
    aria-live="polite"
  >
    <span
      ><ion-icon
        name="alert-circle-outline"
        class="icon-warn"
        aria-hidden="true"
      ></ion-icon
    ></span>
    <span> {{ errorMessage }}</span>
  </div>
</template>

<script setup>
import { computed, toRefs } from "vue";

// Define props using defineProps
const props = defineProps({
  errorType: {
    type: String,
    default: "",
  },
});

// Destructure props if you want direct access
const { errorType } = toRefs(props);

// Compute the error message based on errorType
const errorMessage = computed(() => {
  switch (errorType.value) {
    case "smallPassword":
      return "Please insert a password with more than 8 characters";
    case "confirmError":
      return "The inserted passwords do not match.";
    case "sameEmail":
      return "We couldn't create your account. If you already have one, please log in.";
    case "wrongFormat":
      return "Please insert a valid e-mail";
    case "wrongCredentials":
      return "Wrong e-mail or password";
    case "inDevelopment":
      return "Coming soon! Meanwhile please log in using your e-mail";
    case "forgotinDevelopment":
      return "This Feature is in development! Please contact the admin.";
    case "unidentifiedError":
      return "An error occured during the operation";
    default:
      return "";
  }
});
</script>

<style scoped>
.error-message {
  margin-top: 4rem;
  padding: 1.6rem 3.2rem;
  color: brown;
  background: rgba(255, 255, 255, 0.2);
  display: flex;
  align-items: flex-start;
  justify-content: center;
  gap: 1rem;
  line-height: 1.2;
}

.icon-warn {
  font-size: 15px;
}
</style>
