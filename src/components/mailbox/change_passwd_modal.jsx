// Copyright (c) 2016 ZBox, Spa. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {Modal} from 'react-bootstrap';
import UserStore from '../../stores/user_store.jsx';
import PasswordStrengthMeter from 'react-password-strength-meter';
import * as GlobalActions from '../../action_creators/global_actions.jsx';
import Constants from '../../utils/constants.jsx';

const MessageTypes = Constants.MessageType;

export default class ConfirmDeleteModal extends React.Component {
    constructor(props) {
        super(props);

        this.handleChangePasswd = this.handleChangePasswd.bind(this);
        this.handlePasswd = this.handlePasswd.bind(this);
        this.restart = this.restart.bind(this);

        this.state = this.getStateFromStores();
    }

    restart() {
        this.setState({
            message: null
        });
    }

    handlePasswd(e) {
        const hidePasswd = this.refs.passwdfield;

        hidePasswd.value = e.target.value;
    }

    getStateFromStores() {
        const currentUser = UserStore.getCurrentUser();
        return {currentUser};
    }

    handleChangePasswd() {
        if (this.refs.passwdfield.value && this.refs.passwdfield.value.length > 0) {
            if (this.refs.passwdfield.value.length < 9) {
                return this.setState({
                    alert: true,
                    message: 'Su contraseña debe ser mayor a 8 caracteres.',
                    typeError: 'text-danger'
                });
            }

            this.props.data.setPassword(this.refs.passwdfield.value, () => {
                const message = {
                    error: 'Su contraseña se ha sido cambiada éxitosamente.',
                    typeError: MessageTypes.SUCCESS
                };

                if (this.props.show) {
                    this.props.onHide();
                }

                if (this.props.data.name === this.state.currentUser.name) {
                    const alterMessage = `${message.error} Deberá iniciar sesión de nuevo.`;
                    message.error = alterMessage;
                    message.logout = true;
                }

                GlobalActions.emitMessage(message);
            }, (error) => {
                this.setState({
                    alert: true,
                    message: error.message,
                    typeError: 'text-danger'
                });
            });
        }

        return null;
    }

    render() {
        let labelError;

        if (this.props.data.name === this.state.currentUser.name) {
            labelError = (
                <label className='text-warning'>{'Al cambiar su contraseña, deberá iniciar sesión de nuevo'}</label>
            );
        }

        if (this.state.message) {
            labelError = (
                <label className={this.state.typeError}>{this.state.message}</label>
            );
        }

        return (
            <Modal
                show={this.props.show}
                onHide={this.props.onHide}
                onExit={() => {
                    this.restart();
                }}
            >
                <div className='color-line'></div>
                <Modal.Header closeButton={true}>
                    <Modal.Title>
                        {'Cambiar Contraseña'}
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <div>
                        <form ref='form-change-passwd'>
                            <div className='row'>
                                <div className='col-xs-4 text-right'>
                                    <label htmlFor='passwdfield'>Contraseña</label>
                                </div>
                                <div className='col-xs-7'>
                                    <input
                                        type='hidden'
                                        ref='passwdfield'
                                        className='form-control'
                                        id='passwdfield'
                                    />
                                    <PasswordStrengthMeter
                                        passwordText=''
                                        className='form-control passwd-field'
                                        hasLabel={false}
                                        hasSuggestion={false}
                                        hasWarning={true}
                                        warning='Su contraseña debe ser mayor a 8 caracteres.'
                                        onChange={this.handlePasswd}
                                        strength={{
                                            0: 'Su contraseña es muy debil',
                                            1: 'Debe incrementar la dificultad de su contraseña',
                                            2: 'Su contraseña es relativamente fuerte',
                                            3: 'Su contraseña es fuerte'
                                        }}
                                    />
                                </div>
                                <div className='col-xs-12 text-center'>
                                    <br/>
                                        {labelError}
                                </div>
                            </div>
                        </form>
                    </div>
                </Modal.Body>
                <Modal.Footer>
                    <button
                        type='button'
                        className='btn btn-default'
                        onClick={this.props.onHide}
                    >
                        {'Cancelar'}
                    </button>
                    <button
                        type='button'
                        className='btn btn-info action-delete'
                        onClick={(e) => {
                            this.handleChangePasswd(e);
                        }}
                        ref='buttonDelete'
                    >
                        {'Cambiar Contraseña'}
                    </button>
                </Modal.Footer>
            </Modal>
        );
    }
}

ConfirmDeleteModal.propTypes = {
    show: React.PropTypes.bool.isRequired,
    onHide: React.PropTypes.func.isRequired,
    data: React.PropTypes.object,
    location: React.PropTypes.object
};
