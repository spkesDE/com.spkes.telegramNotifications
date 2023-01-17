import {Markup, Telegraf} from 'telegraf';
import {InlineKeyboardButton} from "telegraf/src/core/types/typegram";

export default class Question {
    question: string = "";
    UUID: string = "";
    buttons: string[] = [];
    keepButtons: boolean = false;
    disable_notification: boolean = false;
    columns: number = 2;

    static async createMessage(q: Question, bot: Telegraf<any>, userId: number) {
        let callbackButtons: InlineKeyboardButton.CallbackButton[] = [];
        q.buttons.forEach((value, i) => {
            callbackButtons.push(Markup.button.callback(value, q.UUID + '.' + i))
        })
        await bot.telegram.sendMessage(userId, q.question, {
            ...Markup.inlineKeyboard(callbackButtons, {columns: q.columns ?? 2}),
            disable_notification: q.disable_notification ?? false,
            parse_mode: "MarkdownV2"
        });
    }

    static getAnswer(q: Question, answerId: number) {
        return q.buttons[answerId];
    }

}
