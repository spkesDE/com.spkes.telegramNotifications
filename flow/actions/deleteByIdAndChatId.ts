import {FlowCardAction} from 'homey';
import {TelegramNotifications} from '../../app';

export default class DeleteByIdAndChatId {
  constructor(app: TelegramNotifications, card: FlowCardAction) {
    card.registerRunListener(async (args) => {
      if (app.bot != null) {
        app.debug(`Deleting message with ID ${args.id}  in ${args.chatId}`);
        try {
          await app.bot.api.deleteMessage(args.chatId, args.id);
        } catch (err) {
          app.error(err);
          throw err;
        }
      }
    });
  }
}
