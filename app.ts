import Homey from 'homey';
import {Telegraf} from 'telegraf';
import Question from "./question";
import User from "./user";
import SendNotification from "./flow/actions/sendNotification";
import SendImage from "./flow/actions/sendImage";
import ReceiveMessage from "./flow/triggers/receiveMessage";
import SendTagImage from "./flow/actions/sendTagImage";
import SendImageWithMessage from "./flow/actions/sendImageWithMessage";
import SendTagImageWithMessage from "./flow/actions/sendTagImageWithMessage";
import SendQuestion from "./flow/actions/sendQuestion";
import HandleQuestions from "./flow/triggers/handleQuestions";
import HandleNewUsers from "./flow/triggers/handleNewUsers";

export class TelegramNotifications extends Homey.App {

    public users: User[] = [];
    public questions: Question[] = [];
    public bot: Telegraf<any> | null = null;
    private token: string | null = null;
    private startSuccess: boolean = true;
    private registerFlowHandler: boolean = false;

    async onInit() {
        this.token = await this.homey.settings.get('bot-token');
        this.homey.settings.on('set', key => {
            if (key === 'bot-token') {
                this.token = this.homey.settings.get('bot-token');
                if (this.bot === null || !this.startSuccess) {
                    this.startBot();
                    this.changeBotState(true);
                } else {
                    this.bot.stop();
                    this.changeBotState(false);
                    this.bot = null;
                    this.startBot();
                }
            }
            if (key === 'users')
                this.loadUsers();
        });
        await this.startBot();
    }

    private async startBot() {
        this.log('Telegram Notifications app is starting...');
        if (this.token === null || this.token === '' || this.token.length < 43) {
            this.log('Telegram Notifications has no token. Please enter a Token in the Settings!');
            this.changeBotState(false);
            return;
        }
        this.bot = new Telegraf(this.token);
        this.loadSavedArrays();

        if(!this.registerFlowHandler){
            this._initializeFlowCards();
            this.registerFlowHandler = true;
        }

        this.bot.catch(this.error);
        await this.bot.launch().catch(this.error);
        await this.bot.telegram.getMe().catch(() => this.changeBotState(false));
        if (!this.startSuccess) {
            this.log('Failed to start. Token most likely wrong.');
        } else {
            this.log('Telegram Notifications app is initialized.');
            await this.bot.telegram.setMyCommands([{"command": "start", "description": "Start using the bot."}])
            this.homey.log('Debug => Total-Users ' + this.users.length + ', Question-Size: ' + this.questions.length +
                ', Log-Size: ' + this.getLogSize() + ' and start was ' + (this.startSuccess ? 'successful' : 'unsuccessful'));
            this.changeBotState(true);
        }
    }

    private _initializeFlowCards(){
        this.log('Initialize Flow cards...');
        //Trigger cards
        new HandleNewUsers(this, this.homey.flow.getTriggerCard('newUser'));
        new ReceiveMessage(this, this.homey.flow.getTriggerCard('receiveMessage'));
        new HandleQuestions(this);

        //Action Cards
        new SendNotification(this, this.homey.flow.getActionCard('sendNotification'));
        new SendQuestion(this, this.homey.flow.getActionCard('send-a-question'));

        new SendImage(this, this.homey.flow.getActionCard('send-a-image'));
        new SendImageWithMessage(this, this.homey.flow.getActionCard('send-a-image-with-message'));
        new SendTagImage(this, this.homey.flow.getActionCard('send-a-image-with-tag'));
        new SendTagImageWithMessage(this, this.homey.flow.getActionCard('send-a-image-with-message-and-tag'));
        this.log('Flow cards initialized');
    }

    //region Logging
    public log(message: any) {
        this.writeLog(message).then();
        this.homey.log(message);
    }

    public error(message: any) {
        this.writeLog(message).then();
        this.homey.error(message);
    }

    private async writeLog(message: any) {
        if(message instanceof Error){
            message = message.stack;
        }
        let oldLogs = this.homey.settings.get('logs');
        if (oldLogs === null || oldLogs === undefined || oldLogs === '') oldLogs = '[]';
        const newMessage: JSON = <JSON><unknown>{date: new Date().toLocaleString(), message};
        const savedHistory = JSON.parse(oldLogs);
        if (savedHistory.length >= 15) savedHistory.pop();
        savedHistory.unshift(newMessage);
        this.homey.settings.set('logs', JSON.stringify(savedHistory));
    }

    private getLogSize(): number {
        let oldLogs = this.homey.settings.get('logs');
        const savedHistory = JSON.parse(oldLogs);
        return savedHistory.length
    }

    //endregion

    //region Utils
    private changeBotState(bool: boolean) {
        this.startSuccess = bool;
        this.homey.settings.set('bot-running', bool);
    }

    private loadSavedArrays() {
        this.loadUsers();
        this.loadQuestions();
    }

    getQuestion(questionId: string): Question | undefined {
        return this.questions.find((q) => q.UUID === questionId);
    }

    loadQuestions() {
        if (this.homey.settings.get('questions') !== null) {
            this.questions = JSON.parse(this.homey.settings.get('questions')) as Question[];
        }
    }

    private loadUsers() {
        if (this.homey.settings.get('users') !== null) {
            this.users = JSON.parse(this.homey.settings.get('users')) as User[];
        }
    }
    //endregion

}

module.exports = TelegramNotifications;
