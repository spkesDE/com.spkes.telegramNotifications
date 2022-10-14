import {FlowCardAction} from 'homey';
import {TelegramNotifications} from '../../app';
import Utils from "../../utils";

export default class SendTagImageWithMessage {
    constructor(app: TelegramNotifications, card: FlowCardAction) {
        card.registerRunListener(async (args) => {
            let imageExists = await Utils.isImageValid(args.droptoken.cloudUrl);
            if (!imageExists) {
                app.error("Image source is invalid for flow card send-a-image-with-message-and-tag!");
                throw new Error("Image source is invalid for flow card send-a-image-with-message-and-tag!");
            }
            if (app.bot == null) return;
            app.bot.telegram.sendPhoto(args.user.id, {
                filename: "",
                url: args.droptoken.cloudUrl
            }, {caption: args.message})
                .catch((r) => {
                    app.error(r);
                })
                .then();
        });
        card.registerArgumentAutocompleteListener(
            'user',
            async (query) => {
                const results: any = [];
                app.users.forEach((user) => {
                    results.push({
                        name: user.chatName,
                        id: user.userId,
                    });
                });
                return results.filter((result: any) => {
                    return result.name.toLowerCase().includes(query.toLowerCase());
                });
            },
        );
    }
}
