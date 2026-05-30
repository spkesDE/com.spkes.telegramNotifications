import {FlowCardAction} from 'homey';
import {TelegramNotifications} from '../../app';
import Utils from '../../utils';
import {InputFile} from "grammy";

export default class SendTagImage {
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
        app.error('Image source is invalid for flow card send-a-image-with-tag! URL: ' + url + ' ( ' + args.droptoken.cloudUrl + ' )');
        throw new Error('Image source is invalid for flow card send-a-image-with-tag!');
      }
      try {
        await app.bot.api.sendPhoto(args.user.id, new InputFile({url}, ""),
          app.createSendOptions({
            topic: args.user.topic,
            disableNotification: args.disable_notification ?? false
          })
        );
      } catch (err) {
        app.error(err);
        throw err;
      }
    });
    card.registerArgumentAutocompleteListener(
      'user', async (query) => Utils.chatAutocomplete(app.chats, query)
    );
  }
}
