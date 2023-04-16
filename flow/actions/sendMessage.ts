import {FlowCardAction} from 'homey';
import {TelegramNotifications} from '../../app';
import Utils from "../../utils";
import {BL} from "betterlogiclibrary";

export default class SendMessage {
    constructor(app: TelegramNotifications, card: FlowCardAction) {
        card.registerRunListener(async (args) => {
            if (app.bot != null) {
                await app.bot.telegram.sendMessage(args.user.id, await BL.decode(args.message), {message_thread_id: args.user.topic})
                    .catch(app.error);
            }
        });
        card.registerArgumentAutocompleteListener(
            'user', async (query) => Utils.userAutocomplete(app.chats, query)
        );
    }
}
