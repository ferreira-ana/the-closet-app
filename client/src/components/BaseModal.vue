<template>
  <Teleport to="body">
    <Transition name="modal-outer">
      <div v-show="modalActive" class="overlay">
        <Transition name="modal-inner">
          <div
            ref="modalEl"
            v-show="modalActive"
            :class="['modal', { 'modal--with-close': hasCloseButton }]"
          >
            <slot />
            <button
              v-if="hasCloseButton"
              class="modal-button"
              @click="$emit('close-modal')"
            >
              <ion-icon name="close-circle-outline"></ion-icon>
            </button>
          </div>
        </Transition>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup>
import { ref, watch, nextTick, onMounted, onBeforeUnmount } from "vue";

const emit = defineEmits(["close-modal"]);
const props = defineProps({
  modalActive: { type: Boolean, default: false },
  hasCloseButton: { type: Boolean, default: true },
});

const modalEl = ref(null);

function setCenteredTop() {
  if (!modalEl.value) return;
  const h = modalEl.value.offsetHeight || 0;
  // Center in viewport, but never closer than 24px to the top
  const topPx = Math.max(24, (window.innerHeight - h) / 2);
  document.documentElement.style.setProperty(
    "--modal-top",
    `${Math.round(topPx)}px`
  );
}

watch(
  () => props.modalActive,
  (open) => {
    if (open) nextTick(setCenteredTop);
  }
);

function onResize() {
  if (props.modalActive) setCenteredTop();
}
onMounted(() => window.addEventListener("resize", onResize));
onBeforeUnmount(() => window.removeEventListener("resize", onResize));
</script>

<style scoped>
/* The fixed overlay creates the viewport context */
.overlay {
  position: fixed;
  inset: 0;
  background-color: rgba(0, 0, 0, 0.7);
  z-index: 2000;
}

/* Modal positions against the viewport, no scroll math needed */
.modal {
  position: fixed;
  top: var(--modal-top, 24px); /* computed from viewport height */
  left: 50%;
  transform: translateX(-50%); /* no translateY since top is explicit */
  background: #eee;
  padding: 4px;
  border-radius: 9px;
  max-height: calc(100vh - 48px); /* always fully visible */
  overflow: auto;
  -webkit-overflow-scrolling: touch;
}

/* Making sure transitions keep the X-translate (don’t overwrite transform) */
.modal-inner-enter-from {
  transform: translateX(-50%) scale(0.95);
  opacity: 0;
}
.modal-inner-enter-to {
  transform: translateX(-50%) scale(1);
  opacity: 1;
}
.modal-inner-leave-to {
  transform: translateX(-50%) scale(0.95);
  opacity: 0;
}

/*----There are 2 types of modals. the one to edit and add clothing items, and the other 2 are for deleting such items and for deleting accounts ---*/
.modal.modal--with-close {
  width: 50%;
  max-width: calc(100vw - 48px);
}
/* allow children to shrink instead of forcing a wide modal */
.modal,
.form-style {
  min-width: 0;
}

/* ensure inputs can’t exceed container width */
.form-style input,
.form-style select,
.form-style textarea {
  width: 100%;
  max-width: 100%;
  box-sizing: border-box;
}

.form-style img,
.form-style video {
  max-width: 100%;
  height: auto;
}

.modal-button {
  color: #555;
  border: none;
  font-size: 3.2rem;
  position: absolute;
  top: 32px;
  right: 32px;
  background: none;
  cursor: pointer;
  transition: all 0.3s;
}

.modal-button:hover,
.model-button:active {
  top: 30px;
}

.modal-outer-enter-active,
.modal-outer-leave-active {
  transition: opacity 0.3s cubic-bezier(0.52, 0.02, 0.19, 1.02);
}

.modal-outer-enter-from,
.modal-outer-leave-to {
  opacity: 0;
}

.modal-inner-enter-active {
  transition: all 0.3s cubic-bezier(0.52, 0.02, 0.19, 1.02) 0.15s;
}

.modal-inner-leave-active {
  transition: all 0.3s cubic-bezier(0.52, 0.02, 0.19, 1.02);
}

/******************************/
/* Below (90*16) 1440px smaller desktops*/
/******************************/
@media (max-width: 90em) {
  .modal.modal--with-close {
    width: 68%;
  }
}

/******************************/
/* Below  976px (tablets)*/
/******************************/
@media (max-width: 61em) {
  .modal.modal--with-close {
    width: 75%;
  }
}

/******************************/
/* Below  544px (smaller tablets) 550/16=34em*/
/******************************/
@media (max-width: 34em) {
  .form-style {
    padding: 2.4rem 1.2rem; /* tighter on phones */
  }
  .modal.modal--with-close {
    width: auto;
    max-width: calc(100vw - 32px);
  }
}
</style>
