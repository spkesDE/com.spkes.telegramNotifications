import {FlowCardAction} from 'homey';
import {TelegramNotifications} from '../../app';

export default class DeleteByCustomId {
  constructor(app: TelegramNotifications, card: FlowCardAction) {
    card.registerRunListener(async (args) => {
      if (app.bot != null) {
        for (const message of app.customIdMessages) {
          if (args.id == message.customId) {
            app.debug(`Deleting message with Custom ID '${args.id}' in ${message.chat_id} with message_id ${message.message_id}`);
            try {
              await app.bot.api.deleteMessage(message.chat_id, message.message_id).then(() => {
                app.customIdMessages = app.customIdMessages.filter(m => m.message_id !== message.message_id && m.chat_id !== message.chat_id);
              });
            } catch (err) {
              app.error(err);
            }
          }
        }
      }
    });
  }
}
