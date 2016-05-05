// Copyright (c) 2016 ZBox, Spa. All Rights Reserved.
// See LICENSE.txt for license information.

import {browserHistory} from 'react-router';
import {Modal} from 'react-bootstrap';
import UserStore from '../../stores/user_store.jsx';

import React from 'react';

export default class ConfirmDeleteModal extends React.Component {
    constructor(props) {
        super(props);

        this.handleChangePasswd = this.handleChangePasswd.bind(this);
        this.forceLogout = this.forceLogout.bind(this);

        this.state = this.getStateFromStores();
    }

    getStateFromStores() {
        const currentUser = UserStore.getCurrentUser();
        return {currentUser};
    }

    forceLogout(path) {
        setTimeout(() => {
            browserHistory.push(path);
        }, 3000);
    }

    handleChangePasswd() {
        if (this.refs.passwdfield.value && this.refs.passwdfield.value.length > 0) {
            this.props.data.setPassword(this.refs.passwdfield.value, () => {
                this.setState({
                    alert: true,
                    message: 'Su contraseña se ha sido cambiada éxitosamente.',
                    typeError: 'text-success'
                });

                if (this.props.data.name === this.state.currentUser.name) {
                    this.forceLogout('/logout');
                }
            }, (error) => {
                this.setState({
                    alert: true,
                    message: error.message,
                    typeError: 'text-danger'
                });
            });
        }
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
                                        type='password'
                                        ref='passwdfield'
                                        className='form-control'
                                        id='passwdfield'
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
