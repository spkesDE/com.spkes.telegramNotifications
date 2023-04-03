import {FlowCardAction} from 'homey';
import {TelegramNotifications} from '../../app';
import Utils from "../../utils";
import {BL} from "betterlogiclibrary";

export default class SendImageWithMessage {
    constructor(app: TelegramNotifications, card: FlowCardAction) {
        card.registerRunListener(async (args) => {
            if (app.bot != null) {
                if (Utils.validateURL(args.url)) {
                    await app.bot.telegram.sendPhoto(args.user.id, {
                        filename: "",
                        url: args.url
                    }, {caption: await BL.decode(args.message)})
                        .catch(app.error);
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
            'user', async (query) => Utils.userAutocomplete(app.users, query)
        );
    }
}
