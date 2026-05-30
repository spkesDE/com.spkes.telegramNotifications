<script setup lang="ts">
import "../../App.css";
import "./EmptyWidget.css";
import Homey from "../../Homey";

defineProps<{
  happy?: boolean
}>();
</script>

<template>
  <div class="emptyWidget">
    {{ Homey.__("settings.misc.empty") }}!
    <i
      v-if="happy"
      class="fas fa-smile-beam"
    ></i>
    <i
      v-else
      class="fas fa-sad-tear"
    ></i>
  </div>
</template>
