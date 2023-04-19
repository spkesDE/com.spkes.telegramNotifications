import {FlowCardAction} from 'homey';
import {TelegramNotifications} from '../../app';
import Utils from "../../utils";

export default class SendTagImage {
    constructor(app: TelegramNotifications, card: FlowCardAction) {
        card.registerRunListener(async (args) => {
            let url = args.droptoken.cloudUrl ??
                "https://" + await app.homey.cloud.getHomeyId() + ".connect.athom.com/api/image/" + args.droptoken.id;
            let imageExists = await Utils.isImageValid(url);
            if (!imageExists) {
                app.error("Image source is invalid for flow card send-a-image-with-tag!");
                throw new Error("Image source is invalid for flow card send-a-image-with-tag!");
            }
            if (app.bot == null) return;
            await app.bot.telegram
                .sendPhoto(args.user.id, {filename: "", url: url}, {message_thread_id: args.user.topic})
                .catch((r) => {
                    app.error(r);
                });
        });
        card.registerArgumentAutocompleteListener(
            'user', async (query) => Utils.userAutocomplete(app.chats, query)
        );
    }
}
