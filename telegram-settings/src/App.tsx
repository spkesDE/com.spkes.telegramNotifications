import React from 'react';
import './App.css';
import {Views} from "./statics/Views";
import MainMenu from "./views/MainMenu";
import SettingsMenu from "./views/SettingsMenu";
import QuestionMainMenu from "./views/QuestionMainMenu";
import UserMenu from "./views/UserMenu";
import LogsMenu from "./views/LogMenu";
import Loading from "./views/Loading";
import DebugMenu from "./views/DebugMenu";


interface Props {

}

interface State {
    currentView: Views;
}

class App extends React.Component<Props, State> {
    homeyAvailable: boolean = false;

    constructor(props: Props) {
        super(props);
        this.state = {
            currentView: Views.Loading,
        }
    }

    componentDidMount() {
        const interval = setInterval(() => {
            if (window.Homey && window.HomeyReady || process.env!.NODE_ENV === "development") {
                this.homeyAvailable = true;
                this.handleHomey();
                clearInterval(interval)
            }
        }, 100)
    }

    handleHomey() {
        if (!this.homeyAvailable) return;
        this.setState({
            currentView: Views.MainMenu,
        })
    }

    changeView(view: Views) {
        this.setState({
            currentView: view,
        })
    }

    render() {
        switch (this.state.currentView) {
            case Views.Debug:
                return <DebugMenu changeView={this.changeView.bind(this)}/>;
            case Views.Settings:
                return <SettingsMenu changeView={this.changeView.bind(this)}/>
            case Views.Questions:
                return <QuestionMainMenu changeView={this.changeView.bind(this)}/>;
            case Views.Users:
                return <UserMenu changeView={this.changeView.bind(this)}/>;
            case Views.Logs:
                return <LogsMenu changeView={this.changeView.bind(this)}/>;
            case Views.MainMenu:
                return <MainMenu changeView={this.changeView.bind(this)}/>
            case Views.Loading:
                return <Loading fullscreen={true}/>
            default:
                return <MainMenu changeView={this.changeView.bind(this)}/>
        }
    }
}

export default App;
