import {FlowCardAction} from 'homey';
import {TelegramNotifications} from '../../app';

export default class SendSilentMessage {
    constructor(app: TelegramNotifications, card: FlowCardAction) {
        card.registerRunListener((args) => {
            if (app.bot != null) {
                app.bot.telegram.sendMessage(args.user.id, args.message, {disable_notification: true})
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
