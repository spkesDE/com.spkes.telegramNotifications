import React from 'react';
import '../App.css';
import MenuWrapper from "../components/UIComps/MenuWrapper";
import {Views} from "../statics/Views";
import MenuItemGroup from "../components/UIComps/MenuItemGroup";
import MenuItemWrapper from "../components/UIComps/MenuItemWrapper";
import Badge from "../components/UIComps/Badge";
import {BadgeColor, BadgeSize, BadgeType} from "../statics/Colors";
import {Question} from "../statics/Question";
import Loading from "./Loading";
import QuestionMenu from "./QuestionMenu";

interface Props {
    changeView: Function
}

interface State {
    questions: Question[]
    gotData: boolean
    currentView: Views
    targetQuestion?: Question
}

export default class QuestionMainMenu extends React.Component<Props, State> {
    constructor(props: Props) {
        super(props);
        this.state = {
            currentView: Views.Questions_Overview,
            questions: [
                {
                    "question": "[DEBUG] Run tests",
                    "UUID": "gMTq5cbMzH",
                    "buttons": [
                        "Image Test",
                        "Message Test",
                        "Markdown Test",
                        "Question Test"
                    ],
                    "keepButtons": true,
                    "disable_notification": true,
                    "columns": 1
                },
                {
                    "question": "Hey, du bist nicht mehr Zuhause aber dein 🖥️ Computer läuft noch. Willst du ihn ausmachen?",
                    "UUID": "GfgjYoPMi4",
                    "buttons": [
                        "Ja",
                        "Nein"
                    ],
                    "keepButtons": false,
                    "disable_notification": false,
                    "columns": 1
                },
                {
                    "question": "MENU",
                    "UUID": "I_xU2WTot3",
                    "buttons": [
                        "⏫ 🪟 ⏫",
                        "🔼 🪟 🔼",
                        "⏬ 🪟 ⏬",
                        "🔊 🏡 🔊",
                        "🔊 🚽 🔊",
                        "🖥️ An",
                        "💡 An",
                        "😴 Mode",
                        "❌ Close"
                    ],
                    "keepButtons": true,
                    "disable_notification": false,
                    "columns": 3
                }
            ],
            gotData: process.env!.NODE_ENV === "development"
        }
    }

    async componentDidMount() {
        this.setState({
            questions: JSON.parse(await window.Homey.get("questions") ?? "[]"),
            gotData: true,
        })
    }

    getQuestionsComponents() {
        let result: any[] = [];
        this.state.questions.forEach((q) => {
            result.push(
                <MenuItemGroup>
                    <MenuItemWrapper>
                        <span>{q.question}&nbsp;
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
                        <button
                            className={"editButton hy-nostyle"}
                            onClick={() => this.changeView(Views.Questions_Edit, q)}>
                            Edit <i className="fa fa-chevron-right"></i>
                        </button>
                    </MenuItemWrapper>
                </MenuItemGroup>
            )
        });
        return result;
    }

    changeView(view: Views | undefined, targetQuestion?: Question) {
        if (view === undefined) return;
        this.setState({
            currentView: view,
            targetQuestion: targetQuestion
        });
    }

    getView() {
        switch (this.state.currentView) {
            case Views.Questions_Overview:
                this.componentDidMount().then();
                return {
                    comp: this.getQuestionsComponents(),
                    title: "Questions",
                    backView: Views.MainMenu,
                    addView: Views.Questions_Add
                };
            case Views.Questions_Add:
                return {
                    comp: <QuestionMenu changeViewOnSave={this.changeView.bind(this)}/>,
                    title: "Add Question",
                    backView: Views.Questions_Overview,
                    addView: undefined
                };
            case Views.Questions_Edit:
                return {
                    comp: <QuestionMenu changeViewOnSave={this.changeView.bind(this)}
                                        question={this.state.targetQuestion}/>,
                    title: "Edit Questions",
                    backView: Views.Questions_Overview,
                    addView: undefined
                };
            default:
                this.props.changeView(Views.MainMenu);
                return {
                    comp: this.getQuestionsComponents(),
                    title: "Questions",
                    backView: Views.MainMenu,
                    addView: undefined
                };
        }
    }

    render() {
        if (!this.state.gotData) return <Loading fullscreen={true}/>
        else return (
            <MenuWrapper title={this.getView().title}
                         onBack={() => this.changeView(this.getView().backView)}
                         onAdd={this.getView().addView !== undefined ? () => this.changeView(this.getView().addView) : undefined}
            >
                {this.getView().comp}
            </MenuWrapper>
        );
    }
}

