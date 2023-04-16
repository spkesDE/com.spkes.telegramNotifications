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
    useBLL: boolean,
    password: string,
    token: string,
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
            password: "",
            token: "",
            showFuckedUpPopup: false,
            selectedFuckUpAction: undefined
        }
    }

    async componentDidMount() {
        this.setState({
            logs: await window.Homey.get("logs") ?? "{}",
            status: (await window.Homey.get('bot-running')) ? "Online" : "Offline" ?? "",
            users: await window.Homey.get('users') ?? "{}",
            questions: await window.Homey.get('questions') ?? "{}",
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
            <MenuWrapper title={"Debug Menu"}
                         onBack={() => this.props.changeView(Views.MainMenu)}
            >
                <div className="logWidget">
                    <Badge color={BadgeColor.GRAY}>Status</Badge>
                    <div className="codeBlock">{this.state.status}</div>
                </div>
                <div className="logWidget">
                    <Badge color={BadgeColor.GRAY}>Users</Badge>
                    <div className="codeBlock">{JSON.stringify(JSON.parse(this.state.users), null, 2)}</div>
                </div>
                <div className="logWidget">
                    <Badge color={BadgeColor.GRAY}>Use BLL</Badge>
                    <div className="codeBlock">{this.state.useBLL + ""}</div>
                </div>
                <div className="logWidget">
                    <Badge color={BadgeColor.GRAY}>Questions</Badge>
                    <div className="codeBlock">{JSON.stringify(JSON.parse(this.state.questions), null, 2)}</div>
                </div>
                <div className="logWidget">
                    <Badge color={BadgeColor.GRAY}>Token</Badge>
                    <div className="codeBlock">{this.state.token}</div>
                </div>
                <div className="logWidget">
                    <Badge color={BadgeColor.GRAY}>Use Password</Badge>
                    <div className="codeBlock">{this.state.usePassword + ""}</div>
                </div>
                <div className="logWidget">
                    <Badge color={BadgeColor.GRAY}>Password</Badge>
                    <div className="codeBlock">{this.state.password}</div>
                </div>
                <div className="logWidget">
                    <Badge color={BadgeColor.GRAY}>Logs</Badge>
                    <div className="codeBlock">{JSON.stringify(JSON.parse(this.state.logs), null, 2)}</div>
                </div>

                <MenuItemGroup>
                    <p className="itemGroupTitle" data-i18n="settings.miscSettings">
                        I fucked up menu
                    </p>
                    <MenuItemWrapper className={"noPadding"}>
                        <button className={"menuItem-button-danger hy-nostyle"}
                                onClick={(e) => {
                                    this.setState({
                                        showFuckedUpPopup: true,
                                        selectedFuckUpAction: FuckedUpActions.RESET_USERS
                                    })
                                }}>Reset Users
                        </button>
                    </MenuItemWrapper>
                    <MenuItemWrapper className={"noPadding"}>
                        <button className={"menuItem-button-danger hy-nostyle"}
                                onClick={(e) => {
                                    this.setState({
                                        showFuckedUpPopup: true,
                                        selectedFuckUpAction: FuckedUpActions.RESET_QUESTIONS
                                    })
                                }}>Reset Questions
                        </button>
                    </MenuItemWrapper>
                    <MenuItemWrapper className={"noPadding"}>
                        <button className={"menuItem-button-danger hy-nostyle"}
                                onClick={(e) => {
                                    this.setState({
                                        showFuckedUpPopup: true,
                                        selectedFuckUpAction: FuckedUpActions.RESET_LOGS
                                    })
                                }}>Reset Logs
                        </button>
                    </MenuItemWrapper>
                    <MenuItemWrapper className={"noPadding"}>
                        <button className={"menuItem-button-danger hy-nostyle"}
                                onClick={(e) => {
                                    this.setState({
                                        showFuckedUpPopup: true,
                                        selectedFuckUpAction: FuckedUpActions.RESET_PASSWORD
                                    })
                                }}>Reset Password
                        </button>
                    </MenuItemWrapper>
                    <MenuItemWrapper className={"noPadding"}>
                        <button className={"menuItem-button-danger hy-nostyle"}
                                onClick={(e) => {
                                    this.setState({
                                        showFuckedUpPopup: true,
                                        selectedFuckUpAction: FuckedUpActions.RESET_ALL
                                    })
                                }}>Reset everything
                        </button>
                    </MenuItemWrapper>
                </MenuItemGroup>

                <Popup title={"Warning"} icon={"fa-exclamation-triangle"} show={this.state.showFuckedUpPopup}
                       closeHandler={(e) => {
                           this.setState({showFuckedUpPopup: false})
                       }}>
                    Are you sure you want to run the
                    action {FuckedUpActions[this.state.selectedFuckUpAction ?? FuckedUpActions.RESET_ALL]}? This action
                    can't be undone!
                    <br/><br/>
                    <button
                        className={"yesButton hy-nostyle"}
                        onClick={(e) => this.handleFuckUpAction()}
                    >Yes
                    </button>

                    <button
                        className={"noButton hy-nostyle"}
                        onClick={(e) => this.setState({showFuckedUpPopup: false})}
                    >No
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
                await window.Homey.set('users', "[]");
                break;
            case FuckedUpActions.RESET_QUESTIONS:
                await window.Homey.set('questions', "[]");
                break;
            case FuckedUpActions.RESET_LOGS:
                await window.Homey.set('logs', "[]");
                break;
            case FuckedUpActions.RESET_PASSWORD:
                await window.Homey.set('password', false);
                await window.Homey.set('use-password', "");
                break;
            case FuckedUpActions.RESET_ALL:
                await window.Homey.set('users', "[]");
                await window.Homey.set('questions', "[]");
                await window.Homey.set('logs', "[]");
                await window.Homey.set('password', false);
                await window.Homey.set('use-password', "");
                break;
        }
        this.setState({showFuckedUpPopup: false});
    }
}
/*
            logs: await window.Homey.get("logs") ?? "{}",
            status: (await window.Homey.get('bot-running')) ? "Online" : "Offline" ?? "",
            users: await window.Homey.get('users') ?? "{}",
            questions: await window.Homey.get('questions') ?? "{}",
            usePassword: await window.Homey.get('use-password') ?? false,
            useBLL: await window.Homey.get('useBll') ?? false,
            password: await window.Homey.get('password') ?? undefined,
            token: await window.Homey.get('bot-token') ?? undefined,
 */
