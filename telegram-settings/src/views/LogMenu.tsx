import React from 'react';
import '../App.css';
import MenuWrapper from "../components/UIComps/MenuWrapper";
import {Views} from "../statics/Views";
import LogWidget from "../components/LogMenu/LogWidget";
import {LogEntry} from "../statics/LogEntry";

interface Props {
    changeView: Function
}

interface State {
    logs: LogEntry[]
}

export default class LogsMenu extends React.Component<Props, State> {
    constructor(props: Props) {
        super(props);
        this.state = {
            logs: [],
        }
    }

    async componentDidMount() {
        this.setState({
            logs: JSON.parse(await window.Homey.get("logs"))
        })
    }

    getLogComponents() {
        let result: any[] = [];
        this.state.logs.forEach((l) => {
            result.push(<LogWidget date={l.date} type={l.type ?? 0} message={l.message}/>)
        });
        return result;
    }

    render() {
        return (
            <MenuWrapper title={"Logs"}
                         onBack={() => this.props.changeView(Views.MainMenu)}
                         customOnAddText={<>
                             Copy <i className="fas fa-clone"></i>
                         </>}
                         onAdd={() => (navigator.clipboard.writeText(JSON.stringify(this.state.logs)))}
            >
                {this.getLogComponents()}
            </MenuWrapper>
        );
    }
}

