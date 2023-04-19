import React from 'react';
import '../App.css';
import MenuWrapper from "../components/UIComps/MenuWrapper";
import {Views} from "../statics/Views";
import {Question} from "../statics/Question";
import QuestionMenu from "./QuestionMenu";
import Homey from "../Homey";
import QuestionOverview from "./QuestionOverview";

interface Props {
    changeView: Function
}

interface State {
    currentView: Views
    targetQuestion?: Question
}

export default class QuestionMainMenu extends React.Component<Props, State> {
    constructor(props: Props) {
        super(props);
        this.state = {
            currentView: Views.Questions_Overview,
        }
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
                return {
                    comp: <QuestionOverview changeView={this.changeView.bind(this)}/>,
                    title: Homey.__("settings.questionMenu.questions"),
                    backView: Views.MainMenu,
                    addView: Views.Questions_Add
                };
            case Views.Questions_Add:
                return {
                    comp: <QuestionMenu changeViewOnSave={this.changeView.bind(this)}/>,
                    title: Homey.__("settings.questionMenu.addQuestion"),
                    backView: Views.Questions_Overview,
                    addView: undefined
                };
            case Views.Questions_Edit:
                return {
                    comp: <QuestionMenu changeViewOnSave={this.changeView.bind(this)}
                                        question={this.state.targetQuestion}/>,
                    title: Homey.__("settings.questionMenu.editQuestion"),
                    backView: Views.Questions_Overview,
                    addView: undefined
                };
            default:
                this.props.changeView(Views.MainMenu);
                return {
                    comp: <QuestionOverview changeView={this.changeView.bind(this)}/>,
                    title: Homey.__("settings.questionMenu.questions"),
                    backView: Views.MainMenu,
                    addView: undefined
                };
        }
    }

    render() {
        return (
            <MenuWrapper title={this.getView().title}
                         onBack={() => this.changeView(this.getView().backView)}
                         onAdd={this.getView().addView !== undefined ? () => this.changeView(this.getView().addView) : undefined}
            >
                {this.getView().comp}
            </MenuWrapper>
        );
    }
}

