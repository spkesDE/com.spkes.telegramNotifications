import React from 'react';
import '../App.css';
import MenuWrapper from "../components/UIComps/MenuWrapper";
import {Views} from "../statics/Views";
import Switch from "../components/UIComps/Switch";
import MenuItemWrapper from "../components/UIComps/MenuItemWrapper";
import MenuItemGroup from "../components/UIComps/MenuItemGroup";
import Loading from "./Loading";

interface Props {
    changeView: Function
}

interface State {
    usePassword: boolean,
    useBLL: boolean,
    password: string | undefined,
    token: string | undefined,
    gotData: boolean
}

class SettingsMenu extends React.Component<Props, State> {
    constructor(props: Props) {
        super(props);
        this.state = {
            usePassword: false,
            useBLL: false,
            password: undefined,
            token: undefined,
            gotData: process.env!.NODE_ENV === "development"
        }
    }

    async componentDidMount() {
        console.log("componentDidMount Settings....")
        this.setState({
            usePassword: await window.Homey.get('use-password') ?? false,
            useBLL: await window.Homey.get('useBll') ?? false,
            password: await window.Homey.get('password') ?? undefined,
            token: await window.Homey.get('bot-token') ?? undefined,
            gotData: true
        })
    }

    render() {
        if (!this.state.gotData) return <Loading fullscreen={true}/>
        else return (
            <MenuWrapper title={"Settings"} onBack={() => this.props.changeView(Views.MainMenu)}>
                <MenuItemGroup>
                    <p className="itemGroupTitle" data-i18n="settings.miscSettings">
                        Bot Settings
                    </p>
                    <MenuItemWrapper>
                        <label className={"menuItem-label hy-nostyle"} data-i18n="settings.token">Bot Token</label>
                        <input className="menuItem-input hy-nostyle" id="bot-token" type="text"
                               defaultValue={this.state.token}
                               placeholder="Enter your token here!"
                               onChange={(e) => {
                                   this.setState({token: e.currentTarget.value})
                               }}/>
                    </MenuItemWrapper>
                    <MenuItemWrapper>
                        <h2 data-i18n="settings.passwordEnable">Enable Password</h2>
                        <Switch id={"usePassword"} onChange={(e) => this.handleShowPassword(e.currentTarget.checked)}
                                value={this.state.usePassword}/>
                    </MenuItemWrapper>
                    {this.state.usePassword && <>
                      <MenuItemWrapper>
                        <label className={"menuItem-label hy-nostyle"} data-i18n="settings.password">Bot
                          Password</label>
                        <input className="menuItem-input hy-nostyle" id="bot-password" type="password"
                               defaultValue={this.state.password}
                               placeholder={"Enter your password"}
                               onChange={(e) => {
                                   this.setState({password: e.currentTarget.value})
                               }}/>
                      </MenuItemWrapper>
                      <p className={"itemGroupHint"} data-i18n="settings.userInfoPassword">
                        <i className="fas fa-info-circle"></i>
                        To Register a user/chat now you have to enter /start [yourPassword] to the bot via Telegram
                      </p>
                    </>
                    }
                </MenuItemGroup>
                <MenuItemGroup>
                    <p className="itemGroupTitle" data-i18n="settings.miscSettings">
                        Miscellaneous Settings
                    </p>
                    <MenuItemWrapper>
                        <h2 data-i18n="settings.useBll">Enable Better Logic Library Support</h2>
                        <Switch id={"useBll"} onChange={(e) => this.handleUseBll(e.currentTarget.checked)}
                                value={this.state.useBLL}/>
                    </MenuItemWrapper>
                </MenuItemGroup>
                <MenuItemGroup>
                    <MenuItemWrapper className={"noPadding"}>
                        <button className={"menuItem-button-danger hy-nostyle"} data-i18n="settings.save"
                                onClick={() => this.onSave()}>
                            Save changes
                        </button>
                    </MenuItemWrapper>
                </MenuItemGroup>
                <MenuItemGroup>
                    <p className="itemGroupTitle" data-i18n="settings.howToSetup.title">
                        How to setup
                    </p>
                    <MenuItemWrapper className={"flexCol flexStart fullPadding"}>
                        <ol>
                            <li data-i18n="settings.howToSetup.step1">Set up your own Telegram bot. This is fully secure
                                and private,
                                since
                                you are the only one who can access
                                the message archive. Enter&nbsp;<strong><span className="mention"><a
                                    href="https://t.me/botfather">@Botfather</a></span></strong>&nbsp;in
                                the search
                                tab of&nbsp;<strong>Telegram</strong>&nbsp;and choose the&nbsp;<strong><span
                                    className="mention"><a
                                    href="https://t.me/botfather">@Botfather</a></span></strong>&nbsp;bot.
                            </li>
                            <li data-i18n="settings.howToSetup.step2">Click “Start” to activate&nbsp;<strong><span
                                className="mention"><a
                                href="https://t.me/botfather">@Botfather</a></span></strong>&nbsp;bot
                                or enter&nbsp;<code>/newbot</code>.&nbsp;<br/><code>/setjoingroup </code>disables that
                                the bot is
                                allowed to
                                join a group.<br/><code>/setprivacy</code>&nbsp;disabels that the bot can read
                                messages inside a group
                            </li>
                            <li data-i18n="settings.howToSetup.step3">Enter the Token inside the app settings</li>
                            <li data-i18n="settings.howToSetup.step4">Write your bot over Telegram&nbsp;
                                <code>/start</code>&nbsp;and
                                follow
                                the instructions<br/>Each user has to
                                also send the Bot the&nbsp;<code>/start</code>&nbsp;command. You can share the Bot
                                via Telegram over the
                                profile or search for the like you searched for the BotFather bot.
                            </li>
                        </ol>
                    </MenuItemWrapper>
                </MenuItemGroup>
            </MenuWrapper>
        );
    }

    async onSave(): Promise<void> {
        console.log("Saving Settings....")
        this.setState({gotData: false})
        await window.Homey.set('use-password', this.state.usePassword);
        await window.Homey.set('useBll', this.state.useBLL);
        await window.Homey.set('password', this.state.password);
        await window.Homey.set('bot-token', this.state.token);
        this.setState({gotData: true})
        console.log("Saved Settings")
    }

    handleShowPassword(value: boolean): void {
        this.setState({
            usePassword: value,
        })
    };


    private handleUseBll(value: boolean) {
        this.setState({
            useBLL: value,
        })
    }
}

export default SettingsMenu;
