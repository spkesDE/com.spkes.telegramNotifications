<script setup lang="ts">
import "../App.css";
import Homey from "../Homey";
import {Views} from "../statics/views";
import {BadgeColor, BadgeSize} from "../statics/colors";
import MenuWrapper from "../components/UIComps/MenuWrapper.vue";
import MenuItemGroup from "../components/UIComps/MenuItemGroup.vue";
import MenuContentWrapper from "../components/UIComps/MenuContentWrapper.vue";
import Badge from "../components/UIComps/Badge.vue";
import MenuItem from "../components/UIComps/MenuItem.vue";

defineProps<{
  changeView: (view: Views) => void
}>();

const grammyVersion = import.meta.env.VITE_GRAMMY_VERSION || "unknown";
const betterLogicVersion = import.meta.env.VITE_BETTER_LOGIC_VERSION || "unknown";
const nodeFetchVersion = import.meta.env.VITE_NODE_FETCH_VERSION || "unknown";
const vueVersion = import.meta.env.VITE_VUE_VERSION || "unknown";
</script>

<template>
  <MenuWrapper
    :title="Homey.__('settings.aboutMenu.title')"
    :on-back="() => changeView(Views.MainMenu)"
  >
    <MenuItemGroup>
      <MenuItem
        :title="Homey.__('settings.aboutMenu.joinTelegram')"
        icon="fa-paper-plane"
        class-name="bg-color-blue"
        @click="Homey.popup('https://t.me/homeyCommunity')"
      />
    </MenuItemGroup>

    <MenuItemGroup>
      <MenuContentWrapper>
        <h2>{{ Homey.__("settings.aboutMenu.using") }}</h2>
        <ul>
          <li>Grammy.dev <Badge :color="BadgeColor.ORANGE" :size="BadgeSize.SMALL">{{ grammyVersion }}</Badge></li>
          <li>Better Logic Library <Badge :color="BadgeColor.MAGENTA" :size="BadgeSize.SMALL">{{ betterLogicVersion }}</Badge></li>
          <li>Node-fetch <Badge :color="BadgeColor.BLUE" :size="BadgeSize.SMALL">{{ nodeFetchVersion }}</Badge></li>
          <li>Vue <Badge :color="BadgeColor.CYAN" :size="BadgeSize.SMALL">{{ vueVersion }}</Badge></li>
          <li>TypeScript, because it's better!</li>
        </ul>
      </MenuContentWrapper>
    </MenuItemGroup>

    <MenuItemGroup>
      <MenuContentWrapper>
        <h2>{{ Homey.__("settings.aboutMenu.contributors") }}</h2>
        <ul>
          <li>{{ Homey.__("settings.aboutMenu.translator", {name: "Twan_Veugelers", lang: "GB NL"}) }}</li>
          <li>{{ Homey.__("settings.aboutMenu.translator", {name: "ilpaolino", lang: "IT"}) }}</li>
          <li>{{ Homey.__("settings.aboutMenu.translator", {name: "oleg", lang: "RU"}) }}</li>
          <li>{{ Homey.__("settings.aboutMenu.translator", {name: "ChatGTP-3", lang: "PL ES DK SE NO FR"}) }}</li>
          <li>{{ Homey.__("settings.aboutMenu.dev", {name: "Arie J. Godschalk", app: "Better Logic Library"}) }}</li>
          <li>{{ Homey.__("settings.aboutMenu.contributor", {name: "Enyineer"}) }}</li>
          <li><strong>{{ Homey.__("settings.aboutMenu.community") }}</strong></li>
        </ul>
      </MenuContentWrapper>
    </MenuItemGroup>
  </MenuWrapper>
</template>
