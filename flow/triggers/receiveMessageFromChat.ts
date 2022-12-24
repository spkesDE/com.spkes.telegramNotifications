import {FlowCardTrigger} from 'homey';
import {TelegramNotifications} from '../../app';
import {message} from "telegraf/filters";

export default class ReceiveMessageFromChat {
    constructor(app: TelegramNotifications, card: FlowCardTrigger) {
        if (app.bot == null) return;
        card.registerRunListener(async (args: any, state: any) => {
            return args.chat.id == state.id;
        });

        card.registerArgumentAutocompleteListener(
            'chat',
            async (query) => {
                const results: any = [];
                app.users.forEach((user) => {
                    results.push({
                        name: user.chatName,
                        id: user.userId,
                    });
                });
                return results.filter((result: any) => {
                    return result.name.toLowerCase().includes(query.toLowerCase());
                });
            }
        );

        app.bot.on(message("text"), (ctx) => {
            if (ctx.message.text === undefined) return;
            const token = {
                message: ctx.message.text,
                from: ctx.message.from.first_name !== undefined ? ctx.message.from.first_name : 'undefined',
                username: ctx.message.from.username !== undefined ? ctx.message.from.username : 'undefined',
                chat: ctx.chat.type === 'private' ? ctx.chat.first_name : ctx.chat.title,
                chatType: ctx.chat.type,
            };
            const state = {
                id: ctx.chat.id,
            }
            card.trigger(token, state)
                .catch(app.error)
                .then();
        }).catch(app.error);
    }
}
