import React from 'react';
import '../App.css';
import MenuWrapper from "../components/UIComps/MenuWrapper";
import {Views} from "../statics/Views";
import MenuItemGroup from "../components/UIComps/MenuItemGroup";
import Homey from "../Homey";
import MenuContentWrapper from "../components/UIComps/MenuContentWrapper";
import Badge from "../components/UIComps/Badge";
import {BadgeColor, BadgeSize} from "../statics/Colors";
import MenuItem from "../components/UIComps/MenuItem";

interface Props {
    changeView: Function
}

interface State {
}

export default class AboutMenu extends React.Component<Props, State> {
    constructor(props: Props) {
        super(props);
    }

    render() {
        const grammyVersion = import.meta.env.VITE_GRAMMY_VERSION || 'unknown';
        const betterLogicVersion = import.meta.env.VITE_BETTER_LOGIC_VERSION || 'unknown';
        const nodeFetchVersion = import.meta.env.VITE_NODE_FETCH_VERSION || 'unknown';
        const reactVersion = import.meta.env.VITE_REACT_VERSION || 'unknown';

        return (
            <MenuWrapper title={Homey.__("settings.aboutMenu.title")}
                         onBack={() => this.props.changeView(Views.MainMenu)}>
                <MenuItemGroup>
                    <MenuItem
                        title={Homey.__('settings.aboutMenu.joinTelegram')}
                        icon={"fa-paper-plane"}
                        className={"bg-color-blue"}
                        onClick={() => Homey.popup("https://t.me/homeyCommunity")}
                    />
                </MenuItemGroup>
                <MenuItemGroup>
                    <MenuContentWrapper>
                        <h2>{Homey.__("settings.aboutMenu.using")}</h2>
                        <ul>
                            <li>Grammy.dev <Badge color={BadgeColor.ORANGE} size={BadgeSize.SMALL}>{grammyVersion}</Badge></li>
                            <li>Better Logic Library <Badge color={BadgeColor.MAGENTA} size={BadgeSize.SMALL}>{betterLogicVersion}</Badge></li>
                            <li>Node-fetch <Badge color={BadgeColor.BLUE} size={BadgeSize.SMALL}>{nodeFetchVersion}</Badge></li>
                            <li>React <Badge color={BadgeColor.CYAN} size={BadgeSize.SMALL}>{reactVersion}</Badge></li>
                            <li>Typescript, because it's better!</li>
                        </ul>
                    </MenuContentWrapper>
                </MenuItemGroup>
                <MenuItemGroup>
                    <MenuContentWrapper>
                        <h2>{Homey.__("settings.aboutMenu.contributors")}</h2>
                        <ul>
                            <li>{Homey.__("settings.aboutMenu.translator", {
                                name: "Twan_Veugelers",
                                lang: "🇬🇧 🇳🇱"
                            })}</li>
                            <li>{Homey.__("settings.aboutMenu.translator", {name: "ilpaolino", lang: "🇮🇹"})}</li>
                            <li>{Homey.__("settings.aboutMenu.translator", {name: "oleg", lang: "🇷🇺"})}</li>
                            <li>{Homey.__("settings.aboutMenu.translator", {
                                name: "ChatGTP-3",
                                lang: "🇵🇱 🇪🇸 🇩🇰 🇸🇪 🇳🇴 🇫🇷"
                            })}</li>
                            <li>{Homey.__("settings.aboutMenu.dev", {
                                name: "Arie J. Godschalk",
                                app: "Better Logic Library"
                            })}</li>
                            <li>{Homey.__("settings.aboutMenu.contributor", {name: "Enyineer"})}</li>
                            <li><strong>{Homey.__("settings.aboutMenu.community")}</strong></li>
                        </ul>
                    </MenuContentWrapper>
                </MenuItemGroup>
            </MenuWrapper>
        );
    }
}

