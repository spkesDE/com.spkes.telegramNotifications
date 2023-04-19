import React from 'react';
import '../../App.css';
import './MenuItemGroup.css'

interface Props {
    children: React.ReactNode,
    key?: React.Key
}

export default class MenuItemGroup extends React.Component<Props, any> {
    render() {
        return (
            <div key={this.props.key} className="menuItemGroup">
                {this.props.children}
            </div>
        );
    }
}

