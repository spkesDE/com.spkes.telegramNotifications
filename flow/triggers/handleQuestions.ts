import {TelegramNotifications} from '../../app';
import {Markup} from "telegraf";
import Question from "../../question";
import {callbackQuery} from "telegraf/filters";
import Utils from "../../utils";

export default class HandleQuestions {
    constructor(app: TelegramNotifications) {
        if (app.bot == null) return;

        //Once the Setting Question is set by the app settings in will reload it to the memory
        app.homey.settings.on('set', (key) => {
            if (key == 'questions')
                app.loadQuestions()
        })

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
                let question = app.questions.find(question => question.UUID === args.question.id);
                if (!question) return [];
                return Utils.answerAutocomplete(question, query);
            },
        );

        receiveQuestionAnswerAutocompleteWithCustomId.registerArgumentAutocompleteListener(
            'answer',
            async (query, args) => {
                let question = app.questions.find(question => question.UUID === args.question.id);
                if (!question) return [];
                return Utils.answerAutocomplete(question, query);
            },
        );
        //endregion

        //region State checking
        receiveQuestionAnswerTrigger.registerRunListener(async (args, state) => {
            return args.question.id === state.uuid;
        });

        receiveQuestionAnswerWithAnswerTrigger.registerRunListener(async (args, state) => {
            return args.question.id === state.uuid && args.answer == state.answer && state.customId == "";
        });

        receiveQuestionAnswerAutocomplete.registerRunListener(async (args, state) => {
            return args.question.id === state.uuid && args.answer.name == state.answer && state.customId == "";
        });

        receiveQuestionAnswerAutocompleteWithCustomId.registerRunListener(async (args, state) => {
            return args.question.id === state.uuid && args.answer.name == state.answer && args.id == state.customId;
        });
        //endregion

        //This event will trigger once an inline button is pressed
        app.bot.on(callbackQuery("data"), async ctx => {
            if (!ctx.chat) return;
            if (ctx.callbackQuery.data == 'ignore-me') return;
            if (ctx.callbackQuery.data == 'user-add') return;
            let parts = ctx.callbackQuery.data.split('.');
            let questionId: string = parts[0]
            let answerId: number = Number(parts[1])
            let customId: string = "";
            if (parts.length == 3)
                customId = parts[2]
            let question = app.getQuestion(questionId);
            if (question === undefined) {
                app.error('Question not found. Did the question got deleted?"');
                await ctx.reply("ERROR: Question not found. Did the question got deleted?");
                throw new Error('Question with UUID ' + questionId + ' not found');
            }
            if (!question.keepButtons) {
                await ctx.editMessageReplyMarkup({inline_keyboard: [[Markup.button.callback(question.buttons[answerId], "ignore-me")]]}).catch();
            }
            // https://apps.developer.homey.app/the-basics/flow/arguments#flow-state
            //Building Token
            let token = {
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
            let state = {uuid: question.UUID, answer: Question.getAnswer(question, answerId), customId: customId};
            await receiveQuestionAnswerTrigger.trigger(token, state).catch(app.error); //Deprecated Flow
            await receiveQuestionAnswerWithAnswerTrigger.trigger(token, state).catch(app.error);
            await receiveQuestionAnswerAutocomplete.trigger(token, state).catch(app.error);
            await receiveQuestionAnswerAutocompleteWithCustomId.trigger(token, state).catch(app.error);
            await ctx.answerCbQuery();
        });
    }
}
