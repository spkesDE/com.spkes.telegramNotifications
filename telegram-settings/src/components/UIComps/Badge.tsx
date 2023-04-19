import React, {CSSProperties, MouseEventHandler} from 'react';
import '../../App.css';
import './Badge.css'
import {BadgeColor, BadgeFloat, BadgeSize, BadgeType} from "../../statics/Colors";

interface Props {
    color: BadgeColor
    size?: BadgeSize
    type?: BadgeType
    float?: BadgeFloat
    style?: CSSProperties
    children: React.ReactNode,
    onClick?: MouseEventHandler<HTMLSpanElement>
}

export default class Badge extends React.Component<Props, any> {

    getBadgeType() {
        if (!this.props.type) return "";
        switch (this.props.type) {
            case BadgeType.PILL:
                return " badge-pill"
        }
    }

    render() {
        return (
            <span style={this.props.style} className={"badge "
                + this.props.color + " "
                + (this.props.size ? this.props.size : "")
                + (this.props.float ? " " + this.props.float : "")
                + (this.getBadgeType())}
                  onClick={this.props.onClick}
            >{this.props.children}</span>
        );
    }
}


