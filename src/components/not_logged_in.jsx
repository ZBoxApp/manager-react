// Copyright (c) 2016 ZBox, Spa. All Rights Reserved.
// See LICENSE.txt for license information.

import $ from 'jquery';

import React from 'react';

export default class NotLoggedIn extends React.Component {
    componentDidMount() {
        $('body').attr('class', 'sticky');
        $('#root').attr('class', 'container-fluid');
    }
    componentWillUnmount() {
        $('body').attr('class', '');
        $('#root').attr('class', '');
    }
    render() {
        return (
            <div className='inner-wrap'>
                <div className='row content'>
                    {this.props.children}
                </div>
            </div>
        );
    }
}

NotLoggedIn.defaultProps = {
};

NotLoggedIn.propTypes = {
    children: React.PropTypes.object,
    location: React.PropTypes.object
};
