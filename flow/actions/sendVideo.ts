import {FlowCardAction} from 'homey';
import {TelegramNotifications} from '../../app';
import Utils from '../../utils';
import {InputFile} from "grammy";

export default class SendVideo {
  constructor(app: TelegramNotifications, card: FlowCardAction) {
    card.registerRunListener(async (args) => {
      if (app.bot != null) {
        try {
          const url = Utils.ensureValidRemoteUrl(args.url);
          await app.bot.api.sendVideo(args.user.id, new InputFile({url}, ""),
            app.createSendOptions({
              topic: args.user.topic,
              disableNotification: args.disable_notification ?? false
            })
          );
        } catch (err) {
          if (app.handleTelegramError(err, args.user.id)) {
            return;
          }
          app.error(err);
          throw err;
        }
      } else {
        app.error('Failed to start bot. Token most likely wrong.');
        throw new Error('Failed to start bot. Token most likely wrong.');
      }
    });
    card.registerArgumentAutocompleteListener(
      'user', async (query) => Utils.chatAutocomplete(app.chats, query)
    );
  }
}
