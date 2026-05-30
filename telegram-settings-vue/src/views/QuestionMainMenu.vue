<script setup lang="ts">
import {computed, ref} from "vue";
import "../App.css";
import Homey from "../Homey";
import {Views} from "../statics/views";
import type {QuestionModel} from "../types/models";
import MenuWrapper from "../components/UIComps/MenuWrapper.vue";
import QuestionMenu from "./QuestionMenu.vue";
import QuestionOverview from "./QuestionOverview.vue";

const props = defineProps<{
  changeView: (view: Views) => void
}>();

const currentView = ref(Views.QuestionsOverview);
const targetQuestion = ref<QuestionModel | undefined>(undefined);

function changeQuestionView(view?: Views, question?: QuestionModel) {
  if (view === undefined) {
    return;
  }

  if (view === Views.MainMenu) {
    props.changeView(Views.MainMenu);
    return;
  }

  currentView.value = view;
  targetQuestion.value = question;
}

const viewConfig = computed(() => {
  switch (currentView.value) {
    case Views.QuestionsOverview:
      return {
        title: Homey.__("settings.questionMenu.questions"),
        backView: Views.MainMenu,
        addView: Views.QuestionsAdd
      };
    case Views.QuestionsAdd:
      return {
        title: Homey.__("settings.questionMenu.addQuestion"),
        backView: Views.QuestionsOverview
      };
    case Views.QuestionsEdit:
      return {
        title: Homey.__("settings.questionMenu.editQuestion"),
        backView: Views.QuestionsOverview
      };
    default:
      props.changeView(Views.MainMenu);
      return {
        title: Homey.__("settings.questionMenu.questions"),
        backView: Views.MainMenu
      };
  }
});
</script>

<template>
  <MenuWrapper
    :title="viewConfig.title"
    :on-back="() => changeQuestionView(viewConfig.backView)"
    :on-add="viewConfig.addView !== undefined ? () => changeQuestionView(viewConfig.addView) : undefined"
  >
    <QuestionOverview
      v-if="currentView === Views.QuestionsOverview"
      :change-view="changeQuestionView"
    />
    <QuestionMenu
      v-else-if="currentView === Views.QuestionsAdd"
      :change-view-on-save="changeQuestionView"
    />
    <QuestionMenu
      v-else
      :change-view-on-save="changeQuestionView"
      :question="targetQuestion"
    />
  </MenuWrapper>
</template>
