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
                        <h2>This app uses the following awesome tools and languages</h2>
                        <ul>
                            <li>Grammy.dev <Badge color={BadgeColor.ORANGE} size={BadgeSize.SMALL}>vX.X.X</Badge></li>
                            <li>Better Logic Library <Badge color={BadgeColor.MAGENTA}
                                                            size={BadgeSize.SMALL}>v0.9.18</Badge></li>
                            <li>React</li>
                            <li>Typescript</li>
                        </ul>
                    </MenuContentWrapper>
                </MenuItemGroup>
                <MenuItemGroup>
                    <MenuContentWrapper>
                        <h2>This app wouldn't be the same without these awesome people</h2>
                        <ul>
                            <li>Twan_Veugelers (Translation for 🇬🇧 🇳🇱)</li>
                            <li>ilpaolino (Translation for 🇮🇹)</li>
                            <li>Arie J. Godschalk (Developer for Better Logic Library)</li>
                            <li>Enyineer (Contributor and Developer)</li>
                            <li><strong>You, the Homey Community</strong></li>
                        </ul>
                    </MenuContentWrapper>
                </MenuItemGroup>
            </MenuWrapper>
        );
    }
}

