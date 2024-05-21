import React from 'react';
import '../App.css';
import MenuWrapper from "../components/UIComps/MenuWrapper";
import {Views} from "../statics/Views";
import Badge from "../components/UIComps/Badge";
import {BadgeColor} from "../statics/Colors";
import Loading from "./Loading";
import MenuItemWrapper from "../components/UIComps/MenuItemWrapper";
import MenuItemGroup from "../components/UIComps/MenuItemGroup";
import Popup from "../components/UIComps/Popup";
import Homey from "../Homey";

interface Props {
    changeView: Function
}

interface State {
    status: string;
    users: string;
    questions: string;
    logs: string;
    gotData: boolean;
    usePassword: boolean,
    disableWebPagePreview: boolean,
    useBLL: boolean,
    password: string,
    token: string,
    markdown: string | undefined,
    showFuckedUpPopup: boolean;
    selectedFuckUpAction: FuckedUpActions | undefined
}

enum FuckedUpActions {
    RESET_USERS = 1,
    RESET_QUESTIONS,
    RESET_LOGS,
    RESET_PASSWORD,
    RESET_ALL
}


export default class DebugMenu extends React.Component<Props, State> {
    constructor(props: Props) {
        super(props);
        this.state = {
            status: "",
            users: "{}",
            questions: "{}",
            logs: "{}",
            gotData: process.env!.NODE_ENV === "development",
            usePassword: false,
            useBLL: false,
            disableWebPagePreview: false,
            password: "",
            token: "",
            markdown: "",
            showFuckedUpPopup: false,
            selectedFuckUpAction: undefined
        }
    }

    async componentDidMount() {
        this.setState({
            logs: await Homey.get("logs") ?? "{}",
            status: (await Homey.get('bot-running')) ? Homey.__("settings.status.state.on")
                : Homey.__("settings.status.state.off") ?? Homey.__("settings.status.state.unknown"),
            users: await Homey.get('users') ?? "{}",
            questions: await Homey.get('questions') ?? "{}",
            usePassword: await Homey.get('use-password') ?? false,
            useBLL: await Homey.get('useBll') ?? false,
            disableWebPagePreview: await Homey.get('disableWebPagePreview') ?? false,
            password: await Homey.get('password') ?? undefined,
            token: await Homey.get('bot-token') ?? undefined,
            markdown: await Homey.get('markdown') ?? undefined,
            gotData: true
        })
    }


