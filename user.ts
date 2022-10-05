export class User {
    userId: number
    chatName: string

    constructor(userId: number, chatName: string) {
        this.chatName = chatName;
        this.userId = userId;
    }
}
