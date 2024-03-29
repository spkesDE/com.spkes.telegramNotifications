import Homey from 'homey';
import {Telegraf} from 'telegraf';
import Question from "./question";
import Chat from "./chat";
import SendMessage from "./flow/actions/sendMessage";
import SendImage from "./flow/actions/sendImage";
import ReceiveMessage from "./flow/triggers/receiveMessage";
import SendTagImage from "./flow/actions/sendTagImage";
import SendImageWithMessage from "./flow/actions/sendImageWithMessage";
import SendTagImageWithMessage from "./flow/actions/sendTagImageWithMessage";
import SendQuestion from "./flow/actions/sendQuestion";
import HandleQuestions from "./flow/triggers/handleQuestions";
import HandleNewUsers from "./flow/triggers/handleNewUsers";
import SendSilentMessage from "./flow/actions/sendSilentMessage";
import {BL} from "betterlogiclibrary";
import ReceiveMessageFromChat from "./flow/triggers/receiveMessageFromChat";
import DeleteById from "./flow/actions/deleteById";
import DeleteByIdAndChatId from "./flow/actions/deleteByIdAndChatId";
import DeleteByCustomId from "./flow/actions/deleteByCustomId";
import HandleTopics from "./flow/triggers/handleTopics";
import ReceiveMessageFromTopic from './flow/triggers/receiveMessageFromTopic';

export class TelegramNotifications extends Homey.App {

    public chats: Chat[] = [];
    public questions: Question[] = [];
    public bot: Telegraf<any> | null = null;
    private token: string | null = null;
    private startSuccess: boolean = true;
    private registerFlowHandler: boolean = false;
    customIdMessages: { message_id: number; chat_id: number; customId: string; }[] = [];

    async onInit() {
        this.token = await this.homey.settings.get('bot-token');
        this.homey.settings.on('set', key => {
            if (key !== 'logs') this.debug("Updated Settings for " + key);
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
            if (key === 'useBll')
                this.startBll();
        });
        this.startBot();
        this.startBll().then();
    }

    private startBot() {
        this.log('Telegram Notifications app is starting...');
        if (this.token === null || this.token === '' || this.token.length < 43) {
            this.log('Telegram Notifications has no token. Please enter a Token in the Settings!');
            this.changeBotState(false);
            return;
        }
        this.bot = new Telegraf(this.token);
        this.loadSavedArrays();

        if (!this.registerFlowHandler) {
            this._initializeFlowCards();
            this.registerFlowHandler = true;
        }

        this.bot.catch(this.error);
        this.bot.launch().then().catch(this.error);
        this.bot.telegram.getMe().catch(() => this.changeBotState(false));
        if (!this.startSuccess) {
            this.log('Failed to start. Token most likely wrong.');
        } else {
            this.log('Telegram Notifications app is initialized.');
            this.bot.telegram.setMyCommands([{
                "command": "start",
                "description": "Start using the bot."
            }, {
                "command": "registertopic",
                "description": "Register a topic."
            }]).catch(this.error);
            this.debug('Debug => Total-Users ' + this.chats.length + ', Question-Size: ' + this.questions.length +
                ', Log-Size: ' + this.getLogSize() + ' and start was ' + (this.startSuccess ? 'successful' : 'unsuccessful'));
            this.changeBotState(true);
        }
    }

    private _initializeFlowCards() {
        this.debug('Initialize Flow cards...');
        //Trigger cards
        new HandleNewUsers(this, this.homey.flow.getTriggerCard('newUser'));
        new ReceiveMessage(this, this.homey.flow.getTriggerCard('receiveMessage'));
        new ReceiveMessageFromChat(this, this.homey.flow.getTriggerCard('receive-message-from-chat'));
        new ReceiveMessageFromTopic(this, this.homey.flow.getTriggerCard('receive-message-from-topic'));
        new HandleQuestions(this);
        new HandleTopics(this);

        //Action Cards
        new SendMessage(this, this.homey.flow.getActionCard('sendNotification'));
        new SendSilentMessage(this, this.homey.flow.getActionCard('send-message-silent'));
        new SendQuestion(this, this.homey.flow.getActionCard('send-a-question'));
        new SendQuestion(this, this.homey.flow.getActionCard('send-a-question-with-custom-text'));
        new SendQuestion(this, this.homey.flow.getActionCard('send-a-question-with-custom-id'));
        new SendQuestion(this, this.homey.flow.getActionCard('send-a-question-with-optionals'));

        new DeleteById(this, this.homey.flow.getActionCard('delete-message-with-id'))
        new DeleteByIdAndChatId(this, this.homey.flow.getActionCard('delete-message-with-id-and-chatId'))
        new DeleteByCustomId(this, this.homey.flow.getActionCard('delete-message-with-customId'))

        new SendImage(this, this.homey.flow.getActionCard('send-a-image'));
        new SendImageWithMessage(this, this.homey.flow.getActionCard('send-a-image-with-message'));
        new SendTagImage(this, this.homey.flow.getActionCard('send-a-image-with-tag'));
        new SendTagImageWithMessage(this, this.homey.flow.getActionCard('send-a-image-with-message-and-tag'));
        this.debug('Flow cards initialized');
    }

    //region Logging
    //0 Info, 1 Error, 2 Debug
    public log(message: any) {
        this.writeLog(message, 0).then();
        this.homey.log(message);
    }

    public debug(message: any) {
        this.writeLog(message, 2).then();
        this.homey.log(message);
    }

    public error(message: any) {
        this.writeLog(message, 1).then();
        this.homey.error(message);
    }

    private async writeLog(message: any, type: number = 0) {
        if (message instanceof Error) {
            message = message.stack;
        }
        let oldLogs = this.homey.settings.get('logs');
        if (oldLogs === null || oldLogs === undefined || oldLogs === '') oldLogs = '[]';
        const newMessage: JSON = <JSON><unknown>{date: new Date().toLocaleString('en-GB'), type: type, message};
        const savedHistory = JSON.parse(oldLogs);
        if (savedHistory.length >= 100) savedHistory.pop();
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
        this.homey.api.realtime('com.spkes.telegram.state', {state: bool});
    }

    private loadSavedArrays() {
        this.debug("Loading Data...")
        this.loadUsers();
        this.loadQuestions();
    }

    getQuestion(questionId: string): Question | undefined {
        return this.questions.find((q) => q.UUID === questionId);
    }

    loadQuestions() {
        this.debug("Loading Questions..")
        if (this.homey.settings.get('questions') !== null) {
            this.questions = JSON.parse(this.homey.settings.get('questions')) as Question[];
        }
    }

    private loadUsers() {
        this.debug("Loading Users..")
        if (this.homey.settings.get('users') !== null) {
            let jsonString: string = this.homey.settings.get('users').replaceAll(/userId/g, 'chatId');
            this.chats = JSON.parse(jsonString) as Chat[];
        }
    }

    //endregion

    private async startBll() {
        if (await this.homey.settings.get('useBll') ?? false) {
            this.log("Using BLL, starting initialization");
            await BL.init({homey: this.homey}).catch(this.error);
        } else {
            this.log("BLL NOT used");
        }
    }
}

module.exports = TelegramNotifications;
