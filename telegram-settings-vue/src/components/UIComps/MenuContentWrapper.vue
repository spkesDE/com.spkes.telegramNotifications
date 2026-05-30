<script setup lang="ts">
import "../../App.css";
import "./MenuContentWrapper.css";

defineProps<{
  className?: string
}>();
</script>

<template>
  <div :class="`menuContentWrapper ${className ?? ''}`">
    <slot />
  </div>
</template>
