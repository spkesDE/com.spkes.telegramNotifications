import {FlowCardAction} from 'homey';
import {TelegramNotifications} from '../../app';

export default class DeleteByCustomId {
    constructor(app: TelegramNotifications, card: FlowCardAction) {
        card.registerRunListener(async (args) => {
            if (app.bot != null) {
                app.customIdMessages.forEach((message, index) => {
                    if (args.id == message.customId) {
                        app.debug(`Deleting message with Custom ID '${args.id}' in ${message.chat_id} with message_id ${message.message_id}`)
                        app.bot?.telegram.deleteMessage(message.chat_id, message.message_id).then(() => {
                            app.customIdMessages = app.customIdMessages.filter(m => m.message_id !== message.message_id && m.chat_id !== message.chat_id);
                        })
                    }
                });
            }
        });
    }
}
