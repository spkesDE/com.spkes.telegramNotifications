import {Telegraf, Markup} from 'telegraf';
import {v4 as uuid} from 'uuid';
import {CallbackButton} from "telegraf/typings/markup";

export class Question {
    userId: number
    question: string
    UUID: string | undefined;
    messageId: number = 0;
    chatId: number = 0;
    buttons: string[] = [];

    constructor(bot: Telegraf<any> | null, userId: number, question: string, buttons: string[]) {
        this.userId = userId;
        this.question = question;
        if (bot == null) return;
        this.UUID = uuid();
        let callbackButtons: CallbackButton[] = [];
        this.buttons = buttons;
        buttons.forEach((value, i) => {
            //Todo Save Answers with Id, Save DateTime
            callbackButtons.push(Markup.callbackButton(value, this.UUID + '.' + i))
        })
        let message = bot.telegram.sendMessage(userId, question, Markup.inlineKeyboard(callbackButtons, {columns: 2}).extra());

        message.then(message => {
            this.messageId = message.message_id;
            this.chatId = message.chat.id;
        }).catch(console.error)
    }

    getAnswer(answerId: number) {
        return this.buttons[answerId];
    }
}
