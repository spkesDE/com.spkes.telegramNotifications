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
import SendLocation from './flow/actions/sendLocation';
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
import PrivacyCommand from "./privacyCommand";
import SendMessageById from "./flow/actions/sendMessageById";
import SendVideo from "./flow/actions/sendVideo";
import SendVideoWithMessage from "./flow/actions/sendVideoWithMessage";


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
    privacyCommand: boolean = false;
    private debugMode: boolean = false;
    public readonly handleError = (message: unknown) => this.error(message);

    async onInit() {
      this.token = await this.homey.settings.get('bot-token');
      this.homey.settings.on('set', key => {
        if (key !== 'logs') {
          this.debug('Updated Settings for ' + key);
        }
        if (key === 'bot-token') {
          this.token = this.homey.settings.get('bot-token');
          void this.restartBot();
        }
        if (key === 'users') {
          this.loadUsers();
        }
        if (key === 'useBll') {
          void this.startBll();
        }
          if (key === 'privacyCommand') {
              this.privacyCommand = this.homey.settings.get('privacyCommand') ?? false;
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
      await this.startBot();
      await this.startBll();
    }

    private async restartBot() {
      if (this.bot !== null) {
        this.bot.stop();
        this.bot = null;
      }
      this.changeBotState(false);
      await this.startBot();
    }

    private async startBot() {
      this.log('Telegram Notifications app is starting...');
      if (this.token === null || this.token === '' || this.token.length < 43) {
        this.log('Telegram Notifications has no token. Please enter a Token in the Settings!');
        this.changeBotState(false);
        this.bot = null;
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

      this.bot.catch((err) => {
        this.error(err);
      });

      try {
        await this.bot.init();
        this.log('Telegram Notifications app is initialized.');
        await this.registerCommands();
        new PrivacyCommand(this);
        this.debug('Debug => Total-Users ' + this.chats.length + ', Question-Size: ' + this.questions.length +
                ', Log-Size: ' + this.getLogSize() + ' and start was ' + (this.startSuccess ? 'successful' : 'unsuccessful'));
        this.changeBotState(true);
        void this.bot.start().catch((err) => {
          this.error(err);
          this.changeBotState(false);
        });
      } catch (err) {
        this.error(err);
        this.log('Failed to start. Token most likely wrong.');
        this.changeBotState(false);
        this.bot = null;
      }
    }

    private async registerCommands() {
      if (this.bot == null) {
        return;
      }

      const commands = await this.bot.api.getMyCommands();
      const prevSize = commands.length;
      if (!commands.some((command) => command.command === 'start')) {
        commands.push({
          command: 'start',
          description: this.homey.__('commands.start')
        });
      }
      if (!commands.some((command) => command.command === 'registertopic')) {
        commands.push({
          command: 'registertopic',
          description: this.homey.__('commands.registertopic')
        });
      }
      if (prevSize !== commands.length) {
        await this.bot.api.setMyCommands(commands);
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
        new SendMessageById(this, this.homey.flow.getActionCard('send-notification-with-chat-id'));
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
      new SendVideo(this, this.homey.flow.getActionCard('send-a-video'));
      new SendVideoWithMessage(this, this.homey.flow.getActionCard('send-a-video-with-message'));
      new SendTagImage(this, this.homey.flow.getActionCard('send-a-image-with-tag'));
      new SendTagImageWithMessage(this, this.homey.flow.getActionCard('send-a-image-with-message-and-tag'));

        new SendLocation(this, this.homey.flow.getActionCard('send-location'));
        new SendLocation(this, this.homey.flow.getActionCard('send-location-as-one'));

      this.debug('Flow cards initialized');
    }

    //region Logging
    //0 Info, 1 Error, 2 Debug
    public log(message: unknown) {
      this.writeLog(message, 0).then();
      this.homey.log(message);
    }

    public debug(message: unknown) {
        if (!this.debugMode) return
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
      if (oldLogs === null || oldLogs === undefined || oldLogs === '') {
        return 0;
      }
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
      if (this.homey.settings.get('useBll') ?? false) {
        this.log('Using BLL, starting initialization');
        await BL.init({
          homey: this.homey
        }).catch((err) => {
          this.error(err);
        });
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
        this.disableWebPagePreview = this.homey.settings.get('disableWebPagePreview') ?? false;
        this.privacyCommand = this.homey.settings.get('privacyCommand') ?? false;
    }

    public createSendOptions(opts?: {
      topic?: number,
      disableNotification?: boolean,
      includeTextFormatting?: boolean,
    }) {
      const sendOptions: {
        disable_notification?: boolean,
        message_thread_id?: number,
        parse_mode?: ParseMode,
        link_preview_options?: {
          is_disabled: boolean,
        },
      } = {};

      if (opts?.disableNotification !== undefined) {
        sendOptions.disable_notification = opts.disableNotification;
      }
      if (opts?.topic !== undefined) {
        sendOptions.message_thread_id = opts.topic;
      }
      if (opts?.includeTextFormatting) {
        sendOptions.parse_mode = this.markdown;
        sendOptions.link_preview_options = {
          is_disabled: this.disableWebPagePreview
        };
      }

      return sendOptions;
    }
}

module.exports = TelegramNotifications;
