import {Markup, Telegraf} from 'telegraf';
import {InlineKeyboardButton} from 'telegraf/typings/core/types/typegram';

export default class Question {
    question: string = "";
    UUID: string = "";
    buttons: string[] = [];
    keepButtons: boolean = false;
    disable_notification: boolean = false;
    columns: number = 2;

    static async createMessage(q: Question, bot: Telegraf<any>, userId: number, messageOverride: string = "") {
        let callbackButtons: InlineKeyboardButton.CallbackButton[] = [];
        q.buttons.forEach((value, i) => {
            callbackButtons.push(Markup.button.callback(value, q.UUID + '.' + i))
        })
        await bot.telegram.sendMessage(userId, messageOverride == "" ? q.question : messageOverride, {
            disable_notification: q.disable_notification ?? false,
            ...Markup.inlineKeyboard(callbackButtons, {columns: q.columns ?? 2}),
        });
    }

    static getAnswer(q: Question, answerId: number) {
        return q.buttons[answerId];
    }

}
