import Homey from 'homey';
import { Telegraf, Markup } from 'telegraf';

class User {

  userId: number
  chatName: string

  constructor(userId: number, chatName: string) {
    this.chatName = chatName;
    this.userId = userId;
  }

}

/*
  Todo
  - Group Chat
     => Working. When Upgrading to Supergroup the send Flow has to be updated
  - Message Receving
     => Working
  - Add "(RE)Start" Button in the Settings Page
  - Add State of the Bot in the Settings Page
 */

class TelegramNotifications extends Homey.App {

  users: User[] = [];
  bot:Telegraf<any> | null = null;
  /**
   * onInit is called when the app is initialized.
   */
  async onInit() {
    const token = this.homey.settings.get('bot-token');
    if (token !== null) {
      this.bot = new Telegraf(token);
      if (this.homey.settings.get('users') !== null) {
        this.users = JSON.parse(this.homey.settings.get('users')) as User[];
      }

      // Start Command
      this.bot.start((ctx) => {
        ctx.replyWithMarkdown(
          'Welcome to the Homey Telegram Bot!'
            + '\n\n'
            + 'Press the button below to register yourself!',
          Markup.inlineKeyboard([
            Markup.callbackButton('Register this Telegram Chat!', 'user-add'),
          ], { columns: 1 }).extra(),
        );
      });
      this.bot.action('user-add', (ctx) => {
        let user: User | null = null;
        // this.log(ctx.chat);
        if (ctx.chat.type === 'group' || ctx.chat.type === 'supergroup') {
          user = new User(ctx.chat?.id ?? 0, ctx.chat?.title ?? 'Error');
        } else if (ctx.chat.type === 'private') {
          user = new User(ctx.chat?.id ?? 0, ctx.chat?.first_name ?? 'Error');
        }
        if (user !== null && user.userId !== 0) {
          if (!this.users.some((u) => u.userId === user?.userId)) {
            this.users.push(user);
            ctx.reply('👍');
            this.homey.settings.set('users', JSON.stringify(this.users));
          } else {
            ctx.reply('👎');
            ctx.reply('Already in the user list!');
          }
        } else {
          ctx.reply('Something went wrong! Can\'t get the User Id');
        }
      });

      // Flows
      this.sendNotificationActionFlow();
      this.receiveMessageTriggerFlow();

      await this.bot.launch();
      this.log('Telegram Notifications has been initialized');
    } else {
      this.log('Telegram Notifications has no token. Please enter a Token in the Settings!');
    }
  }

  private sendNotificationActionFlow() {
    const sendNotificationCard = this.homey.flow.getActionCard('sendNotification');
    sendNotificationCard.registerRunListener((args, state) => {
      if (this.bot != null) {
        this.bot.telegram.sendMessage(args.user.id, args.message)
          .catch(this.error)
          .then();
      }
    });
    sendNotificationCard.registerArgumentAutocompleteListener(
      'user',
      async (query, args) => {
        const results:any = [];
        this.users.forEach((user) => {
          results.push({
            name: user.chatName,
            id: user.userId,
          });
        });
        return results.filter((result: any) => {
          return result.name.toLowerCase().includes(query.toLowerCase());
        });
      },
    );
  }

  private receiveMessageTriggerFlow() {
    const receiveMessageCard = this.homey.flow.getTriggerCard('receiveMessage');
    if (this.bot != null) {
      this.bot.on('text', (ctx, next) => {
        if (ctx.message.text === undefined) return;
        const token = { message: ctx.message.text };
        receiveMessageCard.trigger(token)
          .catch(this.error)
          .then();
      });
    }
  }

}

module.exports = TelegramNotifications;
