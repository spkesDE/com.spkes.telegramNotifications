import {FlowCardAction} from 'homey';
import {TelegramNotifications} from '../../app';
import Utils from '../../utils';
import {BL} from 'betterlogiclibrary';
import {InputFile} from "grammy";

export default class SendTagImageWithMessage {
  constructor(app: TelegramNotifications, card: FlowCardAction) {
    card.registerRunListener(async (args) => {
      const url = args.droptoken.cloudUrl ??
                'https://' + await app.homey.cloud.getHomeyId() + '.connect.athom.com/api/image/' + args.droptoken.id;
      const imageExists = await Utils.isImageValid(url);
      if (!imageExists) {
        app.error('Image source is invalid for flow card send-a-image-with-tag-message! URL: ' + url + '(' + args.droptoken.cloudUrl + ')');
        throw new Error('Image source is invalid for flow card send-a-image-with-tag-message!');
      }
      if (app.bot == null) {
        return;
      }
      try {
        await app.bot.api.sendPhoto(args.user.id, new InputFile({url: url}, ""),
          {
            caption: await BL.decode(args.message),
            parse_mode: app.markdown,
            message_thread_id: args.user.topic
          }
        );
      } catch (err) {
        app.error(err);
        throw err;
      }
    });
    card.registerArgumentAutocompleteListener(
      'user', async (query) => Utils.userAutocomplete(app.chats, query)
    );
  }
}
