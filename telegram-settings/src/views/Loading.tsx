import React from 'react';
import '../App.css';
import Homey from "../Homey";

interface Props {
    fullscreen?: boolean;
}

interface State {

}

export default class Loading extends React.Component<Props, State> {
    constructor(props: Props) {
        super(props);
    }

    render() {
        if (this.props.fullscreen)
            return (
                <div className="loading">
                    <h1>{Homey.__("settings.misc.loading")}...</h1>
                    <i className="fas fa-spinner fa-pulse"></i>
                </div>
            );
        else
            return <h1>{Homey.__("settings.misc.loading")} <i className="fas fa-spinner fa-pulse"></i></h1>
    }
}

