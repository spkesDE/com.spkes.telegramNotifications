<script setup lang="ts">
import {computed, reactive, ref} from "vue";
import "../App.css";
import Homey from "../Homey";
import {Views} from "../statics/views";
import {BadgeColor} from "../statics/colors";
import type {QuestionModel} from "../types/models";
import {generateNanoId, getJsonSetting, setJsonSetting} from "../utils/settings";
import Loading from "./Loading.vue";
import MenuItemGroup from "../components/UIComps/MenuItemGroup.vue";
import MenuItemWrapper from "../components/UIComps/MenuItemWrapper.vue";
import Switch from "../components/UIComps/Switch.vue";
import Badge from "../components/UIComps/Badge.vue";
import Popup from "../components/UIComps/Popup.vue";
import AnswerInput from "../components/QuestionComp/AnswerInput.vue";
import AnswerWrapper from "../components/QuestionComp/AnswerWrapper.vue";

const props = defineProps<{
  question?: QuestionModel
  changeViewOnSave: (view?: Views, targetQuestion?: QuestionModel) => void
}>();

const state = reactive({
  question: props.question?.question ?? "",
  UUID: props.question?.UUID ?? generateNanoId(),
  buttons: [...(props.question?.buttons ?? [])],
  keepButtons: props.question?.keepButtons ?? false,
  checkmark: props.question?.checkmark ?? false,
  disable_notification: props.question?.disable_notification ?? false,
  columns: props.question?.columns ?? 2,
  gotData: true,
  showDeletePopup: false,
  showAsGrid: true
});

const answers = ref(Math.max(props.question?.buttons.length ?? 2, 2));

const totalRows = computed(() => {
  const columns = state.showAsGrid ? state.columns : 1;
  return Math.ceil(answers.value / columns);
});

function updateButton(index: number, value: string) {
  state.buttons[index] = value;
}

function getInputClass(index: number) {
  const columns = state.showAsGrid ? state.columns : 1;
  const currentRow = Math.floor(index / columns);
  const isFirstInRow = index % columns === 0;
  const isLastInRow = (index + 1) % columns === 0 || index === answers.value - 1;
  const firstRow = currentRow === 0;
  const lastRow = currentRow === totalRows.value - 1;
  let classes = "";

  if (isFirstInRow && firstRow) classes += " cornerTopLeft";
  if (isLastInRow && firstRow) classes += " cornerTopRight";
  if (isFirstInRow && lastRow) classes += " cornerBottomLeft";
  if (isLastInRow && lastRow) classes += " cornerBottomRight";

  return classes.trim();
}

async function saveQuestion() {
  state.gotData = false;

  const questions = await getJsonSetting<QuestionModel[]>("questions", []);
  const filteredQuestions = questions.filter((question) => question.UUID !== state.UUID);
  filteredQuestions.push({
    UUID: state.UUID,
    question: state.question,
    buttons: state.buttons.filter((value) => value.trim() !== ""),
    keepButtons: state.keepButtons,
    checkmark: state.checkmark,
    disable_notification: state.disable_notification,
    columns: state.columns
  });

  await setJsonSetting("questions", filteredQuestions);
  state.gotData = true;
  props.changeViewOnSave(Views.QuestionsOverview);
}

async function deleteQuestion() {
  state.gotData = false;

  const questions = await getJsonSetting<QuestionModel[]>("questions", []);
  await setJsonSetting("questions", questions.filter((question) => question.UUID !== state.UUID));

  state.gotData = true;
  state.showDeletePopup = false;
  props.changeViewOnSave(Views.QuestionsOverview);
}
</script>