    render() {
        if (!this.state.gotData) return <Loading fullscreen={true}/>
        else return (
            <MenuWrapper title={Homey.__("settings.debugMenu.debugMenu")}
                         onBack={() => this.props.changeView(Views.MainMenu)}
            >
                <div className="logWidget">
                    <Badge color={BadgeColor.GRAY}>{Homey.__("settings.debugMenu.status")}</Badge>
                    <div className="codeBlock">{this.state.status}</div>
                </div>
                <div className="logWidget">
                    <Badge color={BadgeColor.GRAY}>{Homey.__("settings.debugMenu.users")}</Badge>
                    <div className="codeBlock">{JSON.stringify(JSON.parse(this.state.users), null, 2)}</div>
                </div>
                <div className="logWidget">
                    <Badge color={BadgeColor.GRAY}>{Homey.__("settings.debugMenu.useBll")}</Badge>
                    <div className="codeBlock">{this.state.useBLL + ""}</div>
                </div>
                <div className="logWidget">
                    <Badge color={BadgeColor.GRAY}>{Homey.__("settings.debugMenu.disableWebPagePreview")}</Badge>
                    <div className="codeBlock">{this.state.disableWebPagePreview + ""}</div>
                </div>
                <div className="logWidget">
                    <Badge color={BadgeColor.GRAY}>{Homey.__("settings.debugMenu.markdown")}</Badge>
                    <div className="codeBlock">{this.state.markdown}</div>
                </div>
                <div className="logWidget">
                    <Badge color={BadgeColor.GRAY}>{Homey.__("settings.debugMenu.questions")}</Badge>
                    <div className="codeBlock">{JSON.stringify(JSON.parse(this.state.questions), null, 2)}</div>
                </div>
                <div className="logWidget">
                    <Badge color={BadgeColor.GRAY}>{Homey.__("settings.debugMenu.token")}</Badge>
                    <div className="codeBlock">{this.state.token}</div>
                </div>
                <div className="logWidget">
                    <Badge color={BadgeColor.GRAY}>{Homey.__("settings.debugMenu.usePassword")}</Badge>
                    <div className="codeBlock">{this.state.usePassword + ""}</div>
                </div>
                <div className="logWidget">
                    <Badge color={BadgeColor.GRAY}>{Homey.__("settings.debugMenu.password")}</Badge>
                    <div className="codeBlock">{this.state.password}</div>
                </div>
                <div className="logWidget">
                    <Badge color={BadgeColor.GRAY}>{Homey.__("settings.debugMenu.logs")}</Badge>
                    <div className="codeBlock">{JSON.stringify(JSON.parse(this.state.logs), null, 2)}</div>
                </div>

                <MenuItemGroup>
                    <p className="itemGroupTitle">{Homey.__("settings.debugMenu.fuckedUpMenu")}</p>
                    <MenuItemWrapper className={"noPadding"}>
                        <button className={"menuItem-button-danger hy-nostyle"}
                                onClick={() => {
                                    this.setState({
                                        showFuckedUpPopup: true,
                                        selectedFuckUpAction: FuckedUpActions.RESET_USERS
                                    })
                                }}>{Homey.__("settings.debugMenu.resetUsers")}
                        </button>
                    </MenuItemWrapper>
                    <MenuItemWrapper className={"noPadding"}>
                        <button className={"menuItem-button-danger hy-nostyle"}
                                onClick={() => {
                                    this.setState({
                                        showFuckedUpPopup: true,
                                        selectedFuckUpAction: FuckedUpActions.RESET_QUESTIONS
                                    })
                                }}>{Homey.__("settings.debugMenu.resetQuestions")}
                        </button>
                    </MenuItemWrapper>
                    <MenuItemWrapper className={"noPadding"}>
                        <button className={"menuItem-button-danger hy-nostyle"}
                                onClick={() => {
                                    this.setState({
                                        showFuckedUpPopup: true,
                                        selectedFuckUpAction: FuckedUpActions.RESET_LOGS
                                    })
                                }}>{Homey.__("settings.debugMenu.resetLogs")}
                        </button>
                    </MenuItemWrapper>
                    <MenuItemWrapper className={"noPadding"}>
                        <button className={"menuItem-button-danger hy-nostyle"}
                                onClick={() => {
                                    this.setState({
                                        showFuckedUpPopup: true,
                                        selectedFuckUpAction: FuckedUpActions.RESET_PASSWORD
                                    })
                                }}>{Homey.__("settings.debugMenu.resetPassword")}
                        </button>
                    </MenuItemWrapper>
                    <MenuItemWrapper className={"noPadding"}>
                        <button className={"menuItem-button-danger hy-nostyle"}
                                onClick={() => {
                                    this.setState({
                                        showFuckedUpPopup: true,
                                        selectedFuckUpAction: FuckedUpActions.RESET_ALL
                                    })
                                }}>
                            <i className="fas fa-bomb"></i>&nbsp;
                            {Homey.__("settings.debugMenu.resetEverything")}&nbsp;
                            <i className="fas fa-bomb"></i>
                        </button>
                    </MenuItemWrapper>
                </MenuItemGroup>

                <Popup title={"Warning"} icon={"fa-exclamation-triangle"} show={this.state.showFuckedUpPopup}
                       closeHandler={() => {
                           this.setState({showFuckedUpPopup: false})
                       }}>
                    {Homey.__("settings.debugMenu.fuckedUpWarning",
                        {action: FuckedUpActions[this.state.selectedFuckUpAction ?? FuckedUpActions.RESET_ALL]})}
                    <br/><br/>
                    <button
                        className={"yesButton hy-nostyle"}
                        onClick={() => this.handleFuckUpAction()}
                    >{Homey.__("settings.misc.yes")}
                    </button>

                    <button
                        className={"noButton hy-nostyle"}
                        onClick={() => this.setState({showFuckedUpPopup: false})}
                    >{Homey.__("settings.misc.no")}
                    </button>
                </Popup>
            </MenuWrapper>
        );
    }

    private async handleFuckUpAction() {
        if (!this.state.selectedFuckUpAction) {
            this.setState({showFuckedUpPopup: false});
            return;
        }
        switch (this.state.selectedFuckUpAction) {
            case FuckedUpActions.RESET_USERS:
                await Homey.set('users', "[]");
                break;
            case FuckedUpActions.RESET_QUESTIONS:
                await Homey.set('questions', "[]");
                break;
            case FuckedUpActions.RESET_LOGS:
                await Homey.set('logs', "[]");
                break;
            case FuckedUpActions.RESET_PASSWORD:
                await Homey.set('password', false);
                await Homey.set('use-password', "");
                break;
            case FuckedUpActions.RESET_ALL:
                await Homey.set('users', "[]");
                await Homey.set('questions', "[]");
                await Homey.set('logs', "[]");
                await Homey.set('password', false);
                await Homey.set('use-password', "");
                await Homey.set('markdown', "none");
                await Homey.set('token', "");
                break;
        }
        this.setState({showFuckedUpPopup: false});
    }
}
/*
            logs: await Homey.get("logs") ?? "{}",
            status: (await Homey.get('bot-running')) ? "Online" : "Offline" ?? "",
            users: await Homey.get('users') ?? "{}",
            questions: await Homey.get('questions') ?? "{}",
            usePassword: await Homey.get('use-password') ?? false,
            useBLL: await Homey.get('useBll') ?? false,
            password: await Homey.get('password') ?? undefined,
            token: await Homey.get('bot-token') ?? undefined,
 */
