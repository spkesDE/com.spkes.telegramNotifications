<script setup lang="ts">
import {computed, onMounted, ref} from "vue";
import "../App.css";
import Homey from "../Homey";
import {Views} from "../statics/views";
import type {Chat} from "../types/models";
import {BadgeColor} from "../statics/colors";
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

const chatsWithTopics = computed(() => chats.value.filter((chat) => (chat.topics?.length ?? 0) > 0));

onMounted(async () => {
  chats.value = await getJsonSetting<Chat[]>("users", []);
  gotData.value = true;
});

async function deleteTopic(chatId: number, topicId: number) {
  gotData.value = false;

  chats.value = chats.value.map((chat) => {
    if (chat.chatId !== chatId) {
      return chat;
    }

    return {
      ...chat,
      topics: (chat.topics ?? []).filter((topic) => topic.topicId !== topicId)
    };
  });

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
    :title="Homey.__('settings.topicsMenu.topicsMenu')"
    :on-back="() => props.changeView(Views.MainMenu)"
  >
    <EmptyWidget v-if="chatsWithTopics.length === 0" />
    <MenuItemGroup
      v-for="chat in chatsWithTopics"
      :key="chat.chatId"
    >
      <p class="itemGroupTitle">
        {{ chat.chatName }}
      </p>
      <MenuItemWrapper
        v-for="topic in chat.topics"
        :key="`${chat.chatId}-${topic.topicId}`"
      >
        <span>
          {{ topic.topicName }}&nbsp;
          <Badge :color="BadgeColor.GRAY">
            <i class="fas fa-fingerprint"></i> {{ topic.topicId }}
          </Badge>
        </span>
        <button
          class="removeButton hy-nostyle"
          @click="deleteTopic(chat.chatId, topic.topicId)"
        >
          <i class="fas fa-trash-alt"></i>
        </button>
      </MenuItemWrapper>
    </MenuItemGroup>
  </MenuWrapper>
</template>
