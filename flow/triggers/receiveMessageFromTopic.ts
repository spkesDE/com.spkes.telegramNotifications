import { FlowCardTrigger } from 'homey';
import { TelegramNotifications } from '../../app';
import { message } from "telegraf/filters";
import Utils from "../../utils";
import { Topic } from '../../chat';

export default class ReceiveMessageFromTopic {
    constructor(app: TelegramNotifications, card: FlowCardTrigger) {
        if (app.bot == null) return;
        card.registerRunListener(async (args, state) => {
            return args.chatWithTopic.id === state.id && args.chatWithTopic.topic === state.topic;
        });

        card.registerArgumentAutocompleteListener(
            'chatWithTopic',
            async (query) => Utils.topicAutocomplete(app.chats, query)
        );

        app.bot.on(message("text"), (ctx, next) => {
            // Do not trigger on non-topic messages
            if (!ctx.message.is_topic_message) {
                return next();
            }

            let topic: Topic | undefined;

            const chat = app.chats.find(chat => chat.chatId === ctx.chat.id);
            const messageThreadId = ctx.message.message_thread_id;

            if (messageThreadId && chat) {
                topic = chat.topics.find(topic => topic.topicId === messageThreadId);
            }

            const token = {
                message: ctx.message.text,
                from: ctx.message.from.first_name !== undefined ? ctx.message.from.first_name : 'undefined',
                username: ctx.message.from.username !== undefined ? ctx.message.from.username : 'undefined',
                chat: ctx.chat.type === 'private' ? ctx.chat.first_name : ctx.chat.title,
                chatType: ctx.chat.type,
                date: ctx.message.date,
                id: ctx.message.message_id,
                topic: topic !== undefined ? topic.topicName : 'undefined',
            };
            const state = {
                id: ctx.chat.id,
                topic: topic?.topicId,
            }
            card.trigger(token, state)
                .catch(app.error)
                .then();
            next();
        }).catch(app.error);
    }
}
