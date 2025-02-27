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
      return args.question.id === state.uuid && args.answer.id == state.answerId && state.customId == '';
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
      app.debug(`State of handleQuestions is: ${question.UUID} Answer: ${answerId} CustomId: ${customId}}`)
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
      app.debug(`Token: ${JSON.stringify(token)}`);

      //Trigger Card with given state
      const state = {
        uuid: question.UUID, answer: Question.getAnswer(question, answerId), answerId: answerId, customId: customId
      };
      app.debug(`State: ${JSON.stringify(state)}`);
      void receiveQuestionAnswerAutocomplete.trigger(token, state).catch(app.error);
      app.debug(`Triggered receiveQuestionAnswerAutocomplete`)
      void receiveQuestionAnswerAutocompleteWithCustomId.trigger(token, state).catch(app.error);
      app.debug(`Triggered receiveQuestionAnswerAutocompleteWithCustomId`)
      void receiveQuestionAnswerTrigger.trigger(token, state).catch(app.error); //Deprecated Flow
      app.debug(`Triggered receiveQuestionAnswerTrigger (Deprecated)`)
      void receiveQuestionAnswerWithAnswerTrigger.trigger(token, state).catch(app.error);  //Deprecated Flow
      app.debug(`Triggered receiveQuestionAnswerWithAnswerTrigger (Deprecated)`)

      if (question.keepButtons && question.checkmark) {
        app.debug(`Keep Buttons and Checkmark is true`)
        let keyboard = Question.createKeyboard(question, {
          replace: answerId,
          replaceWith: "✅",
        });
        await ctx.editMessageReplyMarkup({
          reply_markup: keyboard,
        }).catch(app.error);
        app.debug(`Edited Message Reply Markup`)

        app.homey.setTimeout(() => {
          ctx.editMessageReplyMarkup({
            reply_markup: Question.createKeyboard(question),
          }).catch(app.error);
          app.debug(`Edited Message Reply Markup back to normal`)
        }, 5000)
      }
      if (!question.keepButtons) {
        const keyboardRow = [InlineKeyboard.text(question.buttons[answerId], 'ignore-me')];
        await ctx.editMessageReplyMarkup({
          reply_markup: InlineKeyboard.from([keyboardRow]),
        }).catch(app.error);
      }
      app.debug(`Answered question ${question.UUID} with answer ${answerId}`)
      await ctx.answerCallbackQuery().catch(app.error);
      app.debug(`Handled Question is done`)
    });
  }
}
