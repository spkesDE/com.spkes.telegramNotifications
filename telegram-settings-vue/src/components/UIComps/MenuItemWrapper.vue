<script setup lang="ts">
import "../../App.css";
import "./MenuItemWrapper.css";

defineProps<{
  className?: string
}>();
</script>

<template>
  <div :class="`menuItemWrapper ${className ?? ''}`">
    <slot />
  </div>
</template>
