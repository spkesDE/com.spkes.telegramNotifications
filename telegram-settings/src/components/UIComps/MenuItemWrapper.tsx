import React from 'react';
import '../../App.css';
import './MenuItemWrapper.css'

interface Props {
    children: React.ReactNode,
    className?: string
    key?: React.Key
}

export default class MenuItemWrapper extends React.Component<Props, any> {
    render() {
        return (
            <div key={this.props.key}
                 className={"menuItemWrapper " + (this.props.className ? this.props.className : "")}>
                {this.props.children}
            </div>
        );
    }
}

