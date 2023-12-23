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
    APIKey: string,
    useGTP: boolean,
    gotData: boolean
}

export default class ChatGTPMenu extends React.Component<Props, State> {
    constructor(props: Props) {
        super(props);
        this.state = {
            useGTP: false,
            APIKey: "",
            gotData: process.env!.NODE_ENV === "development"
        }
    }

    async componentDidMount() {
        console.log("componentDidMount Chat GTP Settings....")
        let key = await Homey.get('chat-gtp-key') ?? "";
        this.setState({
            useGTP: key != "",
            APIKey: key,
            gotData: true
        })
    }

    render() {
        if (!this.state.gotData) return <Loading fullscreen={true}/>
        else return (
            <MenuWrapper title={Homey.__('settings.chatGTPSettings.title')}
                         onBack={() => this.props.changeView(Views.MainMenu)}>
                <MenuItemGroup>
                    <p className="itemGroupTitle">
                        {Homey.__('settings.chatGTPSettings.useGtp')}
                    </p>
                    <MenuItemWrapper>
                        <h2>{Homey.__('settings.chatGTPSettings.enable')}</h2>
                        <Switch id={"usePassword"} onChange={(e) => this.handleUseGTP(e.currentTarget.checked)}
                                value={this.state.useGTP}/>
                    </MenuItemWrapper>
                    {this.state.useGTP && <>
                      <MenuItemWrapper>
                        <label
                          className={"menuItem-label hy-nostyle"}>{Homey.__('settings.chatGTPSettings.apiKey')}</label>
                        <input className="menuItem-input hy-nostyle"
                               type="password"
                               defaultValue={this.state.APIKey}
                               placeholder={Homey.__('settings.chatGTPSettings.apiKey')}
                               onChange={(e) => {
                                   this.setState({APIKey: e.currentTarget.value})
                               }}/>
                      </MenuItemWrapper>
                    </>}
                </MenuItemGroup>
                {this.state.useGTP && <>
                  <MenuItemGroup>
                    <MenuItemWrapper className={"noPadding"}>
                      <button className={"menuItem-button-danger hy-nostyle"}
                              onClick={() => this.onSave()}>
                          {Homey.__('settings.botSettings.saveChanges')}
                      </button>
                    </MenuItemWrapper>
                  </MenuItemGroup>
                </>
                }
            </MenuWrapper>
        );
    }

    async onSave(): Promise<void> {
        console.log("Saving Chat GTP Settings....")
        this.setState({gotData: false})
        await Homey.set('chat-gtp-key', this.state.APIKey);
        this.setState({gotData: true})
        console.log("Saved Chat GTP Settings")
    }

    handleUseGTP(value: boolean): void {
        this.setState({
            useGTP: value,
        })
    };
}

