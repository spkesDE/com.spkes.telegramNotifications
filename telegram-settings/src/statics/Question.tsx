export interface Question {
    question: string;
    UUID: string;
    buttons: string[];
    keepButtons: boolean;
    checkmark: boolean;
    disable_notification: boolean;
    columns: number;
}

