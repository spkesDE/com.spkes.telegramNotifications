export interface Topic {
  topicId: number
  topicName: string
}

export interface Chat {
  chatId: number
  chatName: string
  type?: number
  topics?: Topic[]
}

export interface LogEntry {
  message: string
  type: number
  date: string
}

export interface QuestionModel {
  question: string
  UUID: string
  buttons: string[]
  keepButtons: boolean
  checkmark: boolean
  disable_notification: boolean
  columns: number
}
