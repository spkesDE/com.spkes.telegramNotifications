import {FlowCardTrigger} from 'homey';
import {TelegramNotifications} from '../../app';
import {Markup} from "telegraf";
import User from "../../user";

export default class HandleNewUsers {
    constructor(app: TelegramNotifications, card: FlowCardTrigger) {
        if (app.bot == null) return;
        app.bot.command("start", (ctx) => {
            let usePassword = app.homey.settings.get('use-password')
            if (usePassword !== null && usePassword) {
                let enteredPassword = ctx.message.text.split(' ')[1] ?? '';
                let password = app.homey.settings.get('password')
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
                    Markup.button.callback('Register this Telegram chat!', 'user-add'),
                ], {columns: 1}),
            ).catch(app.error);
            card.trigger({
                from: ctx.chat.type === 'private' ? ctx.chat.first_name : ctx.chat.title,
                username: ctx.chat.type === 'private' ? ctx.chat.username : ctx.chat.title,
                chatType: ctx.chat.type,
            })
                .catch(app.error)
                .then();
        }).catch(app.error);

        app.bot.action('user-add', (ctx) => {
            if (!("chat" in ctx)) return;
            let user: User | null = null;
            //0 User, 1 Group, 3 Supergroup
            if (ctx.chat?.type === 'group') {
                user = new User(ctx.chat?.id ?? 0, ctx.chat?.title ?? 'Error', 1);
            } else if (ctx.chat?.type === 'supergroup') {
                user = new User(ctx.chat?.id ?? 0, ctx.chat?.title ?? 'Error', 2);
            } else if (ctx.chat?.type === 'private') {
                user = new User(ctx.chat?.id ?? 0, ctx.chat?.first_name ?? 'Error', 0);
            }
            if (user !== null && user.userId !== 0) {
                if (!app.users.some((u) => u.userId === user?.userId)) {
                    app.users.push(user);
                    ctx.reply('👍').catch(app.error);
                    app.homey.settings.set('users', JSON.stringify(app.users));
                } else {
                    ctx.reply('👎').catch(app.error);
                    ctx.reply('Already in the user list!').catch(app.error);
                }
            } else {
                ctx.reply('Something went wrong! Can\'t get the User Id').catch(app.error);
            }
        }).catch(app.error);
    }
}
