// Copyright (c) 2016 ZBox, Spa. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import NProgress from 'nprogress';
import EventStore from '../stores/event_store.jsx';

export default class LoadingScreen extends React.Component {
    constructor(props) {
        super(props);

        this.onLoadingStart = this.onLoadingStart.bind(this);
        this.onLoadingEnd = this.onLoadingEnd.bind(this);
    }
    componentDidMount() {
        EventStore.addStartLoadingListener(this.onLoadingStart);
        EventStore.addEndLoadingListener(this.onLoadingEnd);
    }
    componentWillUmount() {
        EventStore.removeStartLoadingListener(this.onLoadingStart);
        EventStore.removeEndLoadingListener(this.onLoadingEnd);
    }
    onLoadingStart() {
        NProgress.start();
    }
    onLoadingEnd() {
        NProgress.done();
    }
    render() {
        return <div/>;
    }
}
