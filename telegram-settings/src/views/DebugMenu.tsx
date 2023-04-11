import React from 'react';
import '../App.css';
import MenuWrapper from "../components/UIComps/MenuWrapper";
import {Views} from "../statics/Views";
import Badge from "../components/UIComps/Badge";
import {BadgeColor} from "../statics/Colors";
import Loading from "./Loading";

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
            </MenuWrapper>
        );
    }
}

