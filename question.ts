import {Telegraf, Markup} from 'telegraf';
import {CallbackButton} from "telegraf/typings/markup";

export class Question {
    question: string = "";
    UUID: string = "";
    buttons: string[] = [];
    keepButtons: boolean = false;

    static async createMessage(q: Question, bot: Telegraf<any>, userId: number) {
        let callbackButtons: CallbackButton[] = [];
        q.buttons.forEach((value, i) => {
            //Todo Save DateTime
            callbackButtons.push(Markup.callbackButton(value, q.UUID + '.' + i))
        })
        await bot.telegram.sendMessage(userId, q.question, Markup.inlineKeyboard(callbackButtons, {columns: 2}).extra());
    }

    static getAnswer(q: Question, answerId: number) {
        return q.buttons[answerId];
    }
}
