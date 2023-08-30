import {InlineKeyboard} from 'grammy';
import {TelegramNotifications} from '../../app';
import Question from '../../question';
import Utils from '../../utils';

export default class HandleQuestions {
  constructor(app: TelegramNotifications) {
    if (app.bot == null) {
      return;
    }

    //Once the Setting Question is set by the app settings in will reload it to the memory
    app.homey.settings.on('set', (key) => {
      if (key == 'questions') {
        app.loadQuestions();
      }
    });

    //Getting Trigger Flows
    const receiveQuestionAnswerTrigger = app.homey.flow.getTriggerCard('receive-question-answer');
    const receiveQuestionAnswerWithAnswerTrigger = app.homey.flow.getTriggerCard('receive-question-answer-with-answer');
    const receiveQuestionAnswerAutocomplete = app.homey.flow.getTriggerCard('receive-question-answer-autocomplete');
    const receiveQuestionAnswerAutocompleteWithCustomId = app.homey.flow.getTriggerCard('receive-question-answer-autocomplete-customId');


    //region Autocomplete
    receiveQuestionAnswerTrigger.registerArgumentAutocompleteListener(
      'question', async (query) => Utils.questionAutocomplete(app.questions, query)
    );
    receiveQuestionAnswerWithAnswerTrigger.registerArgumentAutocompleteListener(
      'question', async (query) => Utils.questionAutocomplete(app.questions, query)
    );
    receiveQuestionAnswerAutocomplete.registerArgumentAutocompleteListener(
      'question', async (query) => Utils.questionAutocomplete(app.questions, query)
    );
    receiveQuestionAnswerAutocompleteWithCustomId.registerArgumentAutocompleteListener(
      'question', async (query) => Utils.questionAutocomplete(app.questions, query)
    );

    receiveQuestionAnswerAutocomplete.registerArgumentAutocompleteListener(
      'answer',
      async (query, args) => {
        const question = app.questions.find(question => question.UUID === args.question.id);
        if (!question) {
          return [];
        }
        return Utils.answerAutocomplete(question, query);
      },
    );

    receiveQuestionAnswerAutocompleteWithCustomId.registerArgumentAutocompleteListener(
      'answer',
      async (query, args) => {
        const question = app.questions.find(question => question.UUID === args.question.id);
        if (!question) {
          return [];
        }
        return Utils.answerAutocomplete(question, query);
      },
    );
    //endregion

    //region State checking
    receiveQuestionAnswerTrigger.registerRunListener(async (args, state) => {
      return args.question.id === state.uuid;
    });

    receiveQuestionAnswerWithAnswerTrigger.registerRunListener(async (args, state) => {
      return args.question.id === state.uuid && args.answer == state.answer && state.customId == '';
    });

    receiveQuestionAnswerAutocomplete.registerRunListener(async (args, state) => {
      return args.question.id === state.uuid && args.answer.name == state.answer && state.customId == '';
    });

    receiveQuestionAnswerAutocompleteWithCustomId.registerRunListener(async (args, state) => {
      return args.question.id === state.uuid && args.answer.name == state.answer && args.id == state.customId;
    });
    //endregion

    //This event will trigger once an inline button is pressed
    app.bot.on('callback_query:data', async (ctx, next) => {
      if (!ctx.chat || ctx.callbackQuery.data == 'ignore-me' || ctx.callbackQuery.data == 'user-add') {
        return next();
      }
      const parts = ctx.callbackQuery.data.split('.');
      const questionId: string = parts[0];
      const answerId = Number(parts[1]);
      let customId = '';
      if (parts.length == 3) {
        customId = parts[2];
      }
      const question = app.getQuestion(questionId);
      if (question === undefined) {
        app.error('Question not found. Did the question got deleted?"');
        await ctx.reply(app.homey.__("questions.notFound"));
        throw new Error('Question with UUID ' + questionId + ' not found');
      }

      // https://apps.developer.homey.app/the-basics/flow/arguments#flow-state
      //Building Token
      const token = {
        question: question.question,
        answer: Question.getAnswer(question, answerId),
        from: ctx.callbackQuery.from.first_name !== undefined ? ctx.callbackQuery.from.first_name : 'undefined',
        username: ctx.callbackQuery.from.username !== undefined ? ctx.callbackQuery.from.username : 'undefined',
        chat: ctx.chat.type === 'private' ? ctx.chat.first_name : ctx.chat.title,
        chatType: ctx.chat.type,
        chatId: ctx.chat.id,
        id: ctx.callbackQuery.message?.message_id ?? 0,
      };

      //Trigger Card with given state
      const state = {
        uuid: question.UUID, answer: Question.getAnswer(question, answerId), customId: customId
      };
      await receiveQuestionAnswerTrigger.trigger(token, state).catch(app.error); //Deprecated Flow
      await receiveQuestionAnswerWithAnswerTrigger.trigger(token, state).catch(app.error);
      await receiveQuestionAnswerAutocomplete.trigger(token, state).catch(app.error);
      await receiveQuestionAnswerAutocompleteWithCustomId.trigger(token, state).catch(app.error);

      if (!question.keepButtons) {
        const keyboardRow = [InlineKeyboard.text(question.buttons[answerId], 'ignore-me')];
        await ctx.editMessageReplyMarkup({
          reply_markup: InlineKeyboard.from([keyboardRow]),
        }).catch(app.error);
      }
      await ctx.answerCallbackQuery({
        cache_time: 30 * 24 * 3600
      }).catch(app.error);
    });
  }
}
