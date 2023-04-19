import React from 'react';
import '../../App.css';
import './LogWidget.css'
import Badge from "../UIComps/Badge";
import {BadgeColor, BadgeFloat, BadgeSize, BadgeType} from "../../statics/Colors";
import Homey from "../../Homey";

enum Types {
    Info,
    Error,
    Debug
}

interface Props {
    date?: string
    message: string
    type: Types
    showExport: boolean
}

export default class LogWidget extends React.Component<Props, any> {
    render() {
        return (
            <div className="logWidget">
                <Badge color={this.getLogTypeColor()}>
                    {this.getLogType()}
                </Badge>
                {this.props.type === Types.Error && this.props.showExport &&
                  <Badge color={BadgeColor.GRAY} style={{marginLeft: ".2em"}}
                         onClick={() => navigator.clipboard.writeText(this.props.message)}>
                    <i className={"fa fa-copy"}></i> {Homey.__("settings.logMenu.copy")};
                  </Badge>
                }
                {this.props.date &&
                  <Badge size={BadgeSize.SMALL} color={BadgeColor.GRAY} type={BadgeType.PILL} float={BadgeFloat.RIGHT}>
                      {this.props.date}
                  </Badge>}
                <div className="codeBlock">
                    {this.props.message}
                </div>
            </div>
        );
    }

    getLogType() {
        switch (this.props.type) {
            case Types.Info:
                return Homey.__("settings.logMenu.info");
            case Types.Error:
                return Homey.__("settings.logMenu.error");
            case Types.Debug:
                return Homey.__("settings.logMenu.debug");
        }
    }

    getLogTypeColor() {
        switch (this.props.type) {
            case Types.Info:
                return BadgeColor.GREEN;
            case Types.Error:
                return BadgeColor.RED;
            case Types.Debug:
                return BadgeColor.BLUE;
        }
    }
}
