import Homey from 'homey';
import { Telegraf, Markup } from 'telegraf';

class User {

  userId: number
  userName: string

  constructor(userId: number, userName: string) {
    this.userName = userName;
    this.userId = userId;
  }

}

class TelegramNotifications extends Homey.App {

  /**
   * onInit is called when the app is initialized.
   */
  async onInit() {
    const token = this.homey.settings.get('bot-token');
    if (token !== null) {
      const bot = new Telegraf(token);
      let users: User[] = [];
      if (this.homey.settings.get('users') !== null) {
        users = JSON.parse(this.homey.settings.get('users')) as User[];
      }

      // Start Command
      bot.start((ctx) => {
        ctx.replyWithMarkdown(
          'Welcome to the Homey Telegram Bot!'
            + '\n\n'
            + 'Press the button below to register yourself!',
          Markup.inlineKeyboard([
            Markup.callbackButton('Register this Telegram Chat!', 'user-add'),
          ], { columns: 1 }).extra(),
        );
      });
      bot.action('user-add', (ctx) => {
        const user = new User(ctx.chat?.id ?? 0, ctx.chat?.username ?? 'Error');
        if (user.userId !== 0) {
          if (!users.some((u) => u.userId === user.userId)) {
            users.push(user);
            ctx.reply('👍');
            this.homey.settings.set('users', JSON.stringify(users));
          } else {
            ctx.reply('👎');
            ctx.reply('Already in the user list!');
          }
        } else {
          ctx.reply('Something went wrong!');
        }
      });

      // Flows
      const sendNotificationCard = this.homey.flow.getActionCard('sendNotification');
      sendNotificationCard.registerRunListener((args, state) => {
        bot.telegram.sendMessage(args.user.id, args.message);
      });
      sendNotificationCard.registerArgumentAutocompleteListener(
        'user',
        async (query, args) => {
          const results:any = [];
          users.forEach((user) => {
            results.push({
              name: user.userName,
              id: user.userId,
            });
          });
          return results.filter((result: any) => {
            return result.name.toLowerCase().includes(query.toLowerCase());
          });
        },
      );
      await bot.launch();
      this.log('Telegram Notifications has been initialized');
    }
    this.log('Telegram Notifications has no token. Please enter a Token in the Settings!');
  }

}

module.exports = TelegramNotifications;
