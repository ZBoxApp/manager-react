// Copyright (c) 2016 ZBox, Spa. All Rights Reserved.
// See LICENSE.txt for license information.

import $ from 'jquery';

import React from 'react';

export default class NotLoggedIn extends React.Component {
    componentDidMount() {
        $('body').addClass('sticky');
        $('#root').addClass('container-fluid container-fluid-login');
    }
    componentWillUnmount() {
        $('body').attr('class', '');
        $('#root').attr('class', '');
    }
    render() {
        return this.props.children;
    }
}

NotLoggedIn.defaultProps = {
};

NotLoggedIn.propTypes = {
    children: React.PropTypes.object,
    location: React.PropTypes.object
};
