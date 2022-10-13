import {FlowCardTrigger} from 'homey';
import {TelegramNotifications} from '../../app';

export default class ReceiveMessage {
    constructor(app: TelegramNotifications, card: FlowCardTrigger) {
        if (app.bot == null) return;
        app.bot.on('text', (ctx) => {
            if (ctx.message.text === undefined) return;
            const token = {
                message: ctx.message.text,
                from: ctx.message.from.first_name !== undefined ? ctx.message.from.first_name : 'undefined',
                username: ctx.message.from.username !== undefined ? ctx.message.from.username : 'undefined',
                chat: ctx.chat.type === 'private' ? ctx.chat.first_name : ctx.chat.title,
                chatType: ctx.chat.type,
            };
            card.trigger(token)
                .catch(app.error)
                .then();
        }).catch(app.error);
    }
}
