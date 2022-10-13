import {FlowCardAction} from 'homey';
import {TelegramNotifications} from '../../app';
import Question from "../../question";

export default class SendQuestion {
    constructor(app: TelegramNotifications, card: FlowCardAction) {
        card.registerRunListener(async (args) => {
            let question = app.getQuestion(args.question.id);
            if (question === undefined) {
                app.error('Question not found')
                throw new Error('Question with UUID ' + args.question.id + ' not found');
            }
            if (app.bot === undefined || app.bot === null) {
                app.error('Bot has failed to initialize')
                throw new Error('Bot has failed to initialize');
            }
            await Question.createMessage(question, app.bot, args.user.id)
        });
        card.registerArgumentAutocompleteListener(
            'user',
            async (query) => {
                const results: any = [];
                app.users.forEach((user) => {
                    results.push({
                        name: user.chatName,
                        id: user.userId,
                    });
                });
                return results.filter((result: any) => {
                    return result.name.toLowerCase().includes(query.toLowerCase());
                });
            },
        );
        card.registerArgumentAutocompleteListener(
            'question',
            async (query) => {
                const results: any = [];
                app.questions.forEach((question) => {
                    results.push({
                        name: question.question,
                        id: question.UUID,
                    });
                });
                return results.filter((result: any) => {
                    return result.name.toLowerCase().includes(query.toLowerCase());
                });
            },
        );
    }
}
