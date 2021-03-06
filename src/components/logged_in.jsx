// Copyright (c) 2016 ZBox, Spa. All Rights Reserved.
// See LICENSE.txt for license information.

import LoadingScreen from './loading_screen.jsx';
import Header from './header.jsx';
import Sidebar from './sidebar.jsx';
import ToastAlert from './toast_alert.jsx';
import ProgressTask from './progress_task.jsx';

import React from 'react';

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

LoggedIn.defaultProps = {
};

LoggedIn.propTypes = {
    children: React.PropTypes.oneOfType([
        React.PropTypes.arrayOf(React.PropTypes.element),
        React.PropTypes.element
    ]),
    location: React.PropTypes.object.isRequired
};
