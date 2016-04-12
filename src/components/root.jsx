// Copyright (c) 2016 ZBox, Spa. All Rights Reserved.
// See LICENSE.txt for license information.

import * as Client from '../utils/client.jsx';

import React from 'react';

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
                    browserHistory.push('/accounts');
                }
            });
        }
    }
    componentWillReceiveProps(newProps) {
        this.redirectIfNecessary(newProps);
    }
    componentWillMount() {
        this.redirectIfNecessary(this.props);
    }
    render() {
        if (this.props.children == null) {
            return <div/>;
        }

        return this.props.children;
    }
}
Root.defaultProps = {
};

Root.propTypes = {
    children: React.PropTypes.object
};
