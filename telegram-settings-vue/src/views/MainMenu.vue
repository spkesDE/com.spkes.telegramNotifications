<script setup lang="ts">
import MenuItem from "../components/UIComps/MenuItem.vue";
import MenuItemGroup from "../components/UIComps/MenuItemGroup.vue";
import StatusWidget from "../components/MainMenu/StatusWidget.vue";
import Homey from "../Homey";
import {Views} from "../statics/views";

defineProps<{
  changeView: (view: Views) => void
}>();
</script>

<template>
  <div class="spacer"></div>
  <StatusWidget />
  <MenuItemGroup>
    <MenuItem
      :title="Homey.__('settings.mainMenu.settings')"
      icon="fa-cog"
      class-name="bg-color-orange"
      @click="changeView(Views.Settings)"
    />
    <MenuItem
      :title="Homey.__('settings.mainMenu.questions')"
      icon="fa-question"
      class-name="bg-color-blue"
      @click="changeView(Views.Questions)"
    />
    <MenuItem
      :title="Homey.__('settings.mainMenu.users')"
      icon="fa-users"
      class-name="bg-color-magenta"
      @click="changeView(Views.Users)"
    />
    <MenuItem
      :title="Homey.__('settings.mainMenu.topics')"
      icon="fa-folder"
      class-name="bg-color-green"
      @click="changeView(Views.Topics)"
    />
  </MenuItemGroup>
  <MenuItemGroup>
    <MenuItem
      :title="Homey.__('settings.mainMenu.logs')"
      icon="fa-bars"
      class-name="bg-color-gray"
      @click="changeView(Views.Logs)"
    />
    <MenuItem
      :title="Homey.__('settings.mainMenu.debugMenu')"
      icon="fa-bug"
      class-name="bg-color-red"
      @click="changeView(Views.Debug)"
    />
  </MenuItemGroup>
  <MenuItemGroup>
    <MenuItem
      :title="Homey.__('settings.aboutMenu.joinTelegram')"
      icon="fa-paper-plane"
      class-name="bg-color-blue"
      @click="Homey.popup('https://t.me/homeyCommunity')"
    />
    <MenuItem
      :title="Homey.__('settings.mainMenu.about')"
      icon="fa-address-card"
      class-name="bg-color-magenta"
      @click="changeView(Views.About)"
    />
  </MenuItemGroup>
</template>
