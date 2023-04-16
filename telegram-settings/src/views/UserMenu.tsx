import React from 'react';
import '../App.css';
import MenuWrapper from "../components/UIComps/MenuWrapper";
import {Views} from "../statics/Views";
import MenuItemWrapper from "../components/UIComps/MenuItemWrapper";
import MenuItemGroup from "../components/UIComps/MenuItemGroup";
import Badge from "../components/UIComps/Badge";
import {BadgeColor, BadgeSize} from "../statics/Colors";
import {User} from "../statics/User";
import Loading from "./Loading";
import Homey from "../Homey";

interface Props {
    changeView: Function
}

interface State {
    users: User[]
    gotData: boolean
}

export default class UserMenu extends React.Component<Props, State> {
    constructor(props: Props) {
        super(props);
        this.state = {
            users: [
                {userId: 42112415, chatName: "Test", type: 1},
                {userId: 46453645, chatName: "Test", type: 1},
                {userId: 64537878, chatName: "Test", type: 1}
            ],
            gotData: process.env!.NODE_ENV === "development"
        }
    }

    async componentDidMount() {
        this.setState({
            users: JSON.parse(await Homey.get("users") ?? "{}"),
            gotData: true,
        })
    }

    getType(user: User) {
        if (user.type === 0) return <Badge color={BadgeColor.BLUE} size={BadgeSize.SMALL}><i
            className="fas fa-id-badge"></i> {user.userId}</Badge>
        if (user.type === 1) return <Badge color={BadgeColor.PURPLE} size={BadgeSize.SMALL}><i
            className="fas fa-id-badge"></i> {user.userId}</Badge>
        if (user.type === 2) return <Badge color={BadgeColor.ORANGE} size={BadgeSize.SMALL}><i
            className="fas fa-id-badge"></i> {user.userId}</Badge>
        if (!user.type) return <Badge color={BadgeColor.GRAY} size={BadgeSize.SMALL}><i
            className="fas fa-id-badge"></i> {user.userId}</Badge>
    }

    getUserComponents() {
        let result: any[] = [];
        this.state.users.forEach((u) => {
            result.push(
                <MenuItemGroup>
                    <MenuItemWrapper>
                    <span>{u.chatName}&nbsp;
                        {this.getType(u)}
                    </span>
                        <button className="removeButton hy-nostyle" onClick={() => this.deleteUser(u.userId)}><i
                            className="fas fa-user-slash"></i></button>
                    </MenuItemWrapper>
                </MenuItemGroup>
            )
        });
        return result;
    }

    render() {
        if (!this.state.gotData) return <Loading fullscreen={true}/>
        else return (
            <MenuWrapper title={Homey.__("settings.userMenu.users")}
                         onBack={() => this.props.changeView(Views.MainMenu)}>
                {this.getUserComponents()}
                <MenuItemGroup>
                    <span className={"itemGroupHint"}>{Homey.__("settings.userMenu.legend")}: </span>
                    <Badge color={BadgeColor.BLUE}
                           size={BadgeSize.SMALL}>{Homey.__("settings.userMenu.user")}</Badge>&nbsp;
                    <Badge color={BadgeColor.PURPLE}
                           size={BadgeSize.SMALL}>{Homey.__("settings.userMenu.group")}</Badge>&nbsp;
                    <Badge color={BadgeColor.ORANGE}
                           size={BadgeSize.SMALL}>{Homey.__("settings.userMenu.supergroup")}</Badge>&nbsp;
                    <Badge color={BadgeColor.GRAY}
                           size={BadgeSize.SMALL}>{Homey.__("settings.userMenu.unknown")}</Badge>
                </MenuItemGroup>
            </MenuWrapper>
        );
    }

    private deleteUser(userId: number) {
        let users = this.state.users.filter((u: User) => u.userId !== userId);
        this.setState({
            gotData: false,
            users: users
        });
        Homey.set('users', JSON.stringify(users))?.then(() =>
            this.setState({
                gotData: true,
            })
        );
    }
}

