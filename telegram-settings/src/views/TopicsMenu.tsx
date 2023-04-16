import React from 'react';
import '../App.css';
import MenuWrapper from "../components/UIComps/MenuWrapper";
import {Views} from "../statics/Views";
import MenuItemWrapper from "../components/UIComps/MenuItemWrapper";
import MenuItemGroup from "../components/UIComps/MenuItemGroup";
import Badge from "../components/UIComps/Badge";
import {BadgeColor} from "../statics/Colors";
import {Chat} from "../statics/Chat";
import Loading from "./Loading";
import Homey from "../Homey";

interface Props {
    changeView: Function
}

interface State {
    chats: Chat[]
    gotData: boolean
}

export default class TopicsMenu extends React.Component<Props, State> {
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

    getChatComponents() {
        let result: any[] = [];
        this.state.chats.forEach((u) => {
            if (u.topics && u.topics.length > 0)
                result.push(
                    <MenuItemGroup>
                        <p className="itemGroupTitle">
                            {u.chatName}
                        </p>
                        {u.topics.map((t) => {
                            return (
                                <MenuItemWrapper>
                                    <span>{t.topicName}&nbsp;
                                        <Badge color={BadgeColor.GRAY}>
                                            <i className="fas fa-fingerprint"></i> {t.topicId}
                                        </Badge>
                                    </span>
                                    <button className="removeButton hy-nostyle"
                                            onClick={() => this.deleteTopic(u.chatId, t.topicId)}><i
                                        className="fas fa-trash-alt"></i></button>
                                </MenuItemWrapper>
                            );
                        })}
                    </MenuItemGroup>
                )
        });
        return result;
    }

    render() {
        if (!this.state.gotData) return <Loading fullscreen={true}/>
        else return (
            <MenuWrapper title={Homey.__("settings.topicsMenu.topicsMenu")}
                         onBack={() => this.props.changeView(Views.MainMenu)}>
                {this.getChatComponents()}
            </MenuWrapper>
        );
    }

    private deleteTopic(chatId: number, topicId: number) {
        let chats = this.state.chats;
        let chat = this.state.chats.find((u: Chat) => u.chatId === chatId);
        if (!chat || !chat.topics) return;
        chat.topics = chat.topics.filter((t) => t.topicId !== topicId);
        chats = this.state.chats.filter((u: Chat) => u.chatId !== chatId);
        chats.push(chat);
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

