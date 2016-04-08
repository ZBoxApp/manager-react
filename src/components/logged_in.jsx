// Copyright (c) 2016 ZBox, Spa. All Rights Reserved.
// See LICENSE.txt for license information.

import $ from 'jquery';

import React from 'react';

export default class LoggedIn extends React.Component {
    componentWillMount() {
        // Asignar aqui los css que correspondan
        $('#root').attr('class', 'manager-view');

        // Device tracking setup
        var iOS = (/(iPad|iPhone|iPod)/g).test(navigator.userAgent);
        if (iOS) {
            $('body').addClass('ios');
        }
    }
    componentWillUnmount() {
        $('#root').attr('class', '');
    }
    render() {
        let content = [];
        if (this.props.children) {
            content = this.props.children;
        } else {
            content.push(
                this.props.sidebar
            );
        }

        return (
            <div className=''>
                <div className='container-fluid'>
                    {content}
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
    sidebar: React.PropTypes.element,
    center: React.PropTypes.element
};
