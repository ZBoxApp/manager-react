// Copyright (c) 2016 ZBox, Spa. All Rights Reserved.
// See LICENSE.txt for license information.

import {browserHistory} from 'react-router';
import {Modal} from 'react-bootstrap';
import * as Utils from './../../utils/utils.jsx';
import * as Client from './../../utils/client.jsx';
import Promise from 'bluebird';
import * as GlobalActions from '../../action_creators/global_actions.jsx';
import MailboxStore from '../../stores/mailbox_store.jsx';

import React from 'react';

export default class ConfirmDeleteModal extends React.Component {
    constructor(props) {
        super(props);

        this.isStoreEnabled = window.manager_config.enableStores;
        this.handleDelete = this.handleDelete.bind(this);
        this.handleKeyUp = this.handleKeyUp.bind(this);
        this.redirect = this.redirect.bind(this);
        this.timetoRedict = 5;

        this.state = {
            timeToRedirect: this.timetoRedict
        };
    }

    componentDidUpdate() {
        if (this.props.show) {
            Utils.toggleStatusButtons('.action-delete', true);
            this.refs.confirmMailbox.value = '';
        }
    }

    handleDelete() {
        new Promise((resolve, reject) => {
            //  start loading
            GlobalActions.emitStartLoading();

            Client.removeAccount(
                this.props.data.id,
                () => {
                    return resolve(true);
                },
                (error) => {
                    return reject(error);
                }
            );
        }).then(() => {
            if (this.isStoreEnabled) {
                MailboxStore.removeAccount(this.props.data);
            }
            this.setState(
                {
                    alert: true,
                    message: `Su cuenta ${this.props.data.attrs.mail}, ha sido eliminada éxitosamente. Sera redirigido en ${this.state.timeToRedirect} seg`,
                    typeError: 'text-warning'
                }
            );
            Utils.toggleStatusButtons('.close-modal', true);
            this.redirect();
        }).catch((error) => {
            this.setState(
                {
                    alert: true,
                    message: error.message,
                    typeError: 'text-edanger'
                }
            );
        }).finally(() => {
            GlobalActions.emitEndLoading();
        });
    }

    redirect() {
        const redirectAt = 1000;
        setTimeout(() => {
            if (this.timetoRedict-- < 1) {
                browserHistory.replace('/mailboxes');
            } else {
                this.setState({
                    message: `Su cuenta ${this.props.data.attrs.mail}, ha sido eliminada éxitosamente. Sera redirigido en ${this.timetoRedict} seg`
                });

                this.redirect();
            }
        }, redirectAt);
    }

    handleKeyUp() {
        let val = this.refs.confirmMailbox.value;
        if (val === this.props.data.attrs.mail) {
            if (this.refs.buttonDelete.hasAttribute('disabled')) {
                Utils.toggleStatusButtons('.action-delete', false);
            }
        } else {
            Utils.toggleStatusButtons('.action-delete', true);
        }
    }

    render() {
        let labelError;
        if (this.state.alert) {
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
                        {'Eliminar Casilla'}
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <div>
                        <form ref='form-delete'>
                            <div className='form-group'>
                                <input
                                    type='text'
                                    ref='confirmMailbox'
                                    className='form-control'
                                    placeholder='Escriba la casilla que desea borrar'
                                    onKeyUp={() => {
                                        this.handleKeyUp();
                                    }}
                                />
                                {labelError}
                            </div>
                        </form>
                    </div>
                </Modal.Body>
                <Modal.Footer>
                    <button
                        type='button'
                        className='btn btn-default close-modal'
                        onClick={this.props.onHide}
                    >
                        {'Cancelar'}
                    </button>
                    <button
                        type='button'
                        className='btn btn-danger action-delete'
                        onClick={(e) => {
                            this.handleDelete(e);
                        }}
                        ref='buttonDelete'
                    >
                        {'Sí, deseo borrarla'}
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
