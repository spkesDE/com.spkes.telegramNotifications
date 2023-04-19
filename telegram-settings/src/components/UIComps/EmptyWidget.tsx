import React from 'react';
import '../../App.css';
import emptyStyle from './EmptyWidget.module.css'
import Homey from "../../Homey";

interface Props {
    happy?: boolean;
}

interface State {
}


export default class EmptyWidget extends React.Component<Props, State> {

    constructor(props: Props) {
        super(props);
    }

    render() {
        return (
            <div className={emptyStyle.widget}>
                {Homey.__('settings.misc.empty')}! {this.props.happy ? <i className="fas fa-smile-beam"></i> :
                <i className="fas fa-sad-tear"></i>}
            </div>
        );
    }
}

