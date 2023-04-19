export default class Chat {
    chatId: number
    chatName: string
    type?: number
    topics: Topic[] = [];

    constructor(chatId: number, chatName: string, type: number) {
        this.chatName = chatName;
        this.chatId = chatId;
        this.type = type;
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

