<script setup lang="ts">
import "../../App.css";
import "./LogWidget.css";
import Badge from "../UIComps/Badge.vue";
import Homey from "../../Homey";
import {BadgeColor, BadgeFloat, BadgeSize, BadgeType} from "../../statics/colors";

enum LogType {
  Info,
  Error,
  Debug
}

const props = defineProps<{
  date?: string
  message: string
  type: LogType
  showExport: boolean
}>();

function getLogType() {
  switch (props.type) {
    case LogType.Info:
      return Homey.__("settings.logMenu.info");
    case LogType.Error:
      return Homey.__("settings.logMenu.error");
    case LogType.Debug:
      return Homey.__("settings.logMenu.debug");
    default:
      return "";
  }
}

function getLogTypeColor() {
  switch (props.type) {
    case LogType.Info:
      return BadgeColor.GREEN;
    case LogType.Error:
      return BadgeColor.RED;
    case LogType.Debug:
      return BadgeColor.BLUE;
    default:
      return BadgeColor.GRAY;
  }
}
</script>

<template>
  <div class="logWidget">
    <Badge :color="getLogTypeColor()">
      {{ getLogType() }}
    </Badge>
    <Badge
      v-if="type === LogType.Error && showExport"
      :color="BadgeColor.GRAY"
      :style="{ marginLeft: '.2em' }"
      @click="navigator.clipboard.writeText(message)"
    >
      <i class="fa fa-copy"></i> {{ Homey.__("settings.logMenu.copy") }}
    </Badge>
    <Badge
      v-if="date"
      :size="BadgeSize.SMALL"
      :color="BadgeColor.GRAY"
      :type="BadgeType.PILL"
      :float="BadgeFloat.RIGHT"
    >
      {{ date }}
    </Badge>
    <div class="codeBlock">
      {{ message }}
    </div>
  </div>
</template>
