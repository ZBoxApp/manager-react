// Copyright (c) 2016 ZBox, Spa. All Rights Reserved.
// See LICENSE.txt for license information.

import LoadingScreen from './loading_screen.jsx';
import Header from './header.jsx';
import Sidebar from './sidebar.jsx';
import ToastAlert from './toast_alert.jsx';
import ProgressTask from './progress_task.jsx';

import React from 'react';
import PropTypes from 'prop-types';

export default class LoggedIn extends React.Component {
    render() {
        return (
            <div>
                <ProgressTask/>
                <ToastAlert/>
                <LoadingScreen/>
                <Header/>
                <Sidebar location={this.props.location}/>
                <div id='wrapper'>
                    {this.props.children}
                </div>
            </div>
        );
    }
}

LoggedIn.propTypes = {
    children: PropTypes.oneOfType([
        PropTypes.arrayOf(PropTypes.element),
        PropTypes.element
    ]),
    location: PropTypes.object.isRequired
};
