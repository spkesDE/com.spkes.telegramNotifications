import {TelegramNotifications} from '../app';
import Chat from '../chat';

/**
 * Handles the my_chat_member event — fires when the bot's membership changes.
 *
 * On add (wasOut && isIn):
 *   Bot was left/kicked and is now member/admin/creator → auto-register the chat
 *   (if the corresponding chat-type toggle is enabled).
 *
 * On remove (isOut):
 *   Bot is now left/kicked → always unregister the chat (no toggle check).
 *
 * On promotion (newStatus === "administrator"):
 *   Bot was already a member and got promoted to admin → register if toggled on.
 *   This catches the case where the initial adding event was missed or toggles
 *   were turned on after the bot was already a member.
 */
export default class HandleMyChatMember {
    constructor(app: TelegramNotifications) {
        if (app.bot == null) {
            return;
        }

        app.bot.on("my_chat_member", async (ctx) => {
            const update = ctx.myChatMember;
            if (!update) return;

            const chat = update.chat;
            const oldStatus = update.old_chat_member.status;
            const newStatus = update.new_chat_member.status;

            const wasOut = oldStatus === "left" || oldStatus === "kicked";
            const isIn = newStatus === "member" || newStatus === "administrator" || newStatus === "creator";
            const isOut = newStatus === "left" || newStatus === "kicked";

            const shouldAutoAdd = (): boolean => {
                switch (chat.type) {
                    case 'private': return app.autoAddChats;
                    case 'group':
                    case 'supergroup': return app.autoAddGroups;
                    case 'channel': return app.autoAddChannels;
                    default: return false;
                }
            };

            if (wasOut && isIn) {
                if (!shouldAutoAdd()) return;
                const added = app.registerChat(new Chat(chat.id, chat.title ?? chat.first_name ?? 'Unknown', Chat.typeFromTelegram(chat.type)));
                if (added) {
                    app.log(`Chat registered via my_chat_member: ${chat.title ?? chat.first_name ?? chat.id} (${chat.type})`);
                }
                return;
            }

            if (isOut) {
                const removed = app.unregisterChat(chat.id);
                if (removed) {
                    app.log(`Chat unregistered via my_chat_member: ${chat.id}`);
                }
                return;
            }

            if (newStatus === "administrator") {
                if (!shouldAutoAdd()) return;
                const added = app.registerChat(new Chat(chat.id, chat.title ?? chat.first_name ?? 'Unknown', Chat.typeFromTelegram(chat.type)));
                if (added) {
                    app.log(`Chat registered via my_chat_member (promoted): ${chat.title ?? chat.first_name ?? chat.id} (${chat.type})`);
                }
            }
        });
    }
}
