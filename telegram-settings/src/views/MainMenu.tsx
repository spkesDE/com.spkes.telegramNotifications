import React from 'react';
import '../App.css';
import MenuItem from "../components/UIComps/MenuItem";
import {Views} from "../statics/Views";
import MenuItemGroup from "../components/UIComps/MenuItemGroup";
import StatusWidget from "../components/MainMenu/StatusWidget";

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
                        title={"Bot Settings"}
                        icon={"fa-cog"}
                        className={"bg-color-orange"}
                        onClick={() => this.props.changeView(Views.Settings)}
                    />
                    <MenuItem
                        title={"Questions"}
                        icon={"fa-question"}
                        className={"bg-color-blue"}
                        onClick={() => this.props.changeView(Views.Questions)}
                    />
                    <MenuItem
                        title={"Users"}
                        icon={"fa-users"}
                        className={"bg-color-magenta"}
                        onClick={() => this.props.changeView(Views.Users)}
                    />
                    <MenuItem
                        title={"Topics"}
                        icon={"fa-folder"}
                        className={"bg-color-green"}
                        disabled={true}
                    />
                </MenuItemGroup>
                <MenuItemGroup>
                    <MenuItem
                        title={"Logs"}
                        icon={"fa-bars"}
                        className={"bg-color-gray"}
                        onClick={() => this.props.changeView(Views.Logs)}
                    />
                    <MenuItem
                        title={"Debug Menu"}
                        icon={"fa-bug"}
                        className={"bg-color-red"}
                        onClick={() => this.props.changeView(Views.Debug)}
                    />
                </MenuItemGroup>
            </>
        );
    }
}

