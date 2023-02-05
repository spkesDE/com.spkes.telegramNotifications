import {FlowCardAction} from 'homey';
import {TelegramNotifications} from '../../app';
import Utils from "../../utils";

export default class SendMessage {
    constructor(app: TelegramNotifications, card: FlowCardAction) {
        card.registerRunListener(async (args) => {
            if (app.bot != null) {
                console.log(args)
                await app.bot.telegram.sendMessage(args.user.id, args.message)
                    .catch(app.error)
                    .then();
            }
        });
        card.registerArgumentAutocompleteListener(
            'user', async (query) => Utils.userAutocomplete(app.users, query)
        );
    }
}
