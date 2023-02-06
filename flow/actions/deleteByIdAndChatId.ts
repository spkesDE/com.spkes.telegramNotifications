import {FlowCardAction} from 'homey';
import {TelegramNotifications} from '../../app';

export default class DeleteByIdAndChatId {
    constructor(app: TelegramNotifications, card: FlowCardAction) {
        card.registerRunListener(async (args) => {
            if (app.bot != null) {
                app.debug(`Deleting message with ID ${args.id}  in ${args.chatId}`)
                await app.bot.telegram.deleteMessage(args.chatId, args.id)
            }
        });
    }
}
