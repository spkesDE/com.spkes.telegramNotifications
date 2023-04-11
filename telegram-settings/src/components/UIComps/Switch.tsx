import React, {ChangeEventHandler} from 'react';
import '../../App.css';
import './Switch.css'

interface Props {
    id?: string;
    onChange: ChangeEventHandler<HTMLInputElement>;
    value?: boolean
    right?: boolean;
}

export default class Switch extends React.Component<Props, any> {
    render() {
        return (
            <label className={"switch " + (this.props.right || this.props.right == undefined ? "right" : "")}>
                <input
                    className="hy-nostyle"
                    id={this.props.id}
                    type="checkbox"
                    defaultChecked={this.props.value}
                    onChange={this.props.onChange}/>
                <span className="slider round"></span>
            </label>
        );
    }
}