<template>
  <Loading
    v-if="!state.gotData"
    :fullscreen="true"
  />
  <template v-else>
    <MenuItemGroup>
      <MenuItemWrapper>
        <label class="menuItem-label hy-nostyle">
          {{ Homey.__("settings.questionMenu.question") }}
        </label>
        <input
          v-model="state.question"
          class="menuItem-input hy-nostyle"
          type="text"
          required
          :placeholder="Homey.__('settings.questionMenu.questionPlaceholder')"
        />
      </MenuItemWrapper>
    </MenuItemGroup>

    <MenuItemGroup>
      <MenuItemWrapper>
        <h2>{{ Homey.__("settings.questionMenu.keepButton") }}</h2>
        <Switch
          :model-value="state.keepButtons"
          @update:model-value="state.keepButtons = $event"
        />
      </MenuItemWrapper>
      <MenuItemWrapper>
        <h2>{{ Homey.__("settings.questionMenu.disableNotifications") }}</h2>
        <Switch
          :model-value="state.disable_notification"
          @update:model-value="state.disable_notification = $event"
        />
      </MenuItemWrapper>
      <MenuItemWrapper>
        <h2>{{ Homey.__("settings.questionMenu.checkMark") }}</h2>
        <Switch
          :model-value="state.checkmark"
          @update:model-value="state.checkmark = $event"
        />
      </MenuItemWrapper>
      <MenuItemWrapper>
        <h2>{{ Homey.__("settings.questionMenu.btnPerRow") }}</h2>
        <div style="display: flex;">
          <input
            id="columnSize"
            max="4"
            min="1"
            type="range"
            :value="state.columns"
            @input="state.columns = Number(($event.target as HTMLInputElement).value)"
          />&nbsp;
          <Badge :color="BadgeColor.GRAY">
            {{ state.columns }}
          </Badge>
        </div>
      </MenuItemWrapper>
      <MenuItemWrapper>
        <h2>{{ Homey.__("settings.questionMenu.showAsGrid") }}</h2>
        <Switch
          :model-value="state.showAsGrid"
          @update:model-value="state.showAsGrid = $event"
        />
      </MenuItemWrapper>
      <p class="itemGroupHint">
        <i class="fas fa-info-circle"></i>
        {{ Homey.__("settings.questionMenu.checkMark") }}:
        {{ Homey.__("settings.questionMenu.checkMarkTooltip") }}
      </p>
    </MenuItemGroup>

    <MenuItemGroup>
      <AnswerWrapper>
        <template
          v-for="index in answers"
          :key="`answer-${index - 1}`"
        >
          <AnswerInput :class-name="getInputClass(index - 1)">
            <input
              class="menuItem-input-full hy-nostyle"
              type="text"
              :required="index === 1"
              :placeholder="Homey.__('settings.questionMenu.answerPlaceholder')"
              :value="state.buttons[index - 1] ?? ''"
              @input="updateButton(index - 1, ($event.target as HTMLInputElement).value)"
            />
          </AnswerInput>
          <div
            v-if="index % (state.showAsGrid ? state.columns : 1) === 0"
            class="answerInputBreak"
          ></div>
        </template>
      </AnswerWrapper>
    </MenuItemGroup>

    <MenuItemGroup>
      <MenuItemWrapper class-name="noPadding">
        <button
          class="menuItem-button-blue hy-nostyle"
          @click="answers += 1"
        >
          <i class="fa fa-plus"></i> {{ Homey.__("settings.questionMenu.addAnswer") }}
        </button>
      </MenuItemWrapper>
    </MenuItemGroup>

    <MenuItemGroup>
      <MenuItemWrapper class-name="noPadding">
        <button
          class="menuItem-button-green hy-nostyle"
          @click="saveQuestion"
        >
          {{ Homey.__("settings.questionMenu.saveQuestion") }}
        </button>
      </MenuItemWrapper>
    </MenuItemGroup>

    <MenuItemGroup v-if="props.question">
      <MenuItemWrapper class-name="noPadding">
        <button
          class="menuItem-button-danger hy-nostyle"
          @click="state.showDeletePopup = true"
        >
          {{ Homey.__("settings.questionMenu.deleteQuestion") }}
        </button>
      </MenuItemWrapper>
    </MenuItemGroup>

    <Popup
      :title="Homey.__('settings.misc.warning')"
      icon="fa-exclamation-triangle"
      :show="state.showDeletePopup"
      @close="state.showDeletePopup = false"
    >
      {{ Homey.__("settings.questionMenu.questionPopup") }}
      <br /><br />
      <button
        class="yesButton hy-nostyle"
        @click="deleteQuestion"
      >
        {{ Homey.__("settings.misc.yes") }}
      </button>

      <button
        class="noButton hy-nostyle"
        @click="state.showDeletePopup = false"
      >
        {{ Homey.__("settings.misc.no") }}
      </button>
    </Popup>
  </template>
</template>
