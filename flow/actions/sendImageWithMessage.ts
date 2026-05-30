import {FlowCardAction} from 'homey';
import {TelegramNotifications} from '../../app';
import Utils from '../../utils';
import {BL} from 'betterlogiclibrary';
import {InputFile} from "grammy";

export default class SendImageWithMessage {
  constructor(app: TelegramNotifications, card: FlowCardAction) {
    card.registerRunListener(async (args) => {
      if (app.bot != null) {
        try {
          const url = Utils.ensureValidRemoteUrl(args.url);
          await app.bot.api.sendPhoto(args.user.id, new InputFile({url}, ""),
            {
              caption: await BL.decode(args.message),
              ...app.createSendOptions({
                topic: args.user.topic,
                disableNotification: args.disable_notification ?? false,
                includeTextFormatting: true
              })
            }
          );
        } catch (err) {
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
