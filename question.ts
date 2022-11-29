import {Markup, Telegraf} from 'telegraf';
import {CallbackButton} from "telegraf/typings/markup";

export default class Question {
    question: string = "";
    UUID: string = "";
    buttons: string[] = [];
    keepButtons: boolean = false;
    disable_notification: boolean = false;

    static async createMessage(q: Question, bot: Telegraf<any>, userId: number) {
        let callbackButtons: CallbackButton[] = [];
        q.buttons.forEach((value, i) => {
            callbackButtons.push(Markup.callbackButton(value, q.UUID + '.' + i))
        })
        await bot.telegram.sendMessage(userId, q.question, Markup.inlineKeyboard(callbackButtons, {columns: 2}).extra({disable_notification: q.disable_notification ?? false}));
    }

    static getAnswer(q: Question, answerId: number) {
        return q.buttons[answerId];
    }

}
