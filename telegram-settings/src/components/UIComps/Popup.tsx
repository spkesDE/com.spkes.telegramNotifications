import React, {MouseEventHandler} from 'react';
import '../../App.css';
import popupStyles from './Popup.module.css'

interface Props {
    title: string,
    show: boolean,
    icon?: string,
    closeHandler: MouseEventHandler<HTMLSpanElement>,
    children?: React.ReactNode,
    className?: string
    key?: React.Key
}

interface State {
    show: boolean
}

export default class Popup extends React.Component<Props, State> {

    constructor(props: Props) {
        super(props);
        this.state = {
            show: props.show
        }
    }

    componentDidUpdate(prevProps: Readonly<Props>, prevState: Readonly<State>) {
        if (prevProps.show !== this.props.show) this.setState({show: this.props.show})
    }

    render() {
        return (
            <div style={{visibility: this.state.show ? "visible" : "hidden", opacity: this.state.show ? "1" : "0"}}
                 className={popupStyles.overlay}>
                <div className={popupStyles.popup + (this.props.className ? " " + this.props.className : "")}>
                    <h1>{this.props.icon ? <i className={"fas " + this.props.icon}></i> : ""} {this.props.title}</h1>
                    <span className={popupStyles.close} onClick={this.props.closeHandler}>
                      &times;
                    </span>
                    <hr/>
                    <div className={popupStyles.content}>{this.props.children}</div>
                </div>
            </div>
        );
    }
}

