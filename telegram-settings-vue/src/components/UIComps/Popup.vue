<script setup lang="ts">
import "../../App.css";
import "./Popup.css";

defineProps<{
  title: string
  show: boolean
  icon?: string
  className?: string
}>();

const emit = defineEmits<{
  close: []
}>();
</script>

<template>
  <div
    class="popupOverlay"
    :style="{ visibility: show ? 'visible' : 'hidden', opacity: show ? '1' : '0' }"
  >
    <div :class="`popupWindow${className ? ` ${className}` : ''}`">
      <h1>
        <i
          v-if="icon"
          :class="`fas ${icon}`"
        ></i>
        {{ title }}
      </h1>
      <span
        class="popupClose"
        @click="emit('close')"
      >
        &times;
      </span>
      <hr />
      <div class="popupContent">
        <slot />
      </div>
    </div>
  </div>
</template>
