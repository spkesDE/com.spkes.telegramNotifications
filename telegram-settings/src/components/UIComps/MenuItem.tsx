import React, {MouseEventHandler} from 'react';
import '../../App.css';
import './MenuItem.css'
import Badge from "./Badge";
import {BadgeColor, BadgeSize, BadgeType} from "../../statics/Colors";
import Homey from "../../Homey";

interface Props {
    title: string;
    icon: string;
    onClick?: MouseEventHandler<HTMLButtonElement>;
    disabled?: boolean;
    className: string;
}

export default class MenuItem extends React.Component<Props, any> {
    onClick(e: React.MouseEvent<HTMLButtonElement, MouseEvent>) {
        if (this.props.onClick) this.props.onClick(e)
    }

    render() {
        return (
            <button className={"menuItem hy-nostyle" + (this.props.disabled ? " disabled" : "")}
                    onClick={(e) => this.onClick(e)}>
                <span className={"iconSpan " + this.props.className}>
                    <i className={"menuIcon fas " + this.props.icon}></i>
                </span>
                {this.props.title}
                {!this.props.disabled && <i className="fa fa-chevron-right"></i>}
                {this.props.disabled && <Badge
                  style={{marginLeft: "1em"}}
                  type={BadgeType.PILL}
                  color={BadgeColor.GRAY}
                  size={BadgeSize.SMALL}>{Homey.__("settings.misc.soon")}</Badge>}
            </button>
        );
    }
}

