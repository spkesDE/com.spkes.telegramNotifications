import React from 'react';
import '../../App.css';
import './LogWidget.css'
import Badge from "../UIComps/Badge";
import {BadgeColor, BadgeFloat, BadgeSize, BadgeType} from "../../statics/Colors";

enum Types {
    Info,
    Error,
    Debug
}

interface Props {
    date?: string
    message: string
    type: Types
}

export default class LogWidget extends React.Component<Props, any> {
    render() {
        return (
            <div className="logWidget">
                <Badge color={this.getLogTypeColor()}>
                    {this.getLogType()}
                </Badge>
                {this.props.type === Types.Error &&
                  <Badge color={BadgeColor.GRAY} style={{marginLeft: ".2em"}}
                         onClick={() => navigator.clipboard.writeText(this.props.message)}>
                    <i className={"fa fa-copy"}></i> Copy
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
                return "Info";
            case Types.Error:
                return "Error";
            case Types.Debug:
                return "Debug";
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
