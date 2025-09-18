<!-- src/components/AuthFormBase.vue -->
<template>
  <div class="signup-background">
    <GoBack />
    <div class="form-container">
      <div class="form-col">
        <LoginNav />
        <div class="form-box login-form">
          <div class="form-title">
            <span>{{ title }}</span>
          </div>

          <form @submit.prevent="onSubmit" class="form-inputs">
            <slot />
            <div class="input-box">
              <button
                type="submit"
                class="btn btn--full margin-right-sm button-text"
              >
                <span>{{ submitText }}</span>
                <span>&#10132;</span>
              </button>
            </div>
          </form>

          <div v-if="showSocial" class="social-login">
            <div
              v-for="(social, index) in socialLogins"
              :key="index"
              class="social-login-box"
              @click="differentLogin"
            >
              <ion-icon :name="social.icon" class="sociallogin-icon"></ion-icon>
            </div>
          </div>

          <FormError v-if="visualError" :error-type="visualError" />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import GoBack from "@/components/GoBack.vue";
import LoginNav from "@/components/LoginNav.vue";
import FormError from "@/components/FormError.vue";

const props = defineProps({
  title: String,
  submitText: String,
  showSocial: Boolean,
  visualError: String,
  onSubmit: Function,
  emailWarning: Function,
  differentLogin: Function,
});

const socialLogins = [{ icon: "logo-google" }, { icon: "logo-facebook" }];
</script>

<style scoped>
/*------- Form styles----- */
.signup-background {
  background: url("../assets/images/signlogin.webp");
  background-size: cover;
  width: 100vw;
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: flex-end;
  padding: 0 12rem;
}
.form-container {
  width: 450px;
  height: 80vh; /*600px*/
  display: flex;
  border: 3px solid rgba(255, 255, 255, 0.3);
  border-radius: 30px;
  backdrop-filter: blur(20px);
  overflow: hidden;
}

.form-col {
  position: relative;
  width: 100%;
}

.btn-box {
  display: flex;
  justify-content: center;
  gap: 1rem;
  margin-top: 30px;
}

.form-box {
  position: absolute;
  transform: translateX(-50%);
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
  padding: 0 30px;
  transition: 0.3s;
}

.form-title {
  margin: 4rem;
  color: #fff;
  font-size: 28px;
  font-weight: 600;
}

.login-form {
  left: 50%;
}

.form-inputs {
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 2.4rem;
  margin-bottom: 1.6rem;
}

.input-box {
  position: relative;
  width: 100%;
}

/*---Submit button----*/

.btn {
  padding: 1.6rem 3.2rem;
  width: 100%;
}

.btn--full {
  background-color: var(--dark-pink);
  color: #fff;
}

.btn--full:visited,
.btn--full:link {
  background-color: var(--dark-pink);
  color: #fff;
}

.btn--full:hover,
.btn--full:active {
  background-color: var(--darkest-pink);
}

.button-text {
  display: flex;
  gap: 0.8rem;
  align-items: center;
  justify-content: center;
}

/* ----- Social Login------ */
.social-login {
  display: flex;
  gap: 20px;
  margin-top: 20px;
}

.social-login-box {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 40px;
  width: 40px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 50%;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.2);
  color: #fff;
  cursor: pointer;
  transition: 0.2s;
}

.social-login-icon {
  width: 24px;
}
.social-login-box:hover {
  transform: scale(0.9);
  color: #555;
}

/******************************/
/* Below (90*16) 1440px smaller desktops*/
/******************************/
@media (max-width: 90em) {
  .signup-background {
    padding: 0 6.4rem;
  }
}

/******************************/
/* Below (84*16) 1200px landscape tablets*/
/******************************/
@media (max-width: 75em) {
  .signup-background {
    padding: 0 5.6rem;
  }
}
/******************************/
/* Below  976px (tablets)*/
/******************************/
@media (max-width: 61em) {
  .signup-background {
    padding: 0 3.2rem;
  }
}

/******************************/
/* Below  704px (smaller tablets)*/
/******************************/
@media (max-width: 44em) {
  .signup-background {
    justify-content: center;
  }
}
/******************************/
/* Below  544px (smaller tablets) 550/16=34em*/
/******************************/
@media (max-width: 34em) {
  .signup-background {
    padding: 0 2.4rem;
  }
}
</style>
