import {TelegramNotifications} from '../../app';
import {Topic} from "../../chat";

export default class HandleTopics {
    constructor(app: TelegramNotifications) {
        if (app.bot == null) return;
        app.bot.command('registertopic', async (ctx, next) => {
            if (!ctx.message.is_topic_message || !ctx.message.message_thread_id) {
                ctx.reply("Chat is not a forum/topic chat.")
                return;
            }
            let chat = app.chats.find((c) => c.chatId == ctx.chat.id);
            if (chat == null) {
                ctx.reply("Chat is not registered.");
                return;
            }
            if (!chat.topics) chat.topics = [];
            let topic = chat.topics.find((t) => t.topicId == ctx.message.message_thread_id);
            if (topic) {
                ctx.reply("Topic is already registered.");
                return;
            }

            chat.topics.push(
                new Topic(ctx.message.message_thread_id, (ctx.message.reply_to_message as any).forum_topic_created.name)
            );
            app.homey.settings.set('users', JSON.stringify(app.chats));
            ctx.reply('👍').catch(app.error);
            next();
        })
    }
}
