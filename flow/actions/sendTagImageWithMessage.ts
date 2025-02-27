import {FlowCardAction} from 'homey';
import {TelegramNotifications} from '../../app';
import Utils from '../../utils';
import {BL} from 'betterlogiclibrary';
import {InputFile} from "grammy";

export default class SendTagImageWithMessage {
  constructor(app: TelegramNotifications, card: FlowCardAction) {
    card.registerRunListener(async (args) => {
      if (app.bot == null) {
        return;
      }
      //Get Local URL from droptoken, if not available use cloud
      let url = args.droptoken.localUrl;
      let imageExists = await Utils.isImageValid(url);

      //If image doesnt exist force cloud url
      if (!imageExists) {
        url = args.droptoken.cloudUrl ?? 'https://' + await app.homey.cloud.getHomeyId() + '.connect.athom.com/api/image/' + args.droptoken.id;
        imageExists = await Utils.isImageValid(url);
      }

      //If is still not exist throw error.
      if (!imageExists) {
        app.error('Image source is invalid for flow card send-a-image-with-tag-message! URL: ' + url + ' ( ' + args.droptoken.cloudUrl + ' )');
        throw new Error('Image source is invalid for flow card send-a-image-with-tag-message!');
      }
      await app.bot.api.sendPhoto(args.user.id, new InputFile({url: url}, ""),
          {
            caption: await BL.decode(args.message),
            parse_mode: app.markdown,
            message_thread_id: args.user.topic,
            disable_notification: args.disable_notification ?? false,
          }
      ).catch(app.error);
    });
    card.registerArgumentAutocompleteListener(
      'user', async (query) => Utils.userAutocomplete(app.chats, query)
    );
  }
}
