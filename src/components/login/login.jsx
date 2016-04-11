// Copyright (c) 2016 ZBox, Spa. All Rights Reserved.
// See LICENSE.txt for license information.

import $ from 'jquery';
import React from 'react';
import {browserHistory} from 'react-router';

import UserStore from '../../stores/user_store.jsx';
import ZimbraStore from '../../stores/zimbra_store.jsx';

import Constants from '../../utils/constants.jsx';
import * as Client from '../../utils/client.jsx';

import Panel from '../panel.jsx';
import LoginEmail from './login_email.jsx';
import MessageBar from '../message_bar.jsx';

const messageTypes = Constants.MessageType;

export default class Login extends React.Component {
    constructor(props) {
        super(props);

        this.submit = this.submit.bind(this);
        this.onUserChange = this.onUserChange.bind(this);

        this.state = {
            user: null
        };
    }
    componentWillUmount() {
        $('body').removeClass('blank');
    }
    componentDidMount() {
        Client.isLoggedIn((data) => {
            if (data && data.logged_in) {
                browserHistory.push('/mailboxes');
            } else {
                $('body').addClass('blank');
            }
        });
    }
    onUserChange() {
        const user = UserStore.getCurrentUser();

        this.setState({user});

        if (user) {
            browserHistory.push('/mailboxes');
        }
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
                return Client.getAllCos(
                    (cosData) => {
                        ZimbraStore.setAllCos(cosData);
                        browserHistory.push('/mailboxes');
                    }
                );
            },
            (err) => {
                this.setState({loginError: err.message});
            }
        );
    }
    render() {
        if (this.state.user) {
            return <div>Done check login</div>;
        }

        let loginError;
        if (this.state.loginError) {
            loginError = (
                <MessageBar
                    message={this.state.loginError}
                    type={messageTypes.ERROR}
                    position='relative'
                    canClose={false}
                />
            );
        } else if (this.props.location.query.error === Constants.ZimbraCodes.AUTH_EXPIRED) {
            loginError = (
                <MessageBar
                    message='Tu sesión a expirado. Por favor ingresa nuevamente.'
                    type={messageTypes.INFO}
                    position='relative'
                    canClose={false}
                />
            );
        } else {
            loginError = (
                <MessageBar
                    message='Necesitas iniciar sesión o registrarte para continuar.'
                    type={messageTypes.ERROR}
                    position='relative'
                    canClose={false}
                />
            );
        }

        return (
            <div className='login-container'>
                <div className='row'>
                    <div className='col-md-12'>
                        <Panel
                            hasHeader={false}
                            error={loginError}
                            children={(
                                <LoginEmail
                                    submit={this.submit}
                                    loginError={this.state.loginError}
                                />
                            )}
                        />
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
    location: React.PropTypes.object.isRequired
};
