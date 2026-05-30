<script setup lang="ts">
import {onMounted, ref} from "vue";
import "../App.css";
import Homey from "../Homey";
import {Views} from "../statics/views";
import type {QuestionModel} from "../types/models";
import {BadgeColor, BadgeSize, BadgeType} from "../statics/colors";
import {getJsonSetting} from "../utils/settings";
import Loading from "./Loading.vue";
import MenuItemGroup from "../components/UIComps/MenuItemGroup.vue";
import MenuItemWrapper from "../components/UIComps/MenuItemWrapper.vue";
import Badge from "../components/UIComps/Badge.vue";
import EmptyWidget from "../components/UIComps/EmptyWidget.vue";

const props = defineProps<{
  changeView: (view?: Views, targetQuestion?: QuestionModel) => void
}>();

const questions = ref<QuestionModel[]>([]);
const gotData = ref(import.meta.env.DEV);

onMounted(async () => {
  questions.value = await getJsonSetting<QuestionModel[]>("questions", []);
  gotData.value = true;
});
</script>

<template>
  <Loading
    v-if="!gotData"
    :fullscreen="true"
  />
  <EmptyWidget
    v-else-if="questions.length === 0"
  />
  <template v-else>
    <MenuItemGroup
      v-for="question in questions"
      :key="question.UUID"
    >
      <MenuItemWrapper @click="props.changeView(Views.QuestionsEdit, question)">
        <span style="padding-bottom: var(--su); padding-top: var(--su);">
          {{ question.question }}&nbsp;
          <Badge
            :color="BadgeColor.GRAY"
            :type="BadgeType.PILL"
            :size="BadgeSize.SMALL"
          >
            <i class="fas fa-fingerprint"></i> {{ question.UUID }}
          </Badge>&nbsp;
          <Badge
            :color="BadgeColor.GRAY"
            :type="BadgeType.PILL"
            :size="BadgeSize.SMALL"
          >
            <i class="fas fa-keyboard"></i> {{ question.buttons.length }}
          </Badge>
        </span>
        <span class="editButton hy-nostyle">
          {{ Homey.__("settings.misc.edit") }} <i class="fa fa-chevron-right"></i>
        </span>
      </MenuItemWrapper>
    </MenuItemGroup>
  </template>
</template>
