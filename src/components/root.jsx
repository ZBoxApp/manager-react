// Copyright (c) 2016 ZBox, Spa. All Rights Reserved.
// See LICENSE.txt for license information.

import * as Client from '../utils/client.jsx';

import React from 'react';
import PropTypes from 'prop-types';
import WatchDeleteAccount from '../stores/watchDeletingAccount.jsx';

import {browserHistory} from 'react-router';

export default class Root extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            root: true
        };
        this.redirectIfNecessary = this.redirectIfNecessary.bind(this);
    }
    redirectIfNecessary(props) {
        if (props.location.pathname === '/') {
            Client.isLoggedIn((data) => {
                if (!data || !data.logged_in) {
                    browserHistory.push('/login');
                } else {
                    browserHistory.push('/companies');
                }
            });
        }
    }
    componentWillReceiveProps(newProps) {
        this.redirectIfNecessary(newProps);
    }

    componentWillMount() {
        WatchDeleteAccount.addListenerDeletingAccount();
        WatchDeleteAccount.addListenerOnDeletedAccount();
        this.redirectIfNecessary(this.props);
    }

    componentWillUnmount() {
        WatchDeleteAccount.removeListenerDeletingAccount();
        WatchDeleteAccount.removeListenerOnDeletedAccount();
    }

    render() {
        if (this.props.children == null) {
            return <div/>;
        }

        return this.props.children;
    }
}

Root.propTypes = {
    children: PropTypes.object
};
