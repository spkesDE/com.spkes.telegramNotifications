import React from 'react';
import '../../App.css';
import './AnswerInput.css'

interface Props {
    children: React.ReactNode,
    className?: string
    key?: React.Key
    style?: React.CSSProperties
    onClick?: React.MouseEventHandler<HTMLDivElement>
}

export default class AnswerInput extends React.Component<Props, any> {
    render() {
        return (
            <div key={this.props.key}
                 style={this.props.style}
                 className={"answerInput " + (this.props.className ? this.props.className : "")}
                 onClick={this.props.onClick}
            >
                {this.props.children}
            </div>
        );
    }
}

