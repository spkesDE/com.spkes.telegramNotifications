import {FlowCardAction} from 'homey';
import {TelegramNotifications} from '../../app';
import Utils from '../../utils';
import {BL} from 'betterlogiclibrary';
import {InputFile} from "grammy";

export default class SendImageWithMessage {
  constructor(app: TelegramNotifications, card: FlowCardAction) {
    card.registerRunListener(async (args) => {
      if (app.bot != null) {
        if (Utils.validateURL(args.url)) {
          try {
            await app.bot.api.sendPhoto(args.user.id, new InputFile({url: args.url}, ""),
              {
                parse_mode: app.markdown,
                caption: await BL.decode(args.message),
                message_thread_id: args.user.topic,
                disable_notification: args.disable_notification ?? false,
              }
            );
          } catch (err) {
            app.error(err);
            throw err;
          }
        } else {
          app.error('ERR_INVALID_PROTOCOL: Protocol "http:" not supported. Expected "https:"');
          throw new Error('ERR_INVALID_PROTOCOL: Protocol "http:" not supported. Expected "https:"');
        }
      } else {
        app.error('Failed to start bot. Token most likely wrong.');
        throw new Error('Failed to start bot. Token most likely wrong.');
      }
    });
    card.registerArgumentAutocompleteListener(
      'user', async (query) => Utils.userAutocomplete(app.chats, query)
    );
  }
}
