import {FlowCardTrigger} from 'homey';
import {TelegramNotifications} from '../../app';
import Chat from '../../chat';
import {InlineKeyboard} from 'grammy';

export default class HandleNewUsers {
  constructor(app: TelegramNotifications, card: FlowCardTrigger) {
    if (app.bot == null) {
      return;
    }
    app.bot.command('start', (ctx, next) => {
      if (!ctx.message) {
        return next();
      }
      const usePassword = app.homey.settings.get('use-password');
      if (usePassword !== null && usePassword) {
        const enteredPassword = ctx.message.text.split(' ')[1] ?? '';
        const password = app.homey.settings.get('password');
        if (password === null || password !== enteredPassword) {
          ctx.reply(app.homey.__("newUser.wrongPassword"));
          return;
        }
      }
      const keyboardRow = [InlineKeyboard.text(app.homey.__("newUser.register"), 'user-add')];
      ctx.reply(
          app.homey.__("newUser.welcome")
        + '\n\n'
          + app.homey.__("newUser.register2"),
        {
          reply_markup: InlineKeyboard.from([keyboardRow]),
        }
      );
      card.trigger({
        from: ctx.chat.type === 'private' ? ctx.chat.first_name ?? "unknown" : ctx.chat.title ?? "unknown",
        username: ctx.chat.type === 'private' ? ctx.chat.username ?? "unknown" : ctx.chat.title ?? "unknown",
        chatType: ctx.chat.type ?? "unknown",
      }).catch(app.error).then();
    });

    app.bot.callbackQuery('user-add', async (ctx) => {
      if (!ctx.chat) {
        return;
      }
      let user: Chat | null = null;
      //0 Chat, 1 Group, 3 Supergroup
      if (ctx.chat?.type === 'group') {
        user = new Chat(ctx.chat?.id ?? 0, ctx.chat?.title ?? 'Error', 1);
      } else if (ctx.chat?.type === 'supergroup') {
        user = new Chat(ctx.chat?.id ?? 0, ctx.chat?.title ?? 'Error', 2);
      } else if (ctx.chat?.type === 'private') {
        user = new Chat(ctx.chat?.id ?? 0, ctx.chat?.first_name ?? 'Error', 0);
      }
      if (user !== null && user.chatId !== 0) {
        if (!app.chats.some((u) => u.chatId === user?.chatId)) {
          app.chats.push(user);
          await ctx.reply('👍');
          app.homey.settings.set('users', JSON.stringify(app.chats));
        } else {
          await ctx.reply('👎');
          await ctx.reply(app.homey.__("newUser.knownChat"));
        }
      } else {
        await ctx.reply(app.homey.__("newUser.error"));
      }
    });
  }
}
