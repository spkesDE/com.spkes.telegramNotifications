import Homey from 'homey';
import {Telegraf, Markup} from 'telegraf';
import {Question} from "./question";
import {User} from "./user";


class TelegramNotifications extends Homey.App {

    users: User[] = [];
    questions: Question[] = [];
    bot: Telegraf<any> | null = null;
    token: string | null = null;
    private startSuccess: boolean = true;
    private flowsRegistered: boolean = false;

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

        //HandleStartCommand
        this.handleStartCommand();
        //Handle Questions
        this.handleQuestions();
        // Flows
        if (!this.flowsRegistered) {
            this.sendNotificationActionFlow();
            this.receiveMessageTriggerFlow();
            this.sendAImageActionFlow();
            this.sendAImageWithTagActionFlow();
            this.sendAImageWithMessageActionFlow();
            this.sendAImageWithMessageAndTagActionFlow();
            this.sendAQuestionFlow();
            this.flowsRegistered = true;
        }
        this.bot.catch(this.error);
        await this.bot.telegram.setMyCommands([{
            "command": "start",
            "description": "Start using the bot."}])
        await this.bot.launch().catch(this.error);
        // eslint-disable-next-line no-return-assign
        await this.bot.telegram.getMe().catch(() => this.changeBotState(false));
        if (!this.startSuccess) {
            this.log('Failed to start. Token most likely wrong.');
        } else {
            this.log('Telegram Notifications app is initialized.');
            this.homey.log('Debug => Total-Users ' + this.users.length + ', Question-Size: ' + this.questions.length +
                ', Log-Size: ' + this.getLogSize() + ' and start was ' + (this.startSuccess ? 'successful' : 'unsuccessful'));
            this.changeBotState(true);
        }
    }

    //region Question Handling
    private handleQuestions(): void {
        if (this.bot == null) return;

        //Once the Setting Question is set by the app settings in will reload it to the memory
        this.homey.settings.on('set', (key) => {
            if (key == 'questions')
                this.loadQuestions()
        })

        //Getting Trigger Flows
        const receiveQuestionAnswerTrigger = this.homey.flow.getTriggerCard('receive-question-answer');
        const receiveQuestionAnswerWithAnswerTrigger = this.homey.flow.getTriggerCard('receive-question-answer-with-answer');


        //region Autocomplete
        receiveQuestionAnswerTrigger.registerArgumentAutocompleteListener(
            'question',
            async (query) => {
                const results: any = [];
                this.questions.forEach((question) => {
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
        receiveQuestionAnswerWithAnswerTrigger.registerArgumentAutocompleteListener(
            'question',
            async (query) => {
                const results: any = [];
                this.questions.forEach((question) => {
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
        //endregion

        //region State checking
        receiveQuestionAnswerTrigger.registerRunListener(async (args, state) => {
            return args.question.id === state.uuid;
        });

        receiveQuestionAnswerWithAnswerTrigger.registerRunListener(async (args, state) => {
            return args.question.id === state.uuid && args.answer == state.answer;
        });
        //endregion

        //This event will trigger once an inline button is pressed
        this.bot.on('callback_query', async (ctx) => {
            await ctx.telegram.answerCbQuery(ctx.callbackQuery.id);
            await ctx.answerCbQuery();
            await ctx.telegram.editMessageReplyMarkup(ctx.callbackQuery.message.chat.id, ctx.callbackQuery.message.message_id, []);
            //Todo Get Question, Trigger Flow, Pizza, Remove Question
            if (ctx.callbackQuery.data == 'user-add') return;
            let questionId = ctx.callbackQuery.data.split('.')[0]
            let answerId = ctx.callbackQuery.data.split('.')[1]
            let question = this.getQuestion(questionId);
            if (question === undefined) {
                this.error('Question not found"')
                throw new Error('Question with UUID ' + questionId + ' not found');
            }
            // https://apps.developer.homey.app/the-basics/flow/arguments#flow-state
            //Building Token
            let token = {
                question: question.question,
                answer: Question.getAnswer(question, answerId),
                from: ctx.callbackQuery.from.first_name !== undefined ? ctx.callbackQuery.from.first_name : 'undefined',
                username: ctx.callbackQuery.from.username !== undefined ? ctx.callbackQuery.from.username : 'undefined',
                chat: ctx.chat.type === 'private' ? ctx.chat.first_name : ctx.chat.title,
                chatType: ctx.chat.type,
            };

            //Trigger Card with given state
            let state =  { uuid: question.UUID, answer: Question.getAnswer(question, answerId)};
            receiveQuestionAnswerTrigger.trigger(token, state).catch(this.error).then();
            receiveQuestionAnswerWithAnswerTrigger.trigger(token, state).catch(this.error).then();
        });
    }

    private getQuestion(questionId: string): Question | undefined {
        return this.questions.find((q) => q.UUID === questionId);
    }

    private sendAQuestionFlow() {
        const actionCard = this.homey.flow.getActionCard('send-a-question');
        actionCard.registerRunListener(async (args) => {
            let question = this.getQuestion(args.question.id);
            if (question === undefined) {
                this.error('Question not found')
                throw new Error('Question with UUID ' + args.question.id + ' not found');
            }
            if (this.bot === undefined || this.bot === null) {
                this.error('Bot has failed to initialize')
                throw new Error('Bot has failed to initialize');
            }
            await Question.createMessage(question, this.bot, args.user.id)
        });
        actionCard.registerArgumentAutocompleteListener(
            'user',
            async (query) => {
                const results: any = [];
                this.users.forEach((user) => {
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
        actionCard.registerArgumentAutocompleteListener(
            'question',
            async (query) => {
                const results: any = [];
                this.questions.forEach((question) => {
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

    //endregion

    //region /start command
    private handleStartCommand(): void {
        if (this.bot == null) return;
        this.bot.start((ctx) => {
            let usePassword = this.homey.settings.get('use-password')
            if (usePassword !== null && usePassword) {
                let enteredPassword = ctx.message.text.split(' ')[1] ?? '';
                let password = this.homey.settings.get('password')
                if (password === null || password !== enteredPassword) {
                    ctx.reply("Wrong password.");
                    return;
                }
            }

            ctx.replyWithMarkdown(
                'Welcome to the Homey Telegram Bot!'
                + '\n\n'
                + 'Press the button below to register yourself!',
                Markup.inlineKeyboard([
                    Markup.callbackButton('Register this Telegram chat!', 'user-add'),
                ], {columns: 1}).extra(),
            ).catch(this.error);
            this.homey.flow.getTriggerCard('newUser').trigger({
                from: ctx.chat.type === 'private' ? ctx.chat.first_name : ctx.chat.title,
                username: ctx.chat.type === 'private' ? ctx.chat.username : ctx.chat.title,
                chatType: ctx.chat.type,
            })
                .catch(this.error)
                .then();
        }).catch(this.error);
        this.bot.action('user-add', (ctx) => {
            let user: User | null = null;
            if (ctx.chat.type === 'group' || ctx.chat.type === 'supergroup') {
                user = new User(ctx.chat?.id ?? 0, ctx.chat?.title ?? 'Error');
            } else if (ctx.chat.type === 'private') {
                user = new User(ctx.chat?.id ?? 0, ctx.chat?.first_name ?? 'Error');
            }
            if (user !== null && user.userId !== 0) {
                if (!this.users.some((u) => u.userId === user?.userId)) {
                    this.users.push(user);
                    ctx.reply('👍').catch(this.error);
                    this.homey.settings.set('users', JSON.stringify(this.users));
                } else {
                    ctx.reply('👎').catch(this.error);
                    ctx.reply('Already in the user list!').catch(this.error);
                }
            } else {
                ctx.reply('Something went wrong! Can\'t get the User Id').catch(this.error);
            }
        }).catch(this.error);
    }

    //endregion

    //region [Flows] Image, Send, Received
    private sendAImageActionFlow() {
        const sendNotificationCard = this.homey.flow.getActionCard('send-a-image');
        sendNotificationCard.registerRunListener((args) => {
            if (this.bot != null) {
                if (this.validateURL(args.url)) {
                    this.bot.telegram.sendPhoto(args.user.id, {filename: "", url: args.url})
                        .catch(this.error)
                        .then();
                } else {
                    this.error('ERR_INVALID_PROTOCOL: Protocol "http:" not supported. Expected "https:"')
                    throw new Error('ERR_INVALID_PROTOCOL: Protocol "http:" not supported. Expected "https:"')
                }
            } else {
                this.error('Failed to start bot. Token most likely wrong.')
                throw new Error('Failed to start bot. Token most likely wrong.')
            }
        });
        sendNotificationCard.registerArgumentAutocompleteListener(
            'user',
            async (query) => {
                const results: any = [];
                this.users.forEach((user) => {
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
    }

    private sendAImageWithMessageActionFlow() {
        const sendNotificationCard = this.homey.flow.getActionCard('send-a-image-with-message');
        sendNotificationCard.registerRunListener((args) => {
            if (this.bot != null) {
                if (this.validateURL(args.url)) {
                    this.bot.telegram.sendPhoto(args.user.id, {filename: "", url: args.url}, {caption: args.message})
                        .catch(this.error)
                        .then();
                } else {
                    this.error('ERR_INVALID_PROTOCOL: Protocol "http:" not supported. Expected "https:"')
                    throw new Error('ERR_INVALID_PROTOCOL: Protocol "http:" not supported. Expected "https:"')
                }
            } else {
                this.error('Failed to start bot. Token most likely wrong.')
                throw new Error('Failed to start bot. Token most likely wrong.')
            }
        });
        sendNotificationCard.registerArgumentAutocompleteListener(
            'user',
            async (query) => {
                const results: any = [];
                this.users.forEach((user) => {
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
    }

    private sendAImageWithTagActionFlow() {
        const sendAImageWithTagCard = this.homey.flow.getActionCard('send-a-image-with-tag');
        sendAImageWithTagCard.registerRunListener((args) => {
            if (this.bot != null) {
                this.bot.telegram.sendPhoto(args.user.id, {filename: "", url: args.droptoken.cloudUrl})
                    .catch(this.error)
                    .then();
            }
        });
        sendAImageWithTagCard.registerArgumentAutocompleteListener(
            'user',
            async (query) => {
                const results: any = [];
                this.users.forEach((user) => {
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
    }

    private sendAImageWithMessageAndTagActionFlow() {
        const sendAImageWithMessageAndTagCard = this.homey.flow.getActionCard('send-a-image-with-message-and-tag');
        sendAImageWithMessageAndTagCard.registerRunListener((args) => {
            if (this.bot != null) {
                this.bot.telegram.sendPhoto(args.user.id, {
                    filename: "",
                    url: args.droptoken.cloudUrl
                }, {caption: args.message})
                    .catch(this.error)
                    .then();
            }
        });
        sendAImageWithMessageAndTagCard.registerArgumentAutocompleteListener(
            'user',
            async (query) => {
                const results: any = [];
                this.users.forEach((user) => {
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
    }

    private sendNotificationActionFlow() {
        const sendNotificationCard = this.homey.flow.getActionCard('sendNotification');
        sendNotificationCard.registerRunListener((args) => {
            if (this.bot != null) {
                this.bot.telegram.sendMessage(args.user.id, args.message)
                    .catch(this.error)
                    .then();
            }
        });
        sendNotificationCard.registerArgumentAutocompleteListener(
            'user',
            async (query) => {
                const results: any = [];
                this.users.forEach((user) => {
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
    }

    private receiveMessageTriggerFlow() {
        const receiveMessageCard = this.homey.flow.getTriggerCard('receiveMessage');
        if (this.bot != null) {
            this.bot.on('text', (ctx) => {
                if (ctx.message.text === undefined) return;
                const token = {
                    message: ctx.message.text,
                    from: ctx.message.from.first_name !== undefined ? ctx.message.from.first_name : 'undefined',
                    username: ctx.message.from.username !== undefined ? ctx.message.from.username : 'undefined',
                    chat: ctx.chat.type === 'private' ? ctx.chat.first_name : ctx.chat.title,
                    chatType: ctx.chat.type,
                };
                receiveMessageCard.trigger(token)
                    .catch(this.error)
                    .then();
            }).catch(this.error);
        }
    }

    //endregion

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

    private loadQuestions() {
        if (this.homey.settings.get('questions') !== null) {
            this.questions = JSON.parse(this.homey.settings.get('questions')) as Question[];
        }
    }

    private loadUsers() {
        if (this.homey.settings.get('users') !== null) {
            this.users = JSON.parse(this.homey.settings.get('users')) as User[];
        }
    }

    private validateURL(link: string) {
        if (link.indexOf("http://") == 0) {
            return false;
        }
        return link.indexOf("https://") == 0;
    }

    //endregion

}

module.exports = TelegramNotifications;
