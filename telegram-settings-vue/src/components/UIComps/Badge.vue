<script setup lang="ts">
import "../../App.css";
import "./Badge.css";
import type {CSSProperties} from "vue";
import {BadgeFloat, BadgeSize, BadgeType} from "../../statics/colors";

const props = defineProps<{
  color: string
  size?: BadgeSize
  type?: BadgeType
  float?: BadgeFloat
  style?: CSSProperties
}>();

const emit = defineEmits<{
  click: []
}>();

function getBadgeType() {
  if (!props.type) {
    return "";
  }
  switch (props.type) {
    case BadgeType.PILL:
      return " badge-pill";
    default:
      return "";
  }
}
</script>

<template>
  <span
    :style="style"
    :class="`badge ${color} ${size ?? ''}${float ? ` ${float}` : ''}${getBadgeType()}`"
    @click="emit('click')"
  >
    <slot />
  </span>
</template>
