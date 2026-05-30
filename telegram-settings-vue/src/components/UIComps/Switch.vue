<script setup lang="ts">
import "../../App.css";
import "./Switch.css";

defineProps<{
  id?: string
  modelValue?: boolean
  right?: boolean
}>();

const emit = defineEmits<{
  "update:modelValue": [boolean]
}>();
</script>

<template>
  <label :class="`switch ${right === false ? '' : 'right'}`">
    <input
      :id="id"
      class="hy-nostyle"
      type="checkbox"
      :checked="modelValue"
      @change="emit('update:modelValue', ($event.target as HTMLInputElement).checked)"
    />
    <span class="slider round"></span>
  </label>
</template>
