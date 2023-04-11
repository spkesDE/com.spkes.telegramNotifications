export default class User {
    userId: number
    chatName: string
    type?: number

    constructor(userId: number, chatName: string, type: number) {
        this.chatName = chatName;
        this.userId = userId;
        this.type = type;
    }
}
