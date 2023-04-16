import React from 'react';
import '../App.css';
import {Views} from "../statics/Views";
import MenuItemGroup from "../components/UIComps/MenuItemGroup";
import MenuItemWrapper from "../components/UIComps/MenuItemWrapper";
import Badge from "../components/UIComps/Badge";
import {BadgeColor, BadgeSize, BadgeType} from "../statics/Colors";
import {Question} from "../statics/Question";
import Loading from "./Loading";
import Homey from "../Homey";

interface Props {
    changeView: Function
}

interface State {
    questions: Question[]
    gotData: boolean
}

export default class QuestionOverview extends React.Component<Props, State> {
    constructor(props: Props) {
        super(props);
        this.state = {
            questions: [],
            gotData: process.env!.NODE_ENV === "development"
        }
    }

    async componentDidMount() {
        this.setState({
            questions: JSON.parse(await Homey.get("questions") ?? "[]"),
            gotData: true,
        })
    }

    getQuestionsComponents() {
        let result: any[] = [];
        this.state.questions.forEach((q) => {
            result.push(
                <MenuItemGroup>
                    <MenuItemWrapper onClick={() => this.props.changeView(Views.Questions_Edit, q)}>
                        <span style={{paddingBottom: "var(--su)", paddingTop: "var(--su)"}}>
                            {q.question}&nbsp;
                            <Badge color={BadgeColor.GRAY}
                                   type={BadgeType.PILL}
                                   size={BadgeSize.SMALL}>
                            <i className="fas fa-fingerprint"></i> {q.UUID}
                            </Badge>&nbsp;
                            <Badge color={BadgeColor.GRAY}
                                   type={BadgeType.PILL}
                                   size={BadgeSize.SMALL}>
                                <i className="fas fa-keyboard"></i> {q.buttons.length}
                            </Badge>
                        </span>
                        <span
                            className={"editButton hy-nostyle"}>
                            {Homey.__("settings.misc.edit")} <i className="fa fa-chevron-right"></i>
                        </span>
                    </MenuItemWrapper>
                </MenuItemGroup>
            )
        });
        return result;
    }

    render() {
        if (!this.state.gotData) return <Loading fullscreen={true}/>
        else return (<>{this.getQuestionsComponents()}</>);
    }
}

