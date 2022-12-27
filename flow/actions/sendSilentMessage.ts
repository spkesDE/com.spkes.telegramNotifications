import {FlowCardAction} from 'homey';
import {TelegramNotifications} from '../../app';
import {BL} from "betterlogiclibrary";
import Utils from "../../utils";

export default class SendSilentMessage {
    constructor(app: TelegramNotifications, card: FlowCardAction) {
        card.registerRunListener(async (args) => {
            if (app.bot != null) {
                await app.bot.telegram.sendMessage(args.user.id, await BL.decode(args.message), {
                    disable_notification: true,
                    parse_mode: "MarkdownV2"
                })
                    .catch(app.error)
                    .then();
            }
        });
        card.registerArgumentAutocompleteListener(
            'user', async (query) => Utils.userAutocomplete(app.users, query)
        );
    }
}
