import React from 'react';
import '../App.css';
import MenuWrapper from "../components/UIComps/MenuWrapper";
import {Views} from "../statics/Views";
import LogWidget from "../components/LogMenu/LogWidget";
import {LogEntry} from "../statics/LogEntry";
import MenuItemWrapper from "../components/UIComps/MenuItemWrapper";
import Switch from "../components/UIComps/Switch";
import MenuItemGroup from "../components/UIComps/MenuItemGroup";
import Homey from "../Homey";
import EmptyWidget from "../components/UIComps/EmptyWidget";

interface Props {
    changeView: Function
}

interface State {
    logs: LogEntry[]
    hideExports: boolean
    hideDebug: boolean
    hideInfo: boolean
}

export default class LogsMenu extends React.Component<Props, State> {
    constructor(props: Props) {
        super(props);
        this.state = {
            logs: [],
            hideExports: true,
            hideInfo: true,
            hideDebug: true,
        }
    }

    async componentDidMount() {
        this.setState({
            logs: JSON.parse(await Homey.get("logs"))
        })
    }

    //0 Info, 1 Error, 2 Debug
    getLogComponents() {
        let result: any[] = [];
        if (this.state.logs.length === 0) return <EmptyWidget/>
        this.state.logs.forEach((l) => {
            if (l.type == 0 && this.state.hideInfo) return;
            if (l.type == 2 && this.state.hideDebug) return;
            result.push(<LogWidget showExport={!this.state.hideExports} date={l.date} type={l.type ?? 0}
                                   message={l.message}/>)
        });
        if (result.length === 0) return <EmptyWidget happy={true}/>
        return result;
    }

    render() {
        if (this.state.hideExports)
            return (
                <MenuWrapper title={"Logs"}
                             onBack={() => this.props.changeView(Views.MainMenu)}
                >
                    {this.getLogMenuComponents()}
                    {this.getLogComponents()}
                </MenuWrapper>
            );
        else
            return (
                <MenuWrapper title={"Logs"}
                             onBack={() => this.props.changeView(Views.MainMenu)}
                             customOnAddText={<>Copy <i className="fas fa-clone"></i></>}
                             onAdd={() => (navigator.clipboard.writeText(JSON.stringify(this.state.logs)))}
                >
                    {this.getLogMenuComponents()}
                    {this.getLogComponents()}
                </MenuWrapper>
            );
    }

    private getLogMenuComponents() {
        return <>
            <MenuItemGroup>
                <MenuItemWrapper>
                    <h2>{Homey.__("settings.logMenu.showInfoLogs")}</h2>
                    <Switch
                        onChange={(e) => {
                            this.setState({hideInfo: !e.currentTarget.checked})
                        }}
                        value={!this.state.hideInfo}
                    />
                </MenuItemWrapper>
                <MenuItemWrapper>
                    <h2>{Homey.__("settings.logMenu.showDebugLogs")}</h2>
                    <Switch
                        onChange={(e) => {
                            this.setState({hideDebug: !e.currentTarget.checked})
                        }}
                        value={!this.state.hideDebug}
                    />
                </MenuItemWrapper>
            </MenuItemGroup>
        </>
    }
}

