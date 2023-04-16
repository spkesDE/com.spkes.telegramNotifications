import React from 'react';
import '../../App.css';
import './MenuWrapper.css'
import Homey from "../../Homey";

interface Props {
    children: React.ReactNode,
    title: string
    onBack?: Function
    onAdd?: Function
    customOnAddText?: any
}

export default class MenuWrapper extends React.Component<Props, any> {
    onBack(e: React.MouseEvent<HTMLButtonElement>) {
        if (this.props.onBack)
            this.props.onBack(e)
    }

    onAdd(e: React.MouseEvent<HTMLButtonElement>) {
        if (this.props.onAdd)
            this.props.onAdd(e)
    }

    render() {
        return (
            <>
                <div className="topBar hy-nostyle">
                    {this.props.onBack !== undefined ? (
                        <button className="leftControl hy-nostyle" onClick={(e) => this.onBack(e)}>
                            <i className="fa fa-chevron-left"></i> {Homey.__("settings.misc.back")}
                        </button>
                    ) : (
                        <div></div>
                    )}
                    <div className="title hy-nostyle">
                        {this.props.title}
                    </div>
                    {this.props.onAdd !== undefined ? (
                        <button className="rightControl hy-nostyle" onClick={(e) => this.onAdd(e)}>
                            {this.props.customOnAddText ? this.props.customOnAddText : <i className="fa fa-plus"></i>}
                        </button>
                    ) : (
                        <div></div>
                    )}
                </div>
                <div className="menuWrapperContent">
                    {this.props.children}
                </div>

            </>
        );
    }
}

