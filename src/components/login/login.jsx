// Copyright (c) 2016 ZBox, Spa. All Rights Reserved.
// See LICENSE.txt for license information.

import $ from 'jquery';
import React from 'react';
import {browserHistory} from 'react-router';

import * as Client from '../../utils/client.jsx';
import LoginEmail from './login_email.jsx';
import MessageBar from '../message_bar.jsx';

export default class Login extends React.Component {
    constructor(props) {
        super(props);

        this.submit = this.submit.bind(this);

        this.state = {
            doneCheckLogin: false
        };
    }
    componentWillUmount() {
        $('body').removeClass('blank');
    }
    componentDidMount() {
        Client.isLoggedIn((data) => {
            if (data && data.logged_in) {
                browserHistory.push('/accounts');
            } else {
                $('body').addClass('blank');
                this.setState({doneCheckLogin: true}); //eslint-disable-line react/no-did-mount-set-state
            }
        });
    }
    submit(email, password) {
        var state = this.state;

        if (!email) {
            state.loginError = 'El correo electrónico es obligatorio';
            this.setState(state);
            return;
        }

        if (!password) {
            state.loginError = 'La contraseña es obligatoria';
            this.setState(state);
            return;
        }

        this.setState({loginError: null});

        Client.login(email, password,
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

        let loginError;
        if (this.state.loginError) {
            loginError = (
                <MessageBar
                    message={this.state.loginError}
                    type='error'
                    position='relative'
                    canClose={false}
                />
            );
        } else {
            loginError = (
                <MessageBar
                    message='Necesitas iniciar sesión o registrarte para continuar.'
                    type='error'
                    position='relative'
                    canClose={false}
                />
            );
        }

        return (
            <div className='login-container'>
                <div className='row'>
                    <div className='col-md-12'>
                        <div className='hpanel'>
                            {loginError}
                            <div
                                className='panel-body'
                                style={{paddingLeft: '80px', paddingRight: '80px', paddingBottom: '60px'}}
                            >
                                <h2
                                    className='text-center'
                                    style={{marginBottom: '50px'}}
                                >
                                    {'Ingreso a ZBox Manager'}
                                </h2>
                                <LoginEmail
                                    submit={this.submit}
                                    loginError={this.state.loginError}
                                />
                            </div>
                        </div>
                    </div>
                </div>
                <div className='row'>
                    <div className='col-md-12 text-center'>
                        {'ZBox Manager : Administra tu Correo en la nube, seguro y facil de usar'}
                        <br/>
                        {'Copyright © 2016 ZBox Spa. Todos los derechos reservados'}
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
