import React, {ReactElement} from 'react';
import '../../App.css';
import './StatusWidget.css'
import Loading from "../../views/Loading";
import Badge from "../UIComps/Badge";
import {BadgeColor, BadgeSize} from "../../statics/Colors";
import {LogEntry} from "../../statics/LogEntry";
import Homey from "../../Homey";

interface Props {

}

interface State {
    status: ReactElement;
    users: string;
    questions: string;
    logSize: string;
    errors: string;
    gotData: boolean;
}

export default class StatusWidget extends React.Component<Props, State> {

    constructor(props: Props) {
        super(props);
        this.state = {
            status: this.getStatusBadge(undefined),
            users: "0",
            questions: "0",
            logSize: "0",
            errors: "0",
            gotData: process.env!.NODE_ENV === "development"
        }
    }

    getStatusBadge(bool: boolean | undefined) {
        if (process.env!.NODE_ENV === "development")
            return <Badge color={BadgeColor.ORANGE}
                          size={BadgeSize.SMALL}>DEVELOPMENT</Badge>;
        if (bool === undefined)
            return <Badge color={BadgeColor.GRAY}
                          size={BadgeSize.SMALL}>{Homey.__("settings.status.state.unknown")}</Badge>;
        if (bool)
            return <Badge color={BadgeColor.GREEN}
                          size={BadgeSize.SMALL}>{Homey.__("settings.status.state.on")}</Badge>;
        return <Badge color={BadgeColor.RED}
                      size={BadgeSize.SMALL}>{Homey.__("settings.status.state.off")}</Badge>;
    }

    async componentDidMount() {
        let logs = JSON.parse(await Homey.get('logs') ?? "[]") ?? [];
        this.setState({
            status: this.getStatusBadge(await Homey.get('bot-running')),
            users: (JSON.parse(await Homey.get('users') ?? "[]")).length ?? "0",
            questions: (JSON.parse(await Homey.get('questions') ?? "[]")).length ?? "0",
            logSize: logs.length ?? "0",
            errors: logs.filter((e: LogEntry) => e.type === 1).length ?? "0",
            gotData: true
        })
    }

    render() {
        if (this.state.gotData)
            return (
                <div className="statusWidget">
                    <div className="title">
                        Status
                    </div>
                    <hr/>
                    <div className="data">
                        <div className={"data"}>
                            <div className="col">
                                <p>{Homey.__("settings.status.bot")}: {this.state.status}</p>
                                <p>{Homey.__("settings.status.chats")}: {this.state.users}</p>
                                <p>{Homey.__("settings.status.questions")}: {this.state.questions}</p>
                            </div>
                            <div className="col">
                                <p>{Homey.__("settings.status.logSize", {value: this.state.logSize})}</p>
                                <p>{Homey.__("settings.status.errors")}: {this.state.errors}</p>
                                <p></p>
                            </div>
                        </div>
                        <img src={"./img/icon.svg"} height={60} width={60} className={"logo"}
                             alt={"Telegram Logo"}/>
                    </div>
                </div>
            );
        else return <div className="statusWidget"><Loading/></div>
    }
}

