// Copyright (c) 2016 ZBox, Spa. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {ToastContainer, ToastMessage} from 'react-toastr';

import EventStore from '../stores/event_store.jsx';

const ToastMessageFactory = React.createFactory(ToastMessage.animation);

export default class ToastAlert extends React.Component {
    constructor(props) {
        super(props);

        this.addAlert = this.addAlert.bind(this);
    }
    componentDidMount() {
        EventStore.addToastListener(this.addAlert);
    }
    componentWillUnmount() {
        EventStore.removeToastListener(this.addAlert);
    }
    addAlert(message) {
        this.refs.alertContainer[message.type](
            message.body,
            message.title,
            message.options
        );
    }
    render() {
        return (
            <div>
                <ToastContainer
                    ref='alertContainer'
                    toastMessageFactory={ToastMessageFactory}
                    className='toast-top-center'
                />
            </div>
        );
    }
}
