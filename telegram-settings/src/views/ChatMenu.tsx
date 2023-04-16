import React from 'react';
import '../App.css';
import MenuWrapper from "../components/UIComps/MenuWrapper";
import {Views} from "../statics/Views";
import MenuItemWrapper from "../components/UIComps/MenuItemWrapper";
import MenuItemGroup from "../components/UIComps/MenuItemGroup";
import Badge from "../components/UIComps/Badge";
import {BadgeColor, BadgeSize, BadgeType} from "../statics/Colors";
import {Chat} from "../statics/Chat";
import Loading from "./Loading";
import Homey from "../Homey";
import EmptyWidget from "../components/UIComps/EmptyWidget";

interface Props {
    changeView: Function
}

interface State {
    chats: Chat[]
    gotData: boolean
}

export default class ChatMenu extends React.Component<Props, State> {
    constructor(props: Props) {
        super(props);
        this.state = {
            chats: [],
            gotData: process.env!.NODE_ENV === "development"
        }
    }

    async componentDidMount() {
        this.setState({
            chats: JSON.parse(await Homey.get("users") ?? "[]"),
            gotData: true,
        })
    }

    getType(user: Chat) {
        if (user.type === 0) return <Badge color={BadgeColor.BLUE} size={BadgeSize.SMALL}><i
            className="fas fa-id-badge"></i> {user.chatId}</Badge>
        if (user.type === 1) return <Badge color={BadgeColor.PURPLE} size={BadgeSize.SMALL}><i
            className="fas fa-id-badge"></i> {user.chatId}</Badge>
        if (user.type === 2) return <Badge color={BadgeColor.ORANGE} size={BadgeSize.SMALL}><i
            className="fas fa-id-badge"></i> {user.chatId}</Badge>
        if (!user.type) return <Badge color={BadgeColor.GRAY} size={BadgeSize.SMALL}><i
            className="fas fa-id-badge"></i> {user.chatId}</Badge>
    }

    getChatComponents() {
        let result: any[] = [];
        if (this.state.chats.length === 0) return <EmptyWidget/>
        this.state.chats.forEach((u) => {
            result.push(
                <MenuItemGroup>
                    <MenuItemWrapper>
                    <span>{u.chatName}&nbsp;
                        {this.getType(u)}
                        {u.topics && u.topics.length > 0 &&
                          <>&nbsp; <Badge color={BadgeColor.GRAY}
                                          type={BadgeType.PILL}
                                          size={BadgeSize.SMALL}>
                            <i className="fas fa-folder"></i> {u.topics?.length}
                          </Badge></>
                        }
                    </span>
                        <button className="removeButton hy-nostyle" onClick={() => this.deleteChat(u.chatId)}><i
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
                {this.getChatComponents()}
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

    private deleteChat(chatId: number) {
        let chats = this.state.chats.filter((u: Chat) => u.chatId !== chatId);
        this.setState({
            gotData: false,
            chats: chats
        });
        Homey.set('users', JSON.stringify(chats))?.then(() =>
            this.setState({
                gotData: true,
            })
        );
    }
}

