import Homey from 'homey';
import {Telegraf, Markup} from 'telegraf';

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
  - Add "(RE)Start" Button in the Settings Page
  - Add State of the Bot in the Settings Page
 */

class TelegramNotifications extends Homey.App {

    users: User[] = [];
    bot: Telegraf<any> | null = null;
    token: string | null = null;
    private startSuccess: boolean = true;
    private flowsRegistered: boolean = false;

    /**
     * onInit is called when the app is initialized.
     */
    async onInit() {
        this.token = await this.homey.settings.get('bot-token');
        this.homey.settings.on('set', (dataName) => {
            if (dataName === 'bot-token') {
                this.token = this.homey.settings.get('bot-token');
                if (this.bot === null || !this.startSuccess) {
                    this.startBot();
                    this.changeBotState(true);
                } else {
                    this.bot.stop();
                    this.changeBotState(true);
                    this.bot = null;
                    this.startBot();
                }
            }
            if (dataName === 'users') {
                this.users = JSON.parse(this.homey.settings.get('users'));
            }
        });

        await this.startBot();
    }

    private async startBot() {
        if (this.token === null || this.token === '' || this.token.length < 43) {
            this.log('Telegram Notifications has no token. Please enter a Token in the Settings!');
            this.changeBotState(false);
            return;
        }
        this.bot = new Telegraf(this.token);
        if (this.homey.settings.get('users') !== null) {
            this.users = JSON.parse(this.homey.settings.get('users')) as User[];
        }

        // Start Command
        this.bot.start((ctx) => {
            let usePassword = this.homey.settings.get('use-password')
            if (usePassword !== null && usePassword) {
                let enteredPassword = ctx.message.text.split(' ')[1] ?? '';
                let password = this.homey.settings.get('password')
                if (password === null || password !== enteredPassword) {
                    ctx.reply("Wrong password.");
                    return;
                }
            }

            ctx.replyWithMarkdown(
                'Welcome to the Homey Telegram Bot!'
                + '\n\n'
                + 'Press the button below to register yourself!',
                Markup.inlineKeyboard([
                    Markup.callbackButton('Register this Telegram chat!', 'user-add'),
                ], {columns: 1}).extra(),
            ).catch(this.error);
            this.homey.flow.getTriggerCard('newUser').trigger({
                from: ctx.chat.type === 'private' ? ctx.chat.first_name : ctx.chat.title,
                username: ctx.chat.type === 'private' ? ctx.chat.username : ctx.chat.title,
                chatType: ctx.chat.type,
            })
                .catch(this.error)
                .then();
        }).catch(this.error);

        this.bot.action('user-add', (ctx) => {
            let user: User | null = null;
            if (ctx.chat.type === 'group' || ctx.chat.type === 'supergroup') {
                user = new User(ctx.chat?.id ?? 0, ctx.chat?.title ?? 'Error');
            } else if (ctx.chat.type === 'private') {
                user = new User(ctx.chat?.id ?? 0, ctx.chat?.first_name ?? 'Error');
            }
            if (user !== null && user.userId !== 0) {
                if (!this.users.some((u) => u.userId === user?.userId)) {
                    this.users.push(user);
                    ctx.reply('👍').catch(this.error);
                    this.homey.settings.set('users', JSON.stringify(this.users));
                } else {
                    ctx.reply('👎').catch(this.error);
                    ctx.reply('Already in the user list!').catch(this.error);
                }
            } else {
                ctx.reply('Something went wrong! Can\'t get the User Id').catch(this.error);
            }
        }).catch(this.error);

        // Flows
        if (!this.flowsRegistered) {
            this.sendNotificationActionFlow();
            this.receiveMessageTriggerFlow();
            this.flowsRegistered = true;
        }
        this.bot.catch(this.error);
        await this.bot.launch().catch(this.error);
        // eslint-disable-next-line no-return-assign
        await this.bot.telegram.getMe().catch((r) => this.changeBotState(false));
        if (!this.startSuccess) {
            this.log('Failed to start. Token most likely wrong.');
        } else {
            this.log('Telegram Notifications app is initialized.');
            this.changeBotState(true);
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
                const results: any = [];
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

    private changeBotState(bool: boolean) {
        this.startSuccess = bool;
        this.homey.settings.set('bot-running', bool);
    }

    public log(message: string) {
        this.writeLog(message).then();
        this.homey.log(message);
    }

    public error(message: string) {
        this.writeLog(message).then();
        this.homey.error(message);
    }

    private receiveMessageTriggerFlow() {
        const receiveMessageCard = this.homey.flow.getTriggerCard('receiveMessage');
        if (this.bot != null) {
            this.bot.on('text', (ctx, next) => {
                if (ctx.message.text === undefined) return;
                const token = {
                    message: ctx.message.text,
                    from: ctx.message.from.first_name,
                    username: ctx.message.from.username,
                    chat: ctx.chat.type === 'private' ? ctx.chat.first_name : ctx.chat.title,
                    chatType: ctx.chat.type,
                };
                receiveMessageCard.trigger(token)
                    .catch(this.error)
                    .then();
            }).catch(this.error);
        }
    }

    private async writeLog(message: string) {
        let oldLogs = this.homey.settings.get('logs');
        if (oldLogs === null || oldLogs === undefined || oldLogs === '') oldLogs = '[]';
        const newMessage: JSON = <JSON><unknown>{date: new Date().toLocaleString(), message};
        const savedHistory = JSON.parse(oldLogs);
        if (savedHistory.length >= 20) savedHistory.pop();
        savedHistory.unshift(newMessage);
        this.homey.settings.set('logs', JSON.stringify(savedHistory));
    }

}

module.exports = TelegramNotifications;
