// Copyright (c) 2016 ZBox, Spa. All Rights Reserved.
// See LICENSE.txt for license information.

import * as Client from '../../utils/client.jsx';
import LoginEmail from './login_email.jsx';

import {browserHistory, Link} from 'react-router';

import React from 'react';

export default class Login extends React.Component {
    constructor(props) {
        super(props);

        this.submit = this.submit.bind(this);

        this.state = {
            doneCheckLogin: false
        };
    }
    componentDidMount() {
        Client.isLoggedIn((data) => {
            if (data && data.logged_in) {
                browserHistory.push('/accounts');
            } else {
                this.setState({doneCheckLogin: true}); //eslint-disable-line react/no-did-mount-set-state
            }
        });
    }
    submit(username, password) {
        this.setState({loginError: null});

        Client.login(username, password,
            () => {
                browserHistory.push('/accounts');
            },
            (err) => {
                this.setState({loginError: err.message});
            }
        );
    }
    render() {
        if (!this.state.doneCheckLogin) {
            return <div/>;
        }

        return (
            <div>
                <div className='signup-header'>
                    <Link to='/'>
                        <span className='fa fa-chevron-left'/>
                        {'Volver'}
                    </Link>
                </div>
                <div className='col-sm-12'>
                    <div className=''>
                        <h5 className='margin--less'>{'Iniciar Sesión'}</h5>
                        <h2 className=''>
                            {'ZBox Manager'}
                        </h2>
                        <LoginEmail
                            submit={this.submit}
                            loginError={this.state.loginError}
                        />
                    </div>
                </div>
            </div>
        );
    }
}

Login.defaultProps = {
};
Login.propTypes = {
    params: React.PropTypes.object.isRequired
};
