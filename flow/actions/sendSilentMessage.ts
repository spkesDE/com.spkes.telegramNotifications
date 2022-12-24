import {FlowCardAction} from 'homey';
import {TelegramNotifications} from '../../app';
import {BL} from "betterlogiclibrary";

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
