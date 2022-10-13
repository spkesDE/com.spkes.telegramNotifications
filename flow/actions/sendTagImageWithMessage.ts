import {FlowCardAction} from 'homey';
import {TelegramNotifications} from '../../app';

export default class SendTagImageWithMessage {
    constructor(app: TelegramNotifications, card: FlowCardAction) {
        card.registerRunListener((args) => {
            if (app.bot != null) {
                app.bot.telegram.sendPhoto(args.user.id, {
                    filename: "",
                    url: args.droptoken.cloudUrl
                }, {caption: args.message})
                    .catch((r) => {
                        app.error(r);
                        throw new Error(r)
                    })
                    .then();
            }
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
