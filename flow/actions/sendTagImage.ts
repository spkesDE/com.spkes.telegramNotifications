import {FlowCardAction} from 'homey';
import {TelegramNotifications} from '../../app';
import Utils from "../../utils";

export default class SendTagImage {
    constructor(app: TelegramNotifications, card: FlowCardAction) {
        card.registerRunListener(async (args) => {
            let imageExists = await Utils.isImageValid(args.droptoken.cloudUrl);
            if (!imageExists) {
                app.error("Image source is invalid for flow card send-a-image-with-tag!");
                throw new Error("Image source is invalid for flow card send-a-image-with-tag!");
            }
            if (app.bot == null) return;
            app.bot.telegram.sendPhoto(args.user.id, {filename: "", url: args.droptoken.cloudUrl})
                .catch((r) => {
                    app.error(r);
                })
                .then();
        });
        card.registerArgumentAutocompleteListener(
            'user', async (query) => Utils.userAutocomplete(app.users, query)
        );
    }
}
