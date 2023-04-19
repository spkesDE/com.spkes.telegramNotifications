export interface Chat {
    chatId: number
    chatName: string
    type?: number
    topics?: Topics[];
}

export interface Topics {
    topicId: number
    topicName: string
}

