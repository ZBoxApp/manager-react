// Copyright (c) 2016 ZBox, Spa. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';

import {Modal} from 'react-bootstrap';
import DateTimeField from 'react-bootstrap-datetimepicker';
import * as Client from '../../utils/client.jsx';
import Promise from 'bluebird';
import * as GlobalActions from '../../action_creators/global_actions.jsx';

export default class MultipleTaskModal extends React.Component {
    constructor(props) {
        super(props);

        this.onSubmit = this.onSubmit.bind(this);
        this.getOwnAccounts = this.getOwnAccounts.bind(this);
        this.handleChangeDate = this.handleChangeDate.bind(this);

        this.state = {
            loaded: false
        };
    }

    handleChangeDate() {
        const timeLapse = 100;
        setTimeout(() => {
            const formated = document.getElementById('zimbraPrefOutOfOfficeUntilDate').value.split('/').reverse().join('') + '000000Z';
            this.refs.zimbraPrefOutOfOfficeUntilDate.value = formated;
        }, timeLapse);
    }

    onSubmit() {
        const accounts = this.state.accounts.account;
        const domain = this.props.data;
        const total = accounts.length;
        const collection = [];

        GlobalActions.emitStartTask({
            origin: 'Dominio - Tareas Masivas',
            id: 'dominio-massive-task',
            action: `Asignando mensaje masivo fuera de oficina a ${total}`
        });

        const attrs = {};
        const isEnabled = this.refs.zimbraPrefOutOfOfficeReplyEnabled.checked;

        if (isEnabled) {
            attrs.zimbraPrefOutOfOfficeReplyEnabled = isEnabled.toString().toUpperCase();
            attrs.zimbraPrefOutOfOfficeReply = this.refs.zimbraPrefOutOfOfficeReply.value;
            attrs.zimbraPrefOutOfOfficeUntilDate = this.refs.zimbraPrefOutOfOfficeUntilDate.value;
        } else {
            attrs.zimbraPrefOutOfOfficeReplyEnabled = isEnabled.toString().toUpperCase();
        }

        accounts.forEach((account) => {
            collection.push(Client.modifyAccountByBatch(account.id, attrs));
        });

        Client.batchRequest(collection, () => {
            GlobalActions.emitEndTask({
                id: 'dominio-massive-task',
                toast: {
                    message: `Se han agregado el mensaje fuera de oficina con exito a las ${total} casillas del dominio: ${domain.name}`,
                    title: 'Dominio - Mensaje Masivo'
                }
            });

            if (this.props.show) {
                this.props.onHide();
            }
        }, (err) => {
            console.log('err',err);
            if (this.props.show) {
                this.props.onHide();
            }
        });
    }

    getOwnAccounts() {
        const domain = this.props.data;
        new Promise((resolve, reject) => {
            Client.getAllAccounts({
                domain: domain.name
            }, (success) => {
                return resolve(success);
            }, (err) => {
                return reject(err);
            });
        }).then((res) => {
            this.setState({
                loaded: true,
                accounts: res
            });
        }).catch((error) => {
            console.log('err', error);
        }).finally(() => {
        });
    }

    componentDidMount() {
        this.getOwnAccounts();
    }

    render() {
        let content = null;

        if (this.state.loaded) {
            content = (
                <form
                    className='simple_form form-horizontal mailbox-form'
                    id='createAccount'
                >
                    <div className='form-group string'>
                        <label className='string required col-sm-3 control-label'>
                            {'Habilitado'}
                        </label>

                        <div className='col-sm-8'>
                            <label className='radio-inline pretty-input'>
                                <div className='pretty-checkbox'>
                                    <input
                                        type='checkbox'
                                        className='pretty'
                                        ref='zimbraPrefOutOfOfficeReplyEnabled'
                                    />
                                    <span></span>
                                </div>
                            </label>
                        </div>
                    </div>

                    <div className='form-group string'>
                        <label className='string required col-sm-3 control-label'>
                            {'Termina el'}
                        </label>

                        <div className='col-sm-8'>
                            <DateTimeField
                                inputFormat='DD/MM/YYYY'
                                inputProps={
                                    {
                                        id: 'zimbraPrefOutOfOfficeUntilDate',
                                        readOnly: 'readOnly'
                                    }
                                }
                                onChange={this.handleChangeDate}
                                mode={'date'}
                            />
                            <input
                                type='hidden'
                                ref='zimbraPrefOutOfOfficeUntilDate'
                            />
                        </div>
                    </div>

                    <div className='form-group string'>
                        <label className='string required col-sm-3 control-label'>
                            {'Respuesta'}
                        </label>

                        <div className='col-sm-8'>
                                    <textarea
                                        name='response'
                                        id='responseBox'
                                        className='form-control'
                                        rows='4'
                                        ref='zimbraPrefOutOfOfficeReply'
                                    >
                                    </textarea>
                        </div>
                    </div>
                </form>
            );
        } else {
            content = (
                <div className='text-center'>
                    <i className='fa fa-spinner fa-spin fa-3x fa-fw'></i>
                    <p>Cargando...</p>
                </div>
            );
        }

        return (
            <Modal
                show={this.props.show}
                onHide={this.props.onHide}
                bsSize={'lg'}
            >
                <div className='color-line'></div>
                <Modal.Header closeButton={true}>
                    <Modal.Title>
                        {'Tareas Masivas'}
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <div>
                        {content}
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
                        className='btn btn-info action-massive'
                        type='button'
                        onClick={this.onSubmit}
                    >
                        {'Guardar'}
                    </button>
                </Modal.Footer>
            </Modal>
        );
    }
}

MultipleTaskModal.propTypes = {
    show: React.PropTypes.bool.isRequired,
    onHide: React.PropTypes.func.isRequired,
    data: React.PropTypes.object
};
