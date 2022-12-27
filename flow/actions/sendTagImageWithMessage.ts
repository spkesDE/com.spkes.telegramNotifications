import {FlowCardAction} from 'homey';
import {TelegramNotifications} from '../../app';
import Utils from "../../utils";
import {BL} from "betterlogiclibrary";

export default class SendTagImageWithMessage {
    constructor(app: TelegramNotifications, card: FlowCardAction) {
        card.registerRunListener(async (args) => {
            let imageExists = await Utils.isImageValid(args.droptoken.cloudUrl);
            if (!imageExists) {
                app.error("Image source is invalid for flow card send-a-image-with-message-and-tag!");
                throw new Error("Image source is invalid for flow card send-a-image-with-message-and-tag!");
            }
            if (app.bot == null) return;
            await app.bot.telegram.sendPhoto(args.user.id, {
                filename: "",
                url: args.droptoken.cloudUrl
            }, {caption: await BL.decode(args.message), parse_mode: "MarkdownV2"})
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
