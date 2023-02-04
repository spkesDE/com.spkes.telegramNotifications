import {FlowCardTrigger} from 'homey';
import {TelegramNotifications} from '../../app';
import {message} from "telegraf/filters";

export default class ReceiveMessage {
    constructor(app: TelegramNotifications, card: FlowCardTrigger) {
        if (app.bot == null) return;
        app.bot.on(message("text"), (ctx, next) => {
            console.log(ctx.message, ctx.chat)
            if (ctx.message.text === undefined) return;
            const token = {
                message: ctx.message.text,
                from: ctx.message.from.first_name !== undefined ? ctx.message.from.first_name : 'undefined',
                username: ctx.message.from.username !== undefined ? ctx.message.from.username : 'undefined',
                chat: ctx.chat.type === 'private' ? ctx.chat.first_name : ctx.chat.title,
                chatType: ctx.chat.type,
                date: ctx.message.date,
                id: ctx.message.message_id
            };
            card.trigger(token)
                .catch(app.error)
                .then();
            next();
        }).catch(app.error);
    }
}
