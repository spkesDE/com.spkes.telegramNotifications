import {FlowCardAction} from 'homey';
import {TelegramNotifications} from '../../app';
import Utils from '../../utils';

export default class DeleteById {
  constructor(app: TelegramNotifications, card: FlowCardAction) {
    card.registerRunListener(async (args) => {
      if (app.bot != null) {
        app.debug(`Deleting message with ID ${args.id}  in ${args.user.name ?? args.chatId}`);
        try {
          await app.bot.api.deleteMessage(args.user.id ?? args.chatId, args.id);
        } catch (err) {
          app.error(err);
          throw err;
        }
      }
    });

    card.registerArgumentAutocompleteListener(
      'user', async (query) => Utils.userAutocomplete(app.chats, query)
    );
  }
}
