import {FlowCardAction} from 'homey';
import {TelegramNotifications} from '../../app';
import Question from '../../question';
import Utils from '../../utils';
import {BL} from 'betterlogiclibrary';

export default class SendQuestion {

  constructor(app: TelegramNotifications, card: FlowCardAction) {
    card.registerRunListener(async (args) => {
      const question = app.getQuestion(args.question.id);
      if (question === undefined) {
        app.error('Question not found');
        throw new Error('Question with UUID ' + args.question.id + ' not found');
      }
      if (app.bot === undefined || app.bot === null) {
        app.error('Bot has failed to initialize');
        throw new Error('Bot has failed to initialize');
      }
      await Question.createMessage(
        question,
        app,
        args.user.id,
          {
            messageOverride: args.message == undefined || args.message == '' ? undefined : await BL.decode(args.message) ?? undefined,
            customId: args.id ?? undefined,
            image: args.imageUrl ?? undefined,
            topic: args.user.topic ?? undefined,
          }
      ).catch((e) => {
        app.error(e);
        throw e;
      });
    });
    card.registerArgumentAutocompleteListener(
      'user', async (query) => Utils.userAutocomplete(app.chats, query)
    );
    card.registerArgumentAutocompleteListener(
      'question', async (query) => Utils.questionAutocomplete(app.questions, query)
    );
  }
}
