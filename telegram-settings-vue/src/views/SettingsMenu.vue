<script setup lang="ts">
import {onMounted, reactive} from "vue";
import "../App.css";
import Homey from "../Homey";
import {Views} from "../statics/views";
import Loading from "./Loading.vue";
import MenuWrapper from "../components/UIComps/MenuWrapper.vue";
import MenuItemGroup from "../components/UIComps/MenuItemGroup.vue";
import MenuItemWrapper from "../components/UIComps/MenuItemWrapper.vue";
import Switch from "../components/UIComps/Switch.vue";

const props = defineProps<{
  changeView: (view: Views) => void
}>();

const state = reactive({
  usePassword: false,
  useBLL: false,
  disableWebPagePreview: false,
  privacyCommand: false,
  password: undefined as string | undefined,
  token: undefined as string | undefined,
  markdown: undefined as string | undefined,
  gotData: import.meta.env.DEV
});

onMounted(async () => {
  state.usePassword = (await Homey.get<boolean>("use-password")) ?? false;
  state.useBLL = (await Homey.get<boolean>("useBll")) ?? false;
  state.disableWebPagePreview = (await Homey.get<boolean>("disableWebPagePreview")) ?? false;
  state.privacyCommand = (await Homey.get<boolean>("privacyCommand")) ?? false;
  state.password = (await Homey.get<string>("password")) ?? undefined;
  state.token = (await Homey.get<string>("bot-token")) ?? undefined;
  state.markdown = (await Homey.get<string>("markdown")) ?? undefined;
  state.gotData = true;
});

async function onSave() {
  state.gotData = false;
  await Homey.set("bot-token", state.token);
  await Homey.set("use-password", state.usePassword ?? false);
  await Homey.set("useBll", state.useBLL ?? false);
  await Homey.set("disableWebPagePreview", state.disableWebPagePreview ?? false);
  if (state.usePassword && state.password) {
    await Homey.set("password", state.password).catch((error) => Homey.alert(String(error)));
  }
  if (state.markdown && state.markdown !== "none") {
    await Homey.set("markdown", state.markdown);
  } else {
    await Homey.unset("markdown");
  }
  await Homey.set("privacyCommand", state.privacyCommand ?? false);
  state.gotData = true;
}
</script>

<template>
  <Loading
    v-if="!state.gotData"
    :fullscreen="true"
  />
  <MenuWrapper
    v-else
    :title="Homey.__('settings.botSettings.botSettings')"
    :on-back="() => props.changeView(Views.MainMenu)"
  >
    <MenuItemGroup>
      <p class="itemGroupTitle">
        {{ Homey.__('settings.botSettings.botSettings') }}
      </p>
      <MenuItemWrapper>
        <label class="menuItem-label hy-nostyle">
          {{ Homey.__('settings.botSettings.botToken') }}
        </label>
        <input
          v-model="state.token"
          class="menuItem-input hy-nostyle"
          type="text"
          :placeholder="Homey.__('settings.botSettings.botTokenPlaceholder')"
        />
      </MenuItemWrapper>
      <MenuItemWrapper>
        <h2>{{ Homey.__('settings.botSettings.usePassword') }}</h2>
        <Switch
          id="usePassword"
          :model-value="state.usePassword"
          @update:model-value="state.usePassword = $event"
        />
      </MenuItemWrapper>
      <template v-if="state.usePassword">
        <MenuItemWrapper>
          <label class="menuItem-label hy-nostyle">
            {{ Homey.__('settings.botSettings.password') }}
          </label>
          <input
            v-model="state.password"
            class="menuItem-input hy-nostyle"
            type="password"
            :placeholder="Homey.__('settings.botSettings.passwordPlaceholder')"
          />
        </MenuItemWrapper>
        <p class="itemGroupHint">
          <i class="fas fa-info-circle"></i>
          {{ Homey.__('settings.botSettings.passwordHint') }}
        </p>
      </template>
    </MenuItemGroup>

    <MenuItemGroup>
      <p class="itemGroupTitle">
        {{ Homey.__('settings.botSettings.miscSettings') }}
      </p>
      <MenuItemWrapper>
        <h2>{{ Homey.__('settings.botSettings.useBll') }}</h2>
        <Switch
          id="useBll"
          :model-value="state.useBLL"
          @update:model-value="state.useBLL = $event"
        />
      </MenuItemWrapper>
      <MenuItemWrapper>
        <h2>{{ Homey.__('settings.botSettings.useMarkdown') }}</h2>
        <select
          v-model="state.markdown"
          class="fancySelect"
          id="useMarkdown"
        >
          <option value="none">
            {{ Homey.__('settings.botSettings.markdown.none') }}
          </option>
          <option value="MarkdownV2">
            {{ Homey.__('settings.botSettings.markdown.markdownV2') }}
          </option>
          <option value="HTML">
            {{ Homey.__('settings.botSettings.markdown.html') }}
          </option>
        </select>
      </MenuItemWrapper>
      <MenuItemWrapper>
        <h2>{{ Homey.__('settings.botSettings.disableWebPagePreview') }}</h2>
        <Switch
          id="disableWebPagePreview"
          :model-value="state.disableWebPagePreview"
          @update:model-value="state.disableWebPagePreview = $event"
        />
      </MenuItemWrapper>
      <MenuItemWrapper>
        <h2>{{ Homey.__('settings.botSettings.privacyCommand') }}</h2>
        <Switch
          id="privacyCommand"
          :model-value="state.privacyCommand"
          @update:model-value="state.privacyCommand = $event"
        />
      </MenuItemWrapper>
      <p class="itemGroupHint">
        <i class="fas fa-info-circle"></i>
        {{ Homey.__('settings.botSettings.privacyCommandHint') }}
      </p>
    </MenuItemGroup>

    <MenuItemGroup>
      <MenuItemWrapper class-name="noPadding">
        <button
          class="menuItem-button-danger hy-nostyle"
          @click="onSave"
        >
          {{ Homey.__('settings.botSettings.saveChanges') }}
        </button>
      </MenuItemWrapper>
    </MenuItemGroup>

    <MenuItemGroup>
      <p class="itemGroupTitle">
        {{ Homey.__('settings.botSettings.setup.title') }}
      </p>
      <MenuItemWrapper class-name="flexCol flexStart fullPadding">
        <ol style="margin-top: 0;">
          <li class="defaultFont">{{ Homey.__('settings.botSettings.setup.step1') }}</li>
          <li class="defaultFont">
            {{ Homey.__('settings.botSettings.setup.step2') }}<br />
            {{ Homey.__('settings.botSettings.setup.step2-1') }}<br />
            {{ Homey.__('settings.botSettings.setup.step2-2') }}
          </li>
          <li class="defaultFont">{{ Homey.__('settings.botSettings.setup.step3') }}</li>
          <li class="defaultFont">
            {{ Homey.__('settings.botSettings.setup.step4') }}<br />
            {{ Homey.__('settings.botSettings.setup.step4-1') }}
          </li>
        </ol>
      </MenuItemWrapper>
    </MenuItemGroup>
  </MenuWrapper>
</template>
