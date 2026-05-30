<script setup lang="ts">
import {onMounted, ref} from "vue";
import MainMenu from "./views/MainMenu.vue";
import SettingsMenu from "./views/SettingsMenu.vue";
import Loading from "./views/Loading.vue";
import QuestionMainMenu from "./views/QuestionMainMenu.vue";
import ChatMenu from "./views/ChatMenu.vue";
import TopicsMenu from "./views/TopicsMenu.vue";
import LogMenu from "./views/LogMenu.vue";
import DebugMenu from "./views/DebugMenu.vue";
import AboutMenu from "./views/AboutMenu.vue";
import {Views} from "./statics/views";
import "./App.css";

const currentView = ref(Views.Loading);
const homeyAvailable = ref(false);

function changeView(view: Views) {
  currentView.value = view;
}

function handleHomey() {
  if (!homeyAvailable.value) {
    return;
  }
  currentView.value = Views.MainMenu;
}

onMounted(() => {
  const interval = window.setInterval(() => {
    if ((window.Homey && window.HomeyReady) || import.meta.env.DEV) {
      homeyAvailable.value = true;
      handleHomey();
      window.clearInterval(interval);
    }
  }, 100);
});
</script>

<template>
  <SettingsMenu
    v-if="currentView === Views.Settings"
    :change-view="changeView"
  />
  <QuestionMainMenu
    v-else-if="currentView === Views.Questions"
    :change-view="changeView"
  />
  <ChatMenu
    v-else-if="currentView === Views.Users"
    :change-view="changeView"
  />
  <TopicsMenu
    v-else-if="currentView === Views.Topics"
    :change-view="changeView"
  />
  <LogMenu
    v-else-if="currentView === Views.Logs"
    :change-view="changeView"
  />
  <DebugMenu
    v-else-if="currentView === Views.Debug"
    :change-view="changeView"
  />
  <AboutMenu
    v-else-if="currentView === Views.About"
    :change-view="changeView"
  />
  <MainMenu
    v-else-if="currentView === Views.MainMenu"
    :change-view="changeView"
  />
  <Loading
    v-else
    :fullscreen="true"
  />
</template>
