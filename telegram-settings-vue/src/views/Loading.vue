<script setup lang="ts">
defineProps<{
  fullscreen?: boolean
}>();
</script>

<template>
  <div :class="fullscreen ? 'loading' : ''">
    <i class="fas fa-spinner fa-spin"></i>
    <h1>Loading...</h1>
  </div>
</template>
