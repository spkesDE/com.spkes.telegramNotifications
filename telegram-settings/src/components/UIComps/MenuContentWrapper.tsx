import React from 'react';
import '../../App.css';
import './MenuContentWrapper.css'

interface Props {
    children: React.ReactNode,
    className?: string
    key?: React.Key
    onClick?: React.MouseEventHandler<HTMLDivElement>
}

export default class MenuContentWrapper extends React.Component<Props, any> {
    render() {
        return (
            <div key={this.props.key}
                 className={"menuContentWrapper " + (this.props.className ? this.props.className : "")}
                 onClick={this.props.onClick}
            >
                {this.props.children}
            </div>
        );
    }
}

