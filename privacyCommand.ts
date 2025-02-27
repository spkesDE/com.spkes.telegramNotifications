import {TelegramNotifications} from "./app";

export default class PrivacyCommand {

    constructor(private app: TelegramNotifications) {
        if (this.app.bot != null)
            this.app.bot.command('privacy', async (ctx, next) => {
                if (this.app.privacyCommand) {
                    await ctx.reply('*Privacy Policy*\n\n' +
                        'This bot is a private bot and does not store any data from other users\\.\n\n*Data Saved*:\n\n'
                        + 'ChatId, ChatName, and Type are stored of *registered* chats\\.\n'
                        + 'TopicId and TopicName are stored of registered topics\\.\n'
                        + 'User data is stored for the purpose of sending messages and images\\.\n'
                        + 'All data is stored locally on the host machine\\. \\(Homey Pro\\)\n'
                        + 'No data is shared with third parties\\.\n\n'
                        + 'For more information, please contact the [app developer\'s](https://t.me/homeyCommunity)\\.'
                        , {parse_mode: 'MarkdownV2', disable_notification: true, protect_content: true});
                }
                await next();
            });
    }
}
