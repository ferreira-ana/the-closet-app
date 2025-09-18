<template>
  <AuthFormBase
    title="Log In"
    submitText="Log In"
    :visualError="visualError"
    :onSubmit="submitForm"
    :differentLogin="differentLogin"
    :showSocial="true"
  >
    <div class="input-box">
      <input
        v-model="email"
        aria-label="Email address"
        type="email"
        class="input-auth"
        placeholder="E-mail"
        required
      />
      <ion-icon name="person-outline" class="icon"></ion-icon>
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
        role="button"
        :aria-label="showPassword ? 'Hide password' : 'Show password'"
      ></ion-icon>
    </div>
    <div class="forgot-pass-wrp">
      <button type="button" class="forgot-pass" @click="forgotWarning">
        Forgot Password?
      </button>
    </div>
  </AuthFormBase>
</template>

<script setup>
import { ref, watch } from "vue";
import { useRouter } from "vue-router";
import { useAuthStore } from "@/stores/auth";
import AuthFormBase from "@/components/AuthFormBase.vue";

const router = useRouter();

const email = ref("");
const password = ref("");
const showPassword = ref(false);
const visualError = ref("");

watch([email, password], () => {
  visualError.value = "";
});

const toggleShowPassword = () => (showPassword.value = !showPassword.value);

const isEmailValid = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email || "");

const differentLogin = () => {
  visualError.value = "inDevelopment";
};

const forgotWarning = () => {
  visualError.value = "forgotinDevelopment";
};

const submitForm = async () => {
  if (!isEmailValid(email.value)) {
    visualError.value = "wrongFormat";
    return;
  }

  try {
    const authStore = useAuthStore();
    const result = await authStore.login(email.value, password.value);
    if (result.success) router.push({ name: "closets" });
  } catch (error) {
    const msg =
      (error &&
        error.response &&
        error.response.data &&
        error.response.data.message) ||
      "";
    if (msg.includes("Incorrect email or password")) {
      visualError.value = "wrongCredentials";
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

/*---Forgot password---*/
.forgot-pass-wrp {
  display: flex;
  justify-content: flex-end;
  margin-bottom: 4.8px;
  margin-right: 0.4rem;
  width: 100%;
}

.forgot-pass {
  color: #fff;
  background: none;
  border: none;
  cursor: pointer;
  font-size: 14px;
}
.forgot-pass:hover {
  text-decoration: underline;
}
</style>
