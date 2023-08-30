import {TelegramNotifications} from './app';
import {InlineKeyboard} from 'grammy';

export default class Question {
    question = '';
    UUID = '';
    buttons: string[] = [];
    keepButtons = false;
    disable_notification = false;
    columns = 2;

    static async createMessage(q: Question, app: TelegramNotifications, userId: number, opts?: {
        messageOverride?: string,
        customId?: string,
        image?: string,
        topic?: number
    }) {
        let keyboard = new InlineKeyboard();
        q.buttons.forEach((value, i) => {
            let id = q.UUID + '.' + i;
            if (opts?.customId != undefined && opts?.customId.length < 21) id += "." + opts?.customId;
            keyboard.text(value, id)
        });
        keyboard = keyboard.toFlowed(q.columns ?? 2);
        if (opts?.image != undefined) {
            app.bot?.api.sendPhoto(userId, opts.image, {
                caption: opts?.messageOverride == undefined ? q.question : opts?.messageOverride,
                disable_notification: q.disable_notification ?? false,
                message_thread_id: opts?.topic ?? undefined,
                parse_mode: app.markdown,
                reply_markup: keyboard
            }).then((response) => {
                if (opts?.customId != undefined && opts?.customId.length < 21) {
                    app.customIdMessages.push({
                        message_id: response.message_id,
                        chat_id: response.chat.id,
                        customId: opts?.customId
                    })
                }
            }).catch((e) => {
                app.error(e)
            })
        } else {
            app.bot?.api.sendMessage(userId, opts?.messageOverride == undefined ? q.question : opts?.messageOverride, {
                disable_notification: q.disable_notification ?? false,
                message_thread_id: opts?.topic ?? undefined,
                parse_mode: app.markdown,
                reply_markup: keyboard
            }).then((response) => {
                if (opts?.customId != undefined && opts?.customId.length < 21) {
                    app.customIdMessages.push({
                        message_id: response.message_id,
                        chat_id: response.chat.id,
                        customId: opts?.customId
                    })
                }
            }).catch((e) => {
                app.error(e)
            })
        }
    }

    static getAnswer(q: Question, answerId: number) {
        return q.buttons[answerId]
    }
}
