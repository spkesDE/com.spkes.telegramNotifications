<script setup lang="ts">
import {onMounted, reactive} from "vue";
import "../App.css";
import Homey from "../Homey";
import {Views} from "../statics/views";
import {BadgeColor} from "../statics/colors";
import Loading from "./Loading.vue";
import MenuWrapper from "../components/UIComps/MenuWrapper.vue";
import Badge from "../components/UIComps/Badge.vue";
import MenuItemWrapper from "../components/UIComps/MenuItemWrapper.vue";
import MenuItemGroup from "../components/UIComps/MenuItemGroup.vue";
import Popup from "../components/UIComps/Popup.vue";

const props = defineProps<{
  changeView: (view: Views) => void
}>();

enum ResetAction {
  ResetUsers = "RESET_USERS",
  ResetQuestions = "RESET_QUESTIONS",
  ResetLogs = "RESET_LOGS",
  ResetPassword = "RESET_PASSWORD",
  ResetAll = "RESET_ALL"
}

const state = reactive({
  status: "",
  users: "[]",
  questions: "[]",
  logs: "[]",
  gotData: import.meta.env.DEV,
  usePassword: false,
  disableWebPagePreview: false,
  useBLL: false,
  privacyCommand: false,
  password: "",
  token: "",
  markdown: "",
  showResetPopup: false,
  selectedAction: undefined as ResetAction | undefined
});

onMounted(async () => {
  state.logs = (await Homey.get<string>("logs")) ?? "[]";
  state.status = (await Homey.get<boolean>("bot-running"))
    ? Homey.__("settings.status.state.on")
    : Homey.__("settings.status.state.off") ?? Homey.__("settings.status.state.unknown");
  state.users = (await Homey.get<string>("users")) ?? "[]";
  state.questions = (await Homey.get<string>("questions")) ?? "[]";
  state.usePassword = (await Homey.get<boolean>("use-password")) ?? false;
  state.useBLL = (await Homey.get<boolean>("useBll")) ?? false;
  state.privacyCommand = (await Homey.get<boolean>("privacyCommand")) ?? false;
  state.disableWebPagePreview = (await Homey.get<boolean>("disableWebPagePreview")) ?? false;
  state.password = (await Homey.get<string>("password")) ?? "";
  state.token = (await Homey.get<string>("bot-token")) ?? "";
  state.markdown = (await Homey.get<string>("markdown")) ?? "";
  state.gotData = true;
});

function formatJson(value: string) {
  try {
    return JSON.stringify(JSON.parse(value), null, 2);
  } catch {
    return value;
  }
}

function openResetPopup(action: ResetAction) {
  state.selectedAction = action;
  state.showResetPopup = true;
}

async function handleResetAction() {
  if (!state.selectedAction) {
    state.showResetPopup = false;
    return;
  }

  switch (state.selectedAction) {
    case ResetAction.ResetUsers:
      await Homey.set("users", "[]");
      state.users = "[]";
      break;
    case ResetAction.ResetQuestions:
      await Homey.set("questions", "[]");
      state.questions = "[]";
      break;
    case ResetAction.ResetLogs:
      await Homey.set("logs", "[]");
      state.logs = "[]";
      break;
    case ResetAction.ResetPassword:
      await Homey.set("password", false);
      await Homey.set("use-password", "");
      state.password = "";
      state.usePassword = false;
      break;
    case ResetAction.ResetAll:
      await Homey.set("users", "[]");
      await Homey.set("questions", "[]");
      await Homey.set("logs", "[]");
      await Homey.set("password", false);
      await Homey.set("use-password", "");
      await Homey.set("markdown", "none");
      await Homey.set("token", "");
      state.users = "[]";
      state.questions = "[]";
      state.logs = "[]";
      state.password = "";
      state.usePassword = false;
      state.markdown = "none";
      state.token = "";
      break;
  }

  state.showResetPopup = false;
}
</script>

