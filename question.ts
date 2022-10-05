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
        this.UUID = uuid();
        this.buttons = buttons;

        if (bot == null) return;
        this.createMessage(bot);
    }

    private createMessage(bot: Telegraf<any>) {
        let callbackButtons: CallbackButton[] = [];
        this.buttons.forEach((value, i) => {
            //Todo Save DateTime
            callbackButtons.push(Markup.callbackButton(value, this.UUID + '.' + i))
        })
        let message = bot.telegram.sendMessage(this.userId, this.question, Markup.inlineKeyboard(callbackButtons, {columns: 2}).extra());

        message.then(message => {
            this.messageId = message.message_id;
            this.chatId = message.chat.id;
        }).catch(console.error)
    }

    getAnswer(answerId: number) {
        return this.buttons[answerId];
    }
}
