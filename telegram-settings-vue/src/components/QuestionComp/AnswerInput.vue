<script setup lang="ts">
import "../../App.css";
import "./AnswerInput.css";

defineProps<{
  className?: string
}>();
</script>

<template>
  <div :class="`answerInput ${className ?? ''}`">
    <slot />
  </div>
</template>
