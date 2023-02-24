import {FlowCardAction} from 'homey';
import {TelegramNotifications} from '../../app';
import Utils from "../../utils";
import {BL} from "betterlogiclibrary";

export default class SendSilentMessage {
    constructor(app: TelegramNotifications, card: FlowCardAction) {
        card.registerRunListener(async (args) => {
            console.log("Input: " + args.message);
            console.log("Output: " + await BL.decode(args.message));
            if (app.bot != null) {
                await app.bot.telegram
                    .sendMessage(args.user.id, await BL.decode(args.message), {disable_notification: true})
                    .catch(app.error)
                    .then();
            }
        });
        card.registerArgumentAutocompleteListener(
            'user', async (query) => Utils.userAutocomplete(app.users, query)
        );
    }
}
