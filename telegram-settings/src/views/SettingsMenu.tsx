import React from 'react';
import '../App.css';
import MenuWrapper from "../components/UIComps/MenuWrapper";
import {Views} from "../statics/Views";
import Switch from "../components/UIComps/Switch";
import MenuItemWrapper from "../components/UIComps/MenuItemWrapper";
import MenuItemGroup from "../components/UIComps/MenuItemGroup";
import Loading from "./Loading";
import Homey from "../Homey";

interface Props {
    changeView: Function
}

interface State {
    usePassword: boolean,
    useBLL: boolean,
    password: string | undefined,
    token: string | undefined,
    markdown: string | undefined,
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
            markdown: undefined,
            gotData: process.env!.NODE_ENV === "development"
        }
    }

    async componentDidMount() {
        console.log("componentDidMount Settings....")
        this.setState({
            usePassword: await Homey.get('use-password') ?? false,
            useBLL: await Homey.get('useBll') ?? false,
            password: await Homey.get('password') ?? undefined,
            token: await Homey.get('bot-token') ?? undefined,
            markdown: await Homey.get('markdown') ?? undefined,
            gotData: true
        });


    }

    render() {
        if (!this.state.gotData) return <Loading fullscreen={true}/>
        else return (
            <MenuWrapper title={Homey.__('settings.botSettings.botSettings')}
                         onBack={() => this.props.changeView(Views.MainMenu)}>
                <MenuItemGroup>
                    <p className="itemGroupTitle">
                        {Homey.__('settings.botSettings.botSettings')}
                    </p>
                    <MenuItemWrapper>
                        <label
                            className={"menuItem-label hy-nostyle"}>{Homey.__('settings.botSettings.botToken')}</label>
                        <input className="menuItem-input hy-nostyle" type="text"
                               defaultValue={this.state.token}
                               placeholder={Homey.__('settings.botSettings.botTokenPlaceholder')}
                               onChange={(e) => {
                                   this.setState({token: e.currentTarget.value})
                               }}/>
                    </MenuItemWrapper>
                    <MenuItemWrapper>
                        <h2>{Homey.__('settings.botSettings.usePassword')}</h2>
                        <Switch id={"usePassword"} onChange={(e) => this.handleShowPassword(e.currentTarget.checked)}
                                value={this.state.usePassword}/>
                    </MenuItemWrapper>
                    {this.state.usePassword && <>
                      <MenuItemWrapper>
                        <label
                          className={"menuItem-label hy-nostyle"}>{Homey.__('settings.botSettings.password')}</label>
                        <input className="menuItem-input hy-nostyle" type="password"
                               defaultValue={this.state.password}
                               placeholder={Homey.__('settings.botSettings.passwordPlaceholder')}
                               onChange={(e) => {
                                   this.setState({password: e.currentTarget.value})
                               }}/>
                      </MenuItemWrapper>
                      <p className={"itemGroupHint"}>
                        <i className="fas fa-info-circle"></i>
                          {Homey.__('settings.botSettings.passwordHint')}
                      </p>
                    </>
                    }
                </MenuItemGroup>
                <MenuItemGroup>
                    <p className="itemGroupTitle">
                        {Homey.__('settings.botSettings.miscSettings')}
                    </p>
                    <MenuItemWrapper>
                        <h2>{Homey.__('settings.botSettings.useBll')}</h2>
                        <Switch id={"useBll"} onChange={(e) => this.handleUseBll(e.currentTarget.checked)}
                                value={this.state.useBLL}/>
                    </MenuItemWrapper>
                    <MenuItemWrapper>
                        <h2>{Homey.__('settings.botSettings.useMarkdown')}</h2>
                        <select className={"fancySelect"} id={"useMarkdown"}
                                onChange={(e) => this.handleUseMarkdown(e.currentTarget.value)}>
                            <option value="none" selected={this.state.markdown === undefined}>None</option>
                            <option value="MarkdownV2" selected={this.state.markdown === "MarkdownV2"}>MarkdownV2
                            </option>
                            <option value="HTML" selected={this.state.markdown === "HTML"}>HTML</option>
                        </select>
                    </MenuItemWrapper>
                </MenuItemGroup>
                <MenuItemGroup>
                    <MenuItemWrapper className={"noPadding"}>
                        <button className={"menuItem-button-danger hy-nostyle"}
                                onClick={() => this.onSave()}>
                            {Homey.__('settings.botSettings.saveChanges')}
                        </button>
                    </MenuItemWrapper>
                </MenuItemGroup>
                <MenuItemGroup>
                    <p className="itemGroupTitle">
                        {Homey.__('settings.botSettings.setup.title')}
                    </p>
                    <MenuItemWrapper className={"flexCol flexStart fullPadding"}>
                        <ol>
                            <li className={"defaultFont"}>{Homey.__('settings.botSettings.setup.step1')}</li>
                            <li className={"defaultFont"}>
                                {Homey.__('settings.botSettings.setup.step2')}<br/>
                                {Homey.__('settings.botSettings.setup.step2-1')}<br/>
                                {Homey.__('settings.botSettings.setup.step2-2')}
                            </li>
                            <li className={"defaultFont"}>{Homey.__('settings.botSettings.setup.step3')}</li>
                            <li className={"defaultFont"}>
                                {Homey.__('settings.botSettings.setup.step4')}<br/>
                                {Homey.__('settings.botSettings.setup.step4-1')}
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
        await Homey.set('bot-token', this.state.token);
        await Homey.set('use-password', this.state.usePassword ?? false);
        await Homey.set('useBll', this.state.useBLL ?? false);
        await Homey.set('password', this.state.password);
        await Homey.set('markdown', this.state.markdown);
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

    private handleUseMarkdown(value: string | undefined) {
        this.setState({
            markdown: value
        })
    }
}

export default SettingsMenu;
