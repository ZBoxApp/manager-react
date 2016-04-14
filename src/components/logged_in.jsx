// Copyright (c) 2016 ZBox, Spa. All Rights Reserved.
// See LICENSE.txt for license information.

import LoadingScreen from './loading_screen.jsx';
import Header from './header.jsx';
import Sidebar from './sidebar.jsx';

import React from 'react';

export default class LoggedIn extends React.Component {
    render() {
        return (
            <div>
                <LoadingScreen/>
                <Header/>
                <Sidebar location={this.props.location}/>
                <div className='wrapper'>
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
