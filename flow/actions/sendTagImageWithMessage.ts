import {FlowCardAction} from 'homey';
import {TelegramNotifications} from '../../app';
import Utils from "../../utils";
import {BL} from "betterlogiclibrary";

export default class SendTagImageWithMessage {
    constructor(app: TelegramNotifications, card: FlowCardAction) {
        card.registerRunListener(async (args) => {
            let url = args.droptoken.cloudUrl ??
                "https://" + await app.homey.cloud.getHomeyId() + ".connect.athom.com/api/image/" + args.droptoken.id;
            let imageExists = await Utils.isImageValid(url);
            if (!imageExists) {
                app.error("Image source is invalid for flow card send-a-image-with-tag-message! URL: " + url);
                throw new Error("Image source is invalid for flow card send-a-image-with-tag-message!");
            }
            if (app.bot == null) return;
            await app.bot.telegram
                .sendPhoto(args.user.id, {filename: "", url: url}, {caption: await BL.decode(args.message)})
                .catch((r) => {
                    app.error(r);
                });
        });
        card.registerArgumentAutocompleteListener(
            'user', async (query) => Utils.userAutocomplete(app.users, query)
        );
    }
}
