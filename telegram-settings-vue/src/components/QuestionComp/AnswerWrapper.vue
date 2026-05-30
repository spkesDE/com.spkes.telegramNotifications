<script setup lang="ts">
import "../../App.css";
import "./AnswerWrapper.css";

defineProps<{
  className?: string
}>();
</script>

<template>
  <div :class="`answerWrapper ${className ?? ''}`">
    <slot />
  </div>
</template>
