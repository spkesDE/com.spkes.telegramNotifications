import React from 'react';
import '../App.css';
import MenuItem from "../components/UIComps/MenuItem";
import {Views} from "../statics/Views";
import MenuItemGroup from "../components/UIComps/MenuItemGroup";
import StatusWidget from "../components/MainMenu/StatusWidget";
import Homey from "../Homey";

interface Props {
    changeView: Function
}

export default class MainMenu extends React.Component<Props> {
    render() {
        return (
            <>
                <div className={"spacer"}></div>
                <StatusWidget/>
                <MenuItemGroup>
                    <MenuItem
                        title={Homey.__('settings.mainMenu.settings')}
                        icon={"fa-cog"}
                        className={"bg-color-orange"}
                        onClick={() => this.props.changeView(Views.Settings)}
                    />
                    <MenuItem
                        title={Homey.__('settings.mainMenu.questions')}
                        icon={"fa-question"}
                        className={"bg-color-blue"}
                        onClick={() => this.props.changeView(Views.Questions)}
                    />
                    <MenuItem
                        title={Homey.__('settings.mainMenu.users')}
                        icon={"fa-users"}
                        className={"bg-color-magenta"}
                        onClick={() => this.props.changeView(Views.Users)}
                    />
                    <MenuItem
                        title={Homey.__('settings.mainMenu.topics')}
                        icon={"fa-folder"}
                        className={"bg-color-green"}
                        onClick={() => this.props.changeView(Views.Topics)}
                    />
                    <MenuItem
                        title={Homey.__('settings.mainMenu.chatGtp')}
                        icon={"fa-keyboard"}
                        className={"bg-color-orange"}
                        disabled={true}
                        onClick={() => this.props.changeView(Views.ChatGTP)}
                    />
                </MenuItemGroup>
                <MenuItemGroup>
                    <MenuItem
                        title={Homey.__('settings.mainMenu.logs')}
                        icon={"fa-bars"}
                        className={"bg-color-gray"}
                        onClick={() => this.props.changeView(Views.Logs)}
                    />
                    <MenuItem
                        title={Homey.__('settings.mainMenu.debugMenu')}
                        icon={"fa-bug"}
                        className={"bg-color-red"}
                        onClick={() => this.props.changeView(Views.Debug)}
                    />
                </MenuItemGroup>
                <MenuItemGroup>
                    <MenuItem
                        title={Homey.__('settings.aboutMenu.joinTelegram')}
                        icon={"fa-paper-plane"}
                        className={"bg-color-blue"}
                        onClick={() => Homey.popup("https://t.me/homeyCommunity")}
                    />
                    <MenuItem
                        title={Homey.__('settings.mainMenu.about')}
                        icon={"fa-address-card"}
                        className={"bg-color-magenta"}
                        onClick={() => this.props.changeView(Views.About)}
                    />
                </MenuItemGroup>
            </>
        );
    }
}

