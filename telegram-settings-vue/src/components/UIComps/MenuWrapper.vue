<script setup lang="ts">
import Homey from "../../Homey";
import "../../App.css";
import "./MenuWrapper.css";

defineProps<{
  title: string
  onBack?: () => void
  onAdd?: () => void
  customOnAddText?: string | number
}>();
</script>

<template>
  <div class="topBar hy-nostyle">
    <button
      v-if="onBack"
      class="leftControl hy-nostyle"
      @click="onBack()"
    >
      <i class="fa fa-chevron-left"></i> {{ Homey.__("settings.misc.back") }}
    </button>
    <div v-else></div>
    <div class="title hy-nostyle">
      {{ title }}
    </div>
    <button
      v-if="onAdd"
      class="rightControl hy-nostyle"
      @click="onAdd()"
    >
      <span v-if="customOnAddText">{{ customOnAddText }}</span>
      <i
        v-else
        class="fa fa-plus"
      ></i>
    </button>
    <div v-else></div>
  </div>
  <div class="menuWrapperContent">
    <slot />
  </div>
</template>
