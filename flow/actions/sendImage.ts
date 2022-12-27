import {FlowCardAction} from 'homey';
import {TelegramNotifications} from '../../app';
import Utils from "../../utils";

export default class SendImage {
    constructor(app: TelegramNotifications, card: FlowCardAction) {
        card.registerRunListener((args) => {
            if (app.bot != null) {
                if (Utils.validateURL(args.url)) {
                    app.bot.telegram.sendPhoto(args.user.id, {filename: "", url: args.url})
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
            'user', async (query) => Utils.userAutocomplete(app.users, query)
        );
    }
}
