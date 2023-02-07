import {Markup} from 'telegraf';
import {InlineKeyboardButton} from 'telegraf/typings/core/types/typegram';
import {TelegramNotifications} from "./app";

export default class Question {
    question: string = "";
    UUID: string = "";
    buttons: string[] = [];
    keepButtons: boolean = false;
    disable_notification: boolean = false;
    columns: number = 2;

    static async createMessage(q: Question, app: TelegramNotifications, userId: number, messageOverride?: string, customId?: string) {
        let callbackButtons: InlineKeyboardButton.CallbackButton[] = [];
        q.buttons.forEach((value, i) => {
            let id = q.UUID + '.' + i;
            if (customId != undefined && customId.length < 21)
                id += "." + customId
            callbackButtons.push(Markup.button.callback(value, id))
        })
        app.bot?.telegram.sendMessage(userId, messageOverride == undefined ? q.question : messageOverride, {
            disable_notification: q.disable_notification ?? false,
            ...Markup.inlineKeyboard(callbackButtons, {columns: q.columns ?? 2}),
        }).then((response) => {
            if (customId != undefined && customId.length < 21) {
                app.customIdMessages.push({
                    message_id: response.message_id,
                    chat_id: response.chat.id,
                    customId: customId,
                });
            }
        });
    }

    static getAnswer(q: Question, answerId: number) {
        return q.buttons[answerId];
    }

}
