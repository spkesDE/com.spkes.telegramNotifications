import {Markup, Telegraf} from 'telegraf';

export default class Question {
    question: string = "";
    UUID: string = "";
    buttons: string[] = [];
    keepButtons: boolean = false;
    disable_notification: boolean = false;

    static async createMessage(q: Question, bot: Telegraf<any>, userId: number) {
        let callbackButtons: any[] = [];
        q.buttons.forEach((value, i) => {
            callbackButtons.push(Markup.button.callback(value, q.UUID + '.' + i))
        })
        await bot.telegram.sendMessage(userId, q.question, {
            ...Markup.inlineKeyboard(callbackButtons, {columns: 2}),
            disable_notification: q.disable_notification ?? false,
            parse_mode: "MarkdownV2"
        });
    }

    static getAnswer(q: Question, answerId: number) {
        return q.buttons[answerId];
    }

}
