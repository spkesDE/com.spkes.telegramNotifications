import {FlowCardTrigger} from 'homey';
import {TelegramNotifications} from '../../app';
import Utils from "../../utils";

export default class ReceiveMessageFromChat {
    constructor(app: TelegramNotifications, card: FlowCardTrigger) {
        if (app.bot == null) return;
        card.registerRunListener(async (args, state) => {
            return args.chat.id == state.id;
        });

        card.registerArgumentAutocompleteListener(
            'chat',
            async (query) => Utils.userAutocomplete(app.users, query)
        );

        app.bot.on("text", (ctx) => {
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
