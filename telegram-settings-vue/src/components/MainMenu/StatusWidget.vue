<script setup lang="ts">
import {computed, onMounted, reactive} from "vue";
import "../../App.css";
import "./StatusWidget.css";
import Loading from "../../views/Loading.vue";
import Homey from "../../Homey";
import iconUrl from "../../assets/icon.svg";

type LogEntry = {
  type: number
};

const state = reactive({
  running: undefined as boolean | undefined,
  users: "0",
  questions: "0",
  logSize: "0",
  errors: "0",
  privacyCommand: false,
  gotData: import.meta.env.DEV
});

const statusLabel = computed(() => {
  if (import.meta.env.DEV) {
    return "DEVELOPMENT";
  }
  if (state.running === undefined) {
    return Homey.__("settings.status.state.unknown");
  }
  return state.running
    ? Homey.__("settings.status.state.on")
    : Homey.__("settings.status.state.off");
});

const statusClass = computed(() => {
  if (import.meta.env.DEV) {
    return "badge orange";
  }
  if (state.running === undefined) {
    return "badge gray";
  }
  return state.running ? "badge green" : "badge red";
});

onMounted(async () => {
  const logs = JSON.parse((await Homey.get<string>("logs")) ?? "[]") as LogEntry[];
  state.running = await Homey.get<boolean>("bot-running");
  state.users = String((JSON.parse((await Homey.get<string>("users")) ?? "[]") as unknown[]).length ?? 0);
  state.questions = String((JSON.parse((await Homey.get<string>("questions")) ?? "[]") as unknown[]).length ?? 0);
  state.logSize = String(logs.length ?? 0);
  state.errors = String(logs.filter((entry) => entry.type === 1).length ?? 0);
  state.privacyCommand = (await Homey.get<boolean>("privacyCommand")) ?? false;
  state.gotData = true;
});
</script>

<template>
  <div
    v-if="state.gotData"
  >
    <div class="statusWidget">
      <div class="title">
        Status
      </div>
      <hr />
      <div class="data">
        <div class="data">
          <div class="col">
            <p>{{ Homey.__("settings.status.bot") }}: <span :class="statusClass">{{ statusLabel }}</span></p>
            <p>{{ Homey.__("settings.status.chats") }}: {{ state.users }}</p>
            <p>{{ Homey.__("settings.status.questions") }}: {{ state.questions }}</p>
          </div>
          <div class="col">
            <p>{{ Homey.__("settings.status.logSize", {value: state.logSize}) }}</p>
            <p>{{ Homey.__("settings.status.errors") }}: {{ state.errors }}</p>
            <p></p>
          </div>
        </div>
        <img
          :src="iconUrl"
          height="60"
          width="60"
          class="logo telegramColorFilter"
          alt="Telegram Logo"
        />
      </div>
    </div>
    <div
      v-if="!state.privacyCommand"
      class="warningWidget"
    >
      <i class="fas fa-exclamation-triangle"></i> {{ Homey.__('settings.botSettings.privacyCommandWarning') }}
    </div>
  </div>
  <div
    v-else
    class="statusWidget"
  >
    <Loading />
  </div>
</template>
