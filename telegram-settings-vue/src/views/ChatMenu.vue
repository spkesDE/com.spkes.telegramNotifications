<script setup lang="ts">
import {computed, onMounted, ref} from "vue";
import "../App.css";
import Homey from "../Homey";
import {Views} from "../statics/views";
import type {Chat} from "../types/models";
import {BadgeColor, BadgeSize, BadgeType} from "../statics/colors";
import {getJsonSetting, setJsonSetting} from "../utils/settings";
import Loading from "./Loading.vue";
import MenuWrapper from "../components/UIComps/MenuWrapper.vue";
import MenuItemGroup from "../components/UIComps/MenuItemGroup.vue";
import MenuItemWrapper from "../components/UIComps/MenuItemWrapper.vue";
import Badge from "../components/UIComps/Badge.vue";
import EmptyWidget from "../components/UIComps/EmptyWidget.vue";

const props = defineProps<{
  changeView: (view: Views) => void
}>();

const chats = ref<Chat[]>([]);
const gotData = ref(import.meta.env.DEV);

const chatTypeLegend = computed(() => [
  {label: Homey.__("settings.userMenu.user"), color: BadgeColor.BLUE},
  {label: Homey.__("settings.userMenu.group"), color: BadgeColor.PURPLE},
  {label: Homey.__("settings.userMenu.supergroup"), color: BadgeColor.ORANGE},
  {label: Homey.__("settings.userMenu.unknown"), color: BadgeColor.GRAY}
]);

onMounted(async () => {
  chats.value = await getJsonSetting<Chat[]>("users", []);
  gotData.value = true;
});

function getTypeColor(chat: Chat) {
  if (chat.type === 0) return BadgeColor.BLUE;
  if (chat.type === 1) return BadgeColor.PURPLE;
  if (chat.type === 2) return BadgeColor.ORANGE;
  return BadgeColor.GRAY;
}

async function deleteChat(chatId: number) {
  gotData.value = false;
  chats.value = chats.value.filter((chat) => chat.chatId !== chatId);
  await setJsonSetting("users", chats.value);
  gotData.value = true;
}
</script>

<template>
  <Loading
    v-if="!gotData"
    :fullscreen="true"
  />
  <MenuWrapper
    v-else
    :title="Homey.__('settings.userMenu.users')"
    :on-back="() => props.changeView(Views.MainMenu)"
  >
    <EmptyWidget v-if="chats.length === 0" />
    <template v-else>
      <MenuItemGroup
        v-for="chat in chats"
        :key="chat.chatId"
      >
        <MenuItemWrapper>
          <span>
            {{ chat.chatName }}&nbsp;
            <Badge
              :color="getTypeColor(chat)"
              :size="BadgeSize.SMALL"
            >
              <i class="fas fa-id-badge"></i> {{ chat.chatId }}
            </Badge>
            <template v-if="chat.topics && chat.topics.length > 0">
              &nbsp;
              <Badge
                :color="BadgeColor.GRAY"
                :type="BadgeType.PILL"
                :size="BadgeSize.SMALL"
              >
                <i class="fas fa-folder"></i> {{ chat.topics.length }}
              </Badge>
            </template>
          </span>
          <button
            class="removeButton hy-nostyle"
            @click="deleteChat(chat.chatId)"
          >
            <i class="fas fa-user-slash"></i>
          </button>
        </MenuItemWrapper>
      </MenuItemGroup>

      <MenuItemGroup>
        <span class="itemGroupHint">
          {{ Homey.__("settings.userMenu.legend") }}:
        </span>
        <template
          v-for="legend in chatTypeLegend"
          :key="legend.label"
        >
          <Badge
            :color="legend.color"
            :size="BadgeSize.SMALL"
          >
            {{ legend.label }}
          </Badge>&nbsp;
        </template>
      </MenuItemGroup>
    </template>
  </MenuWrapper>
</template>