<template>
  <Loading
    v-if="!state.gotData"
    :fullscreen="true"
  />
  <MenuWrapper
    v-else
    :title="Homey.__('settings.debugMenu.debugMenu')"
    :on-back="() => props.changeView(Views.MainMenu)"
  >
    <div class="logWidget">
      <Badge :color="BadgeColor.GRAY">{{ Homey.__("settings.debugMenu.status") }}</Badge>
      <div class="codeBlock">{{ state.status }}</div>
    </div>
    <div class="logWidget">
      <Badge :color="BadgeColor.GRAY">{{ Homey.__("settings.debugMenu.users") }}</Badge>
      <div class="codeBlock">{{ formatJson(state.users) }}</div>
    </div>
    <div class="logWidget">
      <Badge :color="BadgeColor.GRAY">{{ Homey.__("settings.debugMenu.useBll") }}</Badge>
      <div class="codeBlock">{{ String(state.useBLL) }}</div>
    </div>
    <div class="logWidget">
      <Badge :color="BadgeColor.GRAY">{{ Homey.__("settings.botSettings.privacyCommand") }}</Badge>
      <div class="codeBlock">{{ String(state.privacyCommand) }}</div>
    </div>
    <div class="logWidget">
      <Badge :color="BadgeColor.GRAY">{{ Homey.__("settings.debugMenu.disableWebPagePreview") }}</Badge>
      <div class="codeBlock">{{ String(state.disableWebPagePreview) }}</div>
    </div>
    <div class="logWidget">
      <Badge :color="BadgeColor.GRAY">{{ Homey.__("settings.debugMenu.markdown") }}</Badge>
      <div class="codeBlock">{{ state.markdown }}</div>
    </div>
    <div class="logWidget">
      <Badge :color="BadgeColor.GRAY">{{ Homey.__("settings.debugMenu.questions") }}</Badge>
      <div class="codeBlock">{{ formatJson(state.questions) }}</div>
    </div>
    <div class="logWidget">
      <Badge :color="BadgeColor.GRAY">{{ Homey.__("settings.debugMenu.token") }}</Badge>
      <div class="codeBlock">{{ state.token }}</div>
    </div>
    <div class="logWidget">
      <Badge :color="BadgeColor.GRAY">{{ Homey.__("settings.debugMenu.usePassword") }}</Badge>
      <div class="codeBlock">{{ String(state.usePassword) }}</div>
    </div>
    <div class="logWidget">
      <Badge :color="BadgeColor.GRAY">{{ Homey.__("settings.debugMenu.password") }}</Badge>
      <div class="codeBlock">{{ state.password }}</div>
    </div>
    <div class="logWidget">
      <Badge :color="BadgeColor.GRAY">{{ Homey.__("settings.debugMenu.logs") }}</Badge>
      <div class="codeBlock">{{ formatJson(state.logs) }}</div>
    </div>

    <MenuItemGroup>
      <p class="itemGroupTitle">{{ Homey.__("settings.debugMenu.fuckedUpMenu") }}</p>
      <MenuItemWrapper class-name="noPadding">
        <button
          class="menuItem-button-danger hy-nostyle"
          @click="openResetPopup(ResetAction.ResetUsers)"
        >
          {{ Homey.__("settings.debugMenu.resetUsers") }}
        </button>
      </MenuItemWrapper>
      <MenuItemWrapper class-name="noPadding">
        <button
          class="menuItem-button-danger hy-nostyle"
          @click="openResetPopup(ResetAction.ResetQuestions)"
        >
          {{ Homey.__("settings.debugMenu.resetQuestions") }}
        </button>
      </MenuItemWrapper>
      <MenuItemWrapper class-name="noPadding">
        <button
          class="menuItem-button-danger hy-nostyle"
          @click="openResetPopup(ResetAction.ResetLogs)"
        >
          {{ Homey.__("settings.debugMenu.resetLogs") }}
        </button>
      </MenuItemWrapper>
      <MenuItemWrapper class-name="noPadding">
        <button
          class="menuItem-button-danger hy-nostyle"
          @click="openResetPopup(ResetAction.ResetPassword)"
        >
          {{ Homey.__("settings.debugMenu.resetPassword") }}
        </button>
      </MenuItemWrapper>
      <MenuItemWrapper class-name="noPadding">
        <button
          class="menuItem-button-danger hy-nostyle"
          @click="openResetPopup(ResetAction.ResetAll)"
        >
          <i class="fas fa-bomb"></i>&nbsp;
          {{ Homey.__("settings.debugMenu.resetEverything") }}&nbsp;
          <i class="fas fa-bomb"></i>
        </button>
      </MenuItemWrapper>
    </MenuItemGroup>

    <Popup
      title="Warning"
      icon="fa-exclamation-triangle"
      :show="state.showResetPopup"
      @close="state.showResetPopup = false"
    >
      {{ Homey.__("settings.debugMenu.fuckedUpWarning", {action: state.selectedAction ?? ResetAction.ResetAll}) }}
      <br /><br />
      <button
        class="yesButton hy-nostyle"
        @click="handleResetAction"
      >
        {{ Homey.__("settings.misc.yes") }}
      </button>

      <button
        class="noButton hy-nostyle"
        @click="state.showResetPopup = false"
      >
        {{ Homey.__("settings.misc.no") }}
      </button>
    </Popup>
  </MenuWrapper>
</template>
