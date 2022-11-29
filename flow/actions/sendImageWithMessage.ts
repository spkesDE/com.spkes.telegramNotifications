import {FlowCardAction} from 'homey';
import {TelegramNotifications} from '../../app';
import Utils from "../../utils";
import {BL} from "betterlogiclibrary";

export default class SendImageWithMessage {
    constructor(app: TelegramNotifications, card: FlowCardAction) {
        card.registerRunListener((args) => {
            if (app.bot != null) {
                if (Utils.validateURL(args.url)) {
                    app.bot.telegram.sendPhoto(args.user.id, {
                        filename: "",
                        url: args.url
                    }, {caption: BL.decode(args.message)})
                        .catch(app.error)
                        .then();
                } else {
                    app.error('ERR_INVALID_PROTOCOL: Protocol "http:" not supported. Expected "https:"')
                    throw new Error('ERR_INVALID_PROTOCOL: Protocol "http:" not supported. Expected "https:"')
                }
            } else {
                app.error('Failed to start bot. Token most likely wrong.')
                throw new Error('Failed to start bot. Token most likely wrong.')
            }
        });
        card.registerArgumentAutocompleteListener(
            'user',
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
            },
        );
    }
}
