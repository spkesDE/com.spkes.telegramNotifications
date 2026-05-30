<script setup lang="ts">
import "../../App.css";
import "./MenuItem.css";

defineProps<{
  title: string
  icon: string
  className?: string
  disabled?: boolean
}>();

defineEmits<{
  click: []
}>();
</script>

<template>
  <button
    :class="`menuItem hy-nostyle${disabled ? ' disabled' : ''}`"
    :disabled="disabled"
    @click="$emit('click')"
  >
    <span :class="`iconSpan ${className ?? ''}`">
      <i :class="`menuIcon fas ${icon}`"></i>
    </span>
    {{ title }}
    <span
      v-if="disabled"
      class="menuItemSoon"
    >
      Soon
    </span>
    <i
      v-else
      class="fa fa-chevron-right"
    ></i>
  </button>
</template>
