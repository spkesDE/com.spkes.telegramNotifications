import {FlowCardTrigger} from 'homey';
import {TelegramNotifications} from '../../app';
import {Markup} from "telegraf";
import Chat from "../../chat";

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
                    ctx.reply('👍').catch(app.error);
                    app.homey.settings.set('users', JSON.stringify(app.chats));
                } else {
                    ctx.reply('👎').catch(app.error);
                    ctx.reply('Already in the user list!').catch(app.error);
                }
            } else {
                ctx.reply('Something went wrong! Can\'t get the Chat Id').catch(app.error);
            }
        }).catch(app.error);
    }
}
