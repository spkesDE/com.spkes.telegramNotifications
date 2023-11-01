import {App as HomeyApp} from 'homey';
import {Bot} from 'grammy';
import Question from './question';
import Chat from './chat';
import SendMessage from './flow/actions/sendMessage';
import SendImage from './flow/actions/sendImage';
import ReceiveMessage from './flow/triggers/receiveMessage';
import SendTagImage from './flow/actions/sendTagImage';
import SendImageWithMessage from './flow/actions/sendImageWithMessage';
import SendTagImageWithMessage from './flow/actions/sendTagImageWithMessage';
import SendQuestion from './flow/actions/sendQuestion';
import HandleQuestions from './flow/triggers/handleQuestions';
import HandleNewUsers from './flow/triggers/handleNewUsers';
import SendSilentMessage from './flow/actions/sendSilentMessage';
import {BL} from 'betterlogiclibrary';
import ReceiveMessageFromChat from './flow/triggers/receiveMessageFromChat';
import DeleteById from './flow/actions/deleteById';
import DeleteByIdAndChatId from './flow/actions/deleteByIdAndChatId';
import DeleteByCustomId from './flow/actions/deleteByCustomId';
import HandleTopics from './flow/triggers/handleTopics';
import ReceiveMessageFromTopic from './flow/triggers/receiveMessageFromTopic';
import {ParseMode} from 'grammy/types';
import {defaultQuestions} from './assets/defaultQuestions';
import {apiThrottler} from '@grammyjs/transformer-throttler';


export class TelegramNotifications extends HomeyApp {

    public chats: Chat[] = [];
    public questions: Question[] = defaultQuestions;
    public bot: Bot | null = null;
    private token: string | null = null;
    private startSuccess = true;
    private registerFlowHandler = false;
    customIdMessages: { message_id: number; chat_id: number; customId: string; }[] = [];
    markdown: ParseMode | undefined = undefined;
    disableWebPagePreview = false;

    async onInit() {
      this.token = await this.homey.settings.get('bot-token');
      this.homey.settings.on('set', key => {
        if (key !== 'logs') {
          this.debug('Updated Settings for ' + key);
        }
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
        if (key === 'users') {
          this.loadUsers();
        }
        if (key === 'useBll') {
          this.startBll();
        }
        if (key === 'markdown') {
          const markdown = this.homey.settings.get('markdown');
          if (markdown === 'none') {
            this.markdown = undefined;
          } else {
            this.markdown = markdown;
          }
        }
        if (key === 'disableWebPagePreview') {
          this.disableWebPagePreview = this.homey.settings.get('disableWebPagePreview') ?? false;
        }

      });

      this.loadSettings();
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
      this.bot = new Bot(this.token);

      const throttler = apiThrottler();
      this.bot.api.config.use(throttler);

      this.loadSavedArrays();

      if (!this.registerFlowHandler) {
        this._initializeFlowCards();
        this.registerFlowHandler = true;
      }

      this.bot.catch(this.error);
      this.bot.start().then().catch(this.error);
      this.bot.init().catch(() => this.changeBotState(false));
      if (!this.startSuccess) {
        this.log('Failed to start. Token most likely wrong.');
      } else {
        this.log('Telegram Notifications app is initialized.');
        this.bot.api.getMyCommands()
          .then((r) => {
            const prevSize = r.length;
            if (!r.some(e => e.command === 'start')) {
              r.push({
                'command': 'start',
                'description': this.homey.__('commands.start')
              });
            }
            if (!r.some(e => e.command === 'registertopic')) {
              r.push({
                'command': 'registertopic',
                'description': this.homey.__('commands.registertopic')
              });
            }
            if (this.bot != null && prevSize !== r.length) {
              this.bot.api.setMyCommands(r).catch(this.error);
            }
          })
          .catch(this.error);
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

      new DeleteById(this, this.homey.flow.getActionCard('delete-message-with-id'));
      new DeleteByIdAndChatId(this, this.homey.flow.getActionCard('delete-message-with-id-and-chatId'));
      new DeleteByCustomId(this, this.homey.flow.getActionCard('delete-message-with-customId'));

      new SendImage(this, this.homey.flow.getActionCard('send-a-image'));
      new SendImageWithMessage(this, this.homey.flow.getActionCard('send-a-image-with-message'));
      new SendTagImage(this, this.homey.flow.getActionCard('send-a-image-with-tag'));
      new SendTagImageWithMessage(this, this.homey.flow.getActionCard('send-a-image-with-message-and-tag'));
      this.debug('Flow cards initialized');
    }

    //region Logging
    //0 Info, 1 Error, 2 Debug
    public log(message: unknown) {
      this.writeLog(message, 0).then();
      this.homey.log(message);
    }

    public debug(message: unknown) {
      this.writeLog(message, 2).then();
      this.homey.log(message);
    }

    public error(message: unknown) {
      this.writeLog(message, 1).then();
      this.homey.error(message);
    }

    private async writeLog(message: unknown, type = 0) {
      if (message instanceof Error) {
        message = message.stack;
      }
      let oldLogs = this.homey.settings.get('logs');
      if (oldLogs === null || oldLogs === undefined || oldLogs === '') {
        oldLogs = '[]';
      }
      const newMessage: JSON = <JSON><unknown>{
        date: new Date().toLocaleString('en-GB'), type: type, message
      };
      const savedHistory = JSON.parse(oldLogs);
      if (savedHistory.length >= 100) {
        savedHistory.pop();
      }
      savedHistory.unshift(newMessage);
      this.homey.settings.set('logs', JSON.stringify(savedHistory));
    }

    private getLogSize(): number {
      const oldLogs = this.homey.settings.get('logs');
      const savedHistory = JSON.parse(oldLogs);
      return savedHistory.length;
    }

    //endregion

    //region Utils
    private changeBotState(bool: boolean) {
      this.startSuccess = bool;
      this.homey.settings.set('bot-running', bool);
      this.homey.api.realtime('com.spkes.telegram.state', {
        state: bool
      });
    }

    loadQuestions(onStart = false) {
      this.debug('Loading Questions..');
      if (this.homey.settings.get('questions') !== null) {
        this.questions = JSON.parse(this.homey.settings.get('questions')) as Question[];
        if (this.questions.length === 0 && onStart) {
          this.questions = defaultQuestions;
          this.homey.settings.set('questions', JSON.stringify(this.questions));
        }
      }
    }

    getQuestion(questionId: string): Question | undefined {
      return this.questions.find((q) => q.UUID === questionId);
    }

    private loadSavedArrays() {
      this.debug('Loading Data...');
      this.loadUsers();
      this.loadQuestions(true);
    }

    private loadUsers() {
      this.debug('Loading Users..');
      if (this.homey.settings.get('users') !== null) {
        const jsonString: string = this.homey.settings.get('users').replaceAll(/userId/g, 'chatId');
        this.chats = JSON.parse(jsonString) as Chat[];
      }
    }

    //endregion

    private async startBll() {
      if (await this.homey.settings.get('useBll') ?? false) {
        this.log('Using BLL, starting initialization');
        await BL.init({
          homey: this.homey
        }).catch(this.error);
      } else {
        this.log('BLL NOT used');
      }
    }

    private loadSettings() {
      const markdown = this.homey.settings.get('markdown');
      if (markdown === 'none') {
        this.markdown = undefined;
      } else {
        this.markdown = markdown;
      }
    }
}

module.exports = TelegramNotifications;
