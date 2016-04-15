// Copyright (c) 2016 ZBox, Spa. All Rights Reserved.
// See LICENSE.txt for license information.

import $ from 'jquery';
import React from 'react';

import * as GlobalActions from '../../action_creators/global_actions.jsx';

export default class Accounts extends React.Component {
    componentDidMount() {
        $('#sidebar-accounts').addClass('active');
        GlobalActions.emitEndLoading();
    }
    componentWillUnmount() {
        $('#sidebar-accounts').removeClass('active');
    }

    render() {
        return <div/>;
    }
}
