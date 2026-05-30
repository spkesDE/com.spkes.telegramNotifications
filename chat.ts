export default class Chat {
    static readonly TYPE_PRIVATE = 0;
    static readonly TYPE_GROUP = 1;
    static readonly TYPE_SUPERGROUP = 2;
    static readonly TYPE_CHANNEL = 3;

    chatId: number
    chatName: string
    type?: number
    topics?: Topic[] = [];

    constructor(chatId: number, chatName: string, type: number) {
      this.chatName = chatName;
      this.chatId = chatId;
      this.type = type;
    }

    static typeFromTelegram(chatType: string): number {
      switch (chatType) {
        case 'private': return Chat.TYPE_PRIVATE;
        case 'group': return Chat.TYPE_GROUP;
        case 'supergroup': return Chat.TYPE_SUPERGROUP;
        case 'channel': return Chat.TYPE_CHANNEL;
        default: return Chat.TYPE_CHANNEL;
      }
    }
}

export class Topic {
    topicId: number
    topicName: string

    constructor(topicId: number, topicName: string) {
      this.topicId = topicId;
      this.topicName = topicName;
    }
}

