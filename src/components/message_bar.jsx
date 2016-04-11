// Copyright (c) 2016 ZBox, Spa. All Rights Reserved.
// See LICENSE.txt for license information.

import $ from 'jquery';
import React from 'react';

import Constants from '../utils/constants.jsx';

const messageType = Constants.MessageType;

export default class MessageBar extends React.Component {
    constructor(props) {
        super(props);
        this.fadeOut = this.fadeOut.bind(this);
        this.handleClose = this.handleClose.bind(this);
    }
    componentWillMount() {
        if (this.props.message) {
            this.setState({message: this.props.message});
        }
    }
    componentWillReceiveProps(newProps) {
        this.setState({message: newProps.message});
    }
    componentDidMount() {
        this.fadeOut(this.props.autocloseInSecs * 1000);
    }
    componentDidUpdate() {
        this.fadeOut(this.props.autocloseInSecs * 1000);
    }
    fadeOut(time) {
        const self = this;
        if (self.state.message && self.props.autoclose) {
            $('div.flash').delay(time).fadeOut(1000, () => {
                self.handleClose();
            });
        }
    }
    handleClose() {
        this.setState({message: null});
    }
    render() {
        const message = this.state.message;
        if (message) {
            let dismissible;
            let closeButton;
            if (this.props.canClose) {
                dismissible = 'alert-dismissible';
                closeButton = (
                    <button
                        type='button'
                        className='close'
                        data-dismiss='alert'
                        aria-label='Close'
                        onClick={() => this.handleClose(500)}
                    >
                        <span
                            aria-hidden='true'
                            style={{color: '#fff'}}
                        >
                            {'x'}
                        </span>
                    </button>
                );
            }

            const alertClass = `alert flash-${this.props.type.toLowerCase()} ${dismissible}`;
            let icon;
            switch (this.props.type) {
            case messageType.ERROR:
                icon = (<i className='fa fa-exclamation-circle'></i>);
                break;
            case messageType.INFO:
                icon = (<i className='fa fa-info-circle'></i>);
                break;
            case messageType.SUCCESS:
                icon = (<i className='fa fa-check-circle'></i>);
                break;
            case messageType.WARNING:
                icon = (<i className='fa fa-exclamation-triangle'></i>);
                break;
            }

            return (
                <div
                    className='flash'
                    style={{position: this.props.position, display: 'block'}}
                >
                    <div
                        className={alertClass}
                        role='alert'
                    >
                        {closeButton}
                        {icon} {message}
                    </div>
                </div>
            );
        }

        return <div/>;
    }
}

MessageBar.defaultProps = {
    message: null,
    type: 'ERROR',
    position: 'relative',
    canClose: true,
    autoclose: false,
    autocloseInSecs: 10
};

MessageBar.propTypes = {
    message: React.PropTypes.string.isRequired,
    type: React.PropTypes.oneOf(['SUCCESS', 'ERROR', 'WARNING', 'INFO', 'LOCKED']),
    position: React.PropTypes.oneOf(['absolute', 'fixed', 'relative', 'static', 'inherit']),
    canClose: React.PropTypes.bool,
    autoclose: React.PropTypes.bool,
    autocloseInSecs: React.PropTypes.number
};
