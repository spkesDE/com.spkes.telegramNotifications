import React from 'react';
import '../App.css';
import MenuItemGroup from "../components/UIComps/MenuItemGroup";
import MenuItemWrapper from "../components/UIComps/MenuItemWrapper";
import Switch from "../components/UIComps/Switch";
import Question from "../../../question";
import {Views} from "../statics/Views";
import Badge from "../components/UIComps/Badge";
import {BadgeColor} from "../statics/Colors";
import Popup from "../components/UIComps/Popup";
import Loading from "./Loading";
import Homey from "../Homey";

interface Props {
    question?: Question
    changeViewOnSave: Function
}

interface State {
    answers: number
    question: string;
    UUID: string;
    buttons: string[];
    keepButtons: boolean;
    disable_notification: boolean;
    columns: number;
    gotData: boolean;
    showDeletePopup: boolean;
}

export default class QuestionMenu extends React.Component<Props, State> {

    constructor(props: Props) {
        super(props);

        this.state = {
            answers: props.question?.buttons.length ?? 2,
            question: props.question?.question ?? "",
            UUID: props.question?.UUID ?? this.getNanoId(),
            buttons: props.question?.buttons ?? [],
            keepButtons: props.question?.keepButtons ?? false,
            disable_notification: props.question?.disable_notification ?? false,
            columns: props.question?.columns ?? 2,
            gotData: true,
            showDeletePopup: false
        }
    }

    async onSave() {
        console.log("Saving question...")
        await this.setState({gotData: false});
        let questions: Question[] = JSON.parse(await Homey.get('questions') ?? "[]");
        questions = questions.filter((q) => q.UUID !== this.state.UUID)
        questions.push({
            UUID: this.state.UUID, buttons: this.state.buttons,
            columns: this.state.columns, disable_notification: this.state.disable_notification,
            keepButtons: this.state.keepButtons, question: this.state.question
        })
        await Homey.set('questions', JSON.stringify(questions));
        await this.setState({gotData: true});
        console.log("Question saved.")
        this.props.changeViewOnSave(Views.Questions_Overview);
    }

    async deleteQuestion() {
        await this.setState({gotData: false});
        let questions: Question[] = JSON.parse(await Homey.get('questions') ?? "[]");
        questions = questions.filter((q) => q.UUID !== this.state.UUID)
        await Homey.set('questions', JSON.stringify(questions));
        await this.setState({gotData: true});
        this.props.changeViewOnSave(Views.Questions_Overview);
    }

    /**
     * NanoId https://github.com/ai/nanoid
     *
     * @param length
     * @returns {string|string}
     */
    getNanoId(length = 10) {
        return crypto.getRandomValues(new Uint8Array(length))
            .reduce(((t, e) => t += (e &= 63) < 36 ? e.toString(36) : e < 62 ? (e - 26).toString(36)
                .toUpperCase() : e > 62 ? '-' : '_'), '');
    }

    getAnswerFields() {
        let result = [];
        for (let i = 0; i < this.state.answers; i++) {
            result.push(<MenuItemWrapper key={"wrapper-" + i}>
                <input className="menuItem-input-full hy-nostyle"
                       type="text"
                       key={"answer-" + i}
                       required={i === 0}
                       placeholder={Homey.__("settings.questionMenu.answerPlaceholder")}
                       onChange={(e) => {
                           if (e.currentTarget.value == "") return;
                           let buttons = this.state.buttons
                           buttons[i] = e.currentTarget.value;
                           this.setState({buttons: buttons});
                       }}
                       defaultValue={this.state.buttons[i]}/>
            </MenuItemWrapper>);
        }
        return result;
    }

    render() {
        if (!this.state.gotData) return <Loading fullscreen={true}/>
        else return (<>
            <MenuItemGroup>
                <MenuItemWrapper>
                    <label className={"menuItem-label hy-nostyle"}>{Homey.__("settings.questionMenu.question")}</label>
                    <input className="menuItem-input hy-nostyle"
                           type="text"
                           required={true}
                           placeholder={Homey.__("settings.questionMenu.questionPlaceholder")}
                           onChange={(e) => {
                               this.setState({question: e.currentTarget.value})
                           }}
                           defaultValue={this.state.question}/>
                </MenuItemWrapper>
            </MenuItemGroup>
            <MenuItemGroup>
                <MenuItemWrapper>
                    <h2>{Homey.__("settings.questionMenu.keepButton")}</h2>
                    <Switch
                        onChange={(e) => {
                            this.setState({keepButtons: e.currentTarget.checked})
                        }}
                        value={this.state.keepButtons}
                    />
                </MenuItemWrapper>
                <MenuItemWrapper>
                    <h2>{Homey.__("settings.questionMenu.disableNotifications")}</h2>
                    <Switch
                        onChange={(e) => {
                            this.setState({disable_notification: e.currentTarget.checked})
                        }}
                        value={this.state.disable_notification}/>
                </MenuItemWrapper>
                <MenuItemWrapper>
                    <h2>{Homey.__("settings.questionMenu.btnPerRow")}</h2>
                    <div style={{display: "flex"}}>
                        <input id="columnSize" max="4" min="1" type="range"
                               onChange={(e) => {
                                   this.setState({columns: Number(e.currentTarget.value)});
                               }}
                               defaultValue={this.state.columns}/>&nbsp;
                        <Badge color={BadgeColor.GRAY}>{this.state.columns}</Badge>
                    </div>
                </MenuItemWrapper>
            </MenuItemGroup>
            <MenuItemGroup>
                {this.getAnswerFields()}
                <MenuItemWrapper className={"noPadding"} key={"wrapper-save"}>
                    <button
                        className={"menuItem-button-blue-noRadiusTop hy-nostyle"}
                        onClick={() => {
                            this.setState({answers: this.state.answers + 1})
                        }}>
                        <i className="fa fa-plus"></i> {Homey.__("settings.questionMenu.addAnswer")}
                    </button>
                </MenuItemWrapper>
            </MenuItemGroup>

            <MenuItemGroup>
                <MenuItemWrapper className={"noPadding"}>
                    <button
                        className={"menuItem-button-green hy-nostyle"}
                        onClick={() => this.onSave()}
                    >
                        {Homey.__("settings.questionMenu.saveQuestion")}
                    </button>
                </MenuItemWrapper>
            </MenuItemGroup>

            <MenuItemGroup>
                <MenuItemWrapper className={"noPadding"}>
                    <button
                        className={"menuItem-button-danger hy-nostyle"}
                        onClick={() => this.setState({showDeletePopup: !this.state.showDeletePopup})}>
                        {Homey.__("settings.questionMenu.deleteQuestion")}
                    </button>
                </MenuItemWrapper>
            </MenuItemGroup>

            <Popup title={Homey.__("settings.misc.warning")} icon={"fa-exclamation-triangle"}
                   show={this.state.showDeletePopup}
                   closeHandler={() => {
                       this.setState({showDeletePopup: false})
                   }}>
                {Homey.__("settings.questionMenu.questionPopup")}
                <br/><br/>
                <button
                    className={"yesButton hy-nostyle"}
                    onClick={() =>
                        this.deleteQuestion()}>
                    {Homey.__("settings.misc.yes")}
                </button>

                <button
                    className={"noButton hy-nostyle"}
                    onClick={() => this.setState({showDeletePopup: false})}>
                    {Homey.__("settings.misc.no")}
                </button>
            </Popup>
        </>);
    }
}

