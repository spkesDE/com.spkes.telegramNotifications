export interface Question {
    question: string;
    UUID: string;
    buttons: string[];
    keepButtons: boolean;
    disable_notification: boolean;
    columns: number;
}

