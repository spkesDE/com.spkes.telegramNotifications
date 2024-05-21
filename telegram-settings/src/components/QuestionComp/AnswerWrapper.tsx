import React from 'react';
import '../../App.css';
import './AnswerWrapper.css'

interface Props {
    children: React.ReactNode,
    className?: string
    style?: React.CSSProperties
    key?: React.Key
    onClick?: React.MouseEventHandler<HTMLDivElement>
}

export default class AnswerWrapper extends React.Component<Props, any> {
    render() {
        return (
            <div key={this.props.key}
                 style={this.props.style}
                 className={"answerWrapper " + (this.props.className ? this.props.className : "")}
                 onClick={this.props.onClick}
            >
                {this.props.children}
            </div>
        );
    }
}

