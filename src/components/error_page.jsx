// Copyright (c) 2016 ZBox, Spa. All Rights Reserved.
// See LICENSE.txt for license information.

import $ from 'jquery';
import React from 'react';
import PropTypes from 'prop-types';
import {Link} from 'react-router';

export default class ErrorPage extends React.Component {
    componentDidMount() {
        $('body').attr('class', 'error');
    }
    componentWillUnmount() {
        $('body').attr('class', '');
    }
    render() {
        const title = this.props.location.query.title;
        const message = this.props.location.query.message;
        const linkMessage = this.props.location.query.linkmessage;
        let link = this.props.location.query.link;
        if (!link || link === '') {
            link = '/';
        }

        return (
            <div className='container-fluid'>
                <div className='error__container'>
                    <div className='error__icon'>
                        <i className='fa fa-exclamation-triangle'/>
                    </div>
                    <h2>{title}</h2>
                    <p>{message}</p>
                    <Link to={link}>{linkMessage}</Link>
                </div>
            </div>
        );
    }
}

ErrorPage.propTypes = {
    location: PropTypes.object
};
