import {FlowCardAction} from 'homey';
import {TelegramNotifications} from '../../app';
import {BL} from 'betterlogiclibrary';

export default class SendMessageById {
    constructor(app: TelegramNotifications, card: FlowCardAction) {
        card.registerRunListener(async (args) => {
            if (app.bot != null) {
                // Parse args.user from string to number
                args.user = parseInt(args.user);
                // Validate the args.user
                if (!args.user) throw new Error('User ID is required');
                if (app.chats.filter(chat => chat.chatId === args.user).length === 0) throw new Error('User ID is not found as a registered chat. Please register the chat first.');
                try {
                    await app.bot.api.sendMessage(args.user, await BL.decode(args.message),
                        {
                            parse_mode: app.markdown,
                            link_preview_options: {
                                is_disabled: !app.disableWebPagePreview
                            }
                        }
                    );
                } catch (err) {
                    app.error(err);
                    throw err;
                }
            }
        });
    }
}
