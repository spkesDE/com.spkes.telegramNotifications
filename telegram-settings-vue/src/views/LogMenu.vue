<script setup lang="ts">
import {computed, onMounted, reactive} from "vue";
import "../App.css";
import Homey from "../Homey";
import {Views} from "../statics/views";
import type {LogEntry} from "../types/models";
import {getJsonSetting} from "../utils/settings";
import MenuWrapper from "../components/UIComps/MenuWrapper.vue";
import LogWidget from "../components/LogMenu/LogWidget.vue";
import MenuItemWrapper from "../components/UIComps/MenuItemWrapper.vue";
import Switch from "../components/UIComps/Switch.vue";
import MenuItemGroup from "../components/UIComps/MenuItemGroup.vue";
import EmptyWidget from "../components/UIComps/EmptyWidget.vue";

const props = defineProps<{
  changeView: (view: Views) => void
}>();

const state = reactive({
  logs: [] as LogEntry[],
  hideDebug: true,
  hideInfo: true
});

onMounted(async () => {
  state.logs = await getJsonSetting<LogEntry[]>("logs", []);
});

const visibleLogs = computed(() => state.logs.filter((entry) => {
  if (entry.type === 0 && state.hideInfo) return false;
  if (entry.type === 2 && state.hideDebug) return false;
  return true;
}));

async function copyLogs() {
  await navigator.clipboard.writeText(JSON.stringify(state.logs));
}
</script>

<template>
  <MenuWrapper
    title="Logs"
    :on-back="() => props.changeView(Views.MainMenu)"
    custom-on-add-text="Copy"
    :on-add="copyLogs"
  >
    <MenuItemGroup>
      <MenuItemWrapper>
        <h2>{{ Homey.__("settings.logMenu.showInfoLogs") }}</h2>
        <Switch
          :model-value="!state.hideInfo"
          @update:model-value="state.hideInfo = !$event"
        />
      </MenuItemWrapper>
      <MenuItemWrapper>
        <h2>{{ Homey.__("settings.logMenu.showDebugLogs") }}</h2>
        <Switch
          :model-value="!state.hideDebug"
          @update:model-value="state.hideDebug = !$event"
        />
      </MenuItemWrapper>
    </MenuItemGroup>

    <EmptyWidget v-if="state.logs.length === 0" />
    <EmptyWidget
      v-else-if="visibleLogs.length === 0"
      :happy="true"
    />
    <LogWidget
      v-for="(entry, index) in visibleLogs"
      :key="`${entry.date}-${index}`"
      :date="entry.date"
      :type="entry.type"
      :message="entry.message"
      :show-export="true"
    />
  </MenuWrapper>
</template>
