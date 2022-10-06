import {Telegraf, Markup} from 'telegraf';
import {CallbackButton} from "telegraf/typings/markup";

export class Question {
    question: string = "";
    UUID: string = "";
    buttons: string[] = [];

    async createMessage(bot: Telegraf<any>, userId: number) {
        let callbackButtons: CallbackButton[] = [];
        this.buttons.forEach((value, i) => {
            //Todo Save DateTime
            callbackButtons.push(Markup.callbackButton(value, this.UUID + '.' + i))
        })
        await bot.telegram.sendMessage(userId, this.question, Markup.inlineKeyboard(callbackButtons, {columns: 2}).extra());
    }

    getAnswer(answerId: number) {
        return this.buttons[answerId];
    }
}
