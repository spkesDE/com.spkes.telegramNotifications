import {InlineKeyboardButton} from 'grammy/types';
import {TelegramNotifications} from './app';
import {InlineKeyboard} from 'grammy';

export default class Question {
  question = '';
  UUID = '';
  buttons: string[] = [];
  keepButtons = false;
  disable_notification = false;
  columns = 2;

  static async createMessage(
    q: Question,
    app: TelegramNotifications,
    userId: number,
    messageOverride?: string,
    customId?: string,
    image?: string,
    topic?: number
  ) {
    const callbackButtons: InlineKeyboardButton.CallbackButton[][] = [];

    let columns: number;
    if (q.columns) {
      if (q.columns > q.buttons.length) {
        // Prevent having more columns than buttons
        columns = q.buttons.length;
      } else {
        columns = q.columns;
      }
    } else {
      columns = 2;
    }

    const rows = Math.ceil(q.buttons.length / columns);

    // Prefill columns
    for (let row = 0; row < rows; row++) {
      callbackButtons.push([]);
    }

    for (const [i, button] of q.buttons.entries()) {
      let id = q.UUID + '.' + i;
      if (customId != undefined && customId.length < 21) {
        id += '.' + customId;
      }
      const row = Math.floor(i / columns);
      callbackButtons[row].push(InlineKeyboard.text(button, id));
    }

    if (image != undefined) {
      app.bot?.api.sendPhoto(userId, image,
        {
          caption:
              messageOverride == undefined ? q.question : messageOverride,
          disable_notification: q.disable_notification ?? false,
          message_thread_id: topic ?? undefined,
          reply_markup: InlineKeyboard.from(callbackButtons),
        }
      )
        .then((response) => {
          if (customId != undefined && customId.length < 21) {
            app.customIdMessages.push({
              message_id: response.message_id,
              chat_id: response.chat.id,
              customId: customId,
            });
          }
        })
        .catch(app.error);
    } else {
      app.bot?.api
        .sendMessage(
          userId,
          messageOverride == undefined ? q.question : messageOverride,
          {
            disable_notification: q.disable_notification ?? false,
            message_thread_id: topic ?? undefined,
            reply_markup: InlineKeyboard.from(callbackButtons),
          }
        )
        .then((response) => {
          if (customId != undefined && customId.length < 21) {
            app.customIdMessages.push({
              message_id: response.message_id,
              chat_id: response.chat.id,
              customId: customId,
            });
          }
        })
        .catch(app.error);
    }
  }

  static getAnswer(q: Question, answerId: number) {
    return q.buttons[answerId];
  }
}
