<template>
  <AuthFormBase
    title="Sign Up"
    submitText="Sign Up"
    :visualError="visualError"
    :onSubmit="submitForm"
    :showSocial="false"
  >
    <div class="input-box">
      <input
        v-model="name"
        type="text"
        class="input-auth"
        placeholder="Name"
        aria-label="Name"
        required
      />
      <ion-icon name="person-outline" class="icon"></ion-icon>
    </div>

    <div class="input-box">
      <input
        v-model="email"
        type="email"
        class="input-auth"
        placeholder="E-mail"
        aria-label="Email address"
        required
      />
      <ion-icon name="mail-outline" class="icon"></ion-icon>
    </div>

    <div class="input-box">
      <input
        v-model="password"
        :type="showPassword ? 'text' : 'password'"
        class="input-auth"
        placeholder="Password"
        aria-label="Password"
        required
      />
      <ion-icon
        v-if="!password"
        name="lock-closed-outline"
        @click="toggleShowPassword"
        class="icon"
      ></ion-icon>
      <ion-icon
        v-else
        :name="showPassword ? 'eye-off-outline' : 'eye-outline'"
        @click="toggleShowPassword"
        class="icon cursor-active"
      ></ion-icon>
    </div>

    <div class="input-box">
      <input
        v-model="passwordConfirm"
        :type="showPassword ? 'text' : 'password'"
        class="input-auth"
        placeholder="Confirm Password"
        aria-label="Confirm password"
        required
      />
      <ion-icon
        v-if="!passwordConfirm"
        name="lock-closed-outline"
        class="icon"
      ></ion-icon>
      <ion-icon
        v-else
        :name="showPassword ? 'eye-off-outline' : 'eye-outline'"
        @click="toggleShowPassword"
        class="icon cursor-active"
      ></ion-icon>
    </div>
  </AuthFormBase>
</template>

<script setup>
import { ref, watch } from "vue";
import { useRouter } from "vue-router";
import { useAuthStore } from "@/stores/auth";
import AuthFormBase from "@/components/AuthFormBase.vue";

const router = useRouter();

const name = ref("");
const email = ref("");
const password = ref("");
const passwordConfirm = ref("");
const showPassword = ref(false);
const visualError = ref("");

watch([email, password], () => {
  visualError.value = "";
});

const toggleShowPassword = () => {
  showPassword.value = !showPassword.value;
};

const isEmailValid = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email || "");

const submitForm = async () => {
  if (!isEmailValid(email.value)) {
    visualError.value = "wrongFormat";
    return;
  }

  try {
    const authStore = useAuthStore();
    const result = await authStore.signup(
      name.value,
      email.value,
      password.value,
      passwordConfirm.value
    );

    if (result.success) {
      router.push({ name: "closets" });
    }
  } catch (error) {
    const msg = error?.response?.data?.message || "";
    if (msg.includes("E11000 duplicate key")) {
      visualError.value = "sameEmail";
    } else if (msg.includes("minimum allowed length")) {
      visualError.value = "smallPassword";
    } else if (
      msg ===
      "User validation failed: passwordConfirm: The Passwords do not match"
    ) {
      visualError.value = "confirmError";
    } else {
      visualError.value = "unidentifiedError";
    }
  }
};
</script>

<style scoped>
/*There is an utility section for auth in base.css */
.input-box {
  position: relative;
  width: 100%;
}

::placeholder {
  color: #ffffff9e;
  font-size: 15px;
}
</style>
