// Copyright (c) 2016 ZBox, Spa. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';

import {Modal} from 'react-bootstrap';
import DateTimeField from 'react-bootstrap-datetimepicker';
import * as Client from '../../utils/client.jsx';
import Promise from 'bluebird';
import * as GlobalActions from '../../action_creators/global_actions.jsx';
import * as Utils from '../../utils/utils.jsx';

export default class MultipleTaskModal extends React.Component {
    constructor(props) {
        super(props);

        this.onSubmit = this.onSubmit.bind(this);
        this.getOwnAccounts = this.getOwnAccounts.bind(this);
        this.handleChangeDate = this.handleChangeDate.bind(this);
        this.allAccounts = [];
        this.loop = 0;
        this.range = 200;
        this.initialDate = Utils.setInitialDate();

        this.dateStart = this.initialDate.formatted;
        this.dateEnd = this.initialDate.formatted;
        this.timestampStart = this.initialDate.timestamp;
        this.timestampEnd = this.initialDate.timestamp;

        this.state = {
            loaded: false
        };
    }

    handleChangeDate(x, from) {
        const ref = this.refs[from];
        const timestamp = Utils.getInitialDateFromTimestamp(x);

        ref.value = timestamp;
    }

    onSubmit() {
        const accounts = this.allAccounts;
        const domain = this.props.data;
        const total = accounts.length;
        const collection = [];
        const refs = this.refs;
        let message = null;
        let error = false;
        const isEnabled = refs.zimbraPrefOutOfOfficeReplyEnabled.checked;

        const start = refs.zimbraPrefOutOfOfficeFromDate.value;
        const end = refs.zimbraPrefOutOfOfficeUntilDate.value;

        if ((start > end) && isEnabled) {
            message = 'La fecha en la que termina su respuesta automática, debe ser mayor que en la que comienza.';
            error = true;
        } else if ((start === end) && isEnabled) {
            message = 'La fecha en la que comienza su respuesta automática no puede ser la misma fecha en la que termina.';
            error = true;
        }

        if (error) {
            this.setState({
                error: true,
                message,
                typeError: 'text-danger'
            });

            return false;
        }

        GlobalActions.emitStartTask({
            origin: 'Dominio - Tareas Masivas',
            id: 'dominio-massive-task',
            action: `Asignando mensaje masivo fuera de oficina a ${total}`
        });

        this.setState({
            error: false
        });

        const attrs = {};

        if (isEnabled) {
            attrs.zimbraPrefOutOfOfficeReplyEnabled = isEnabled.toString().toUpperCase();
            attrs.zimbraPrefOutOfOfficeReply = refs.zimbraPrefOutOfOfficeReply.value;
            attrs.zimbraPrefOutOfOfficeUntilDate = refs.zimbraPrefOutOfOfficeUntilDate.value;
            attrs.zimbraPrefOutOfOfficeFromDate = refs.zimbraPrefOutOfOfficeFromDate.value;
        } else {
            attrs.zimbraPrefOutOfOfficeReplyEnabled = isEnabled.toString().toUpperCase();
        }

        const initial = (this.loop * this.range);
        const limitLoop = ((initial + this.range) > total) ? total : (initial + this.range);

        for (let i = initial; i < limitLoop; i++) {
            const account = accounts[i];
            collection.push(Client.modifyAccountByBatch(account.id, attrs));
        }

        Client.batchRequest(collection, () => {
            if (limitLoop === total) {
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

                this.loop = 0;
                this.allAccounts = [];

                return true;
            }

            setTimeout(() => {
                this.onSubmit();
            }, 200);

            return null;
        }, (error) => {
            console.log(error);
            if (this.props.show) {
                this.props.onHide();
            }
        });
    }

    getOwnAccounts(attrs) {
        const attributes = attrs || {};
        const domain = this.props.data;

        attributes.domain = domain.name;
        attributes.maxResults = window.manager_config.maxResultOnRequestZimbra;

        new Promise((resolve, reject) => {
            Client.getAllAccounts(attributes, (success) => {
                return resolve(success);
            }, (err) => {
                return reject(err);
            });
        }).then((res) => {
            if (res.more) {
                const result = res.account;
                Array.prototype.push.apply(this.allAccounts, result);
                if (res.total > this.allAccounts.length) {
                    this.loop++;
                    attributes.offset = (this.loop * attributes.limit);
                    setTimeout(() => {
                        this.getOwnAccounts(attributes);
                    }, 250);
                }
            }

            if (!res.more) {
                const finalResult = res.account;
                Array.prototype.push.apply(this.allAccounts, finalResult);
                this.loop = 0;
                return this.setState({
                    loaded: true,
                    loading: false
                });
            }

            const total = res.total;
            const loaded = this.allAccounts.length;

            return this.setState({
                loading: true,
                messageLoading: `Cargando ${loaded} de ${total} casillas...`
            });
        }).catch((error) => {
            //return error;
            if (error.code === 'account.TOO_MANY_SEARCH_RESULTS') {
                const newMaxResultOnRequest = window.manager_config.maxResultOnRequestZimbra + window.manager_config.autoincrementOnFailRequestZimbra;
                window.manager_config.maxResultOnRequestZimbra = newMaxResultOnRequest;
                attributes.maxResults = newMaxResultOnRequest;
                attributes.limit = window.manager_config.autoincrementOnFailRequestZimbra;
                attributes.offset = this.loop;
                setTimeout(() => {
                    this.getOwnAccounts(attributes);
                }, 250);
            }
        });
    }

    componentDidMount() {
        this.getOwnAccounts();
    }

    render() {
        let content = null;
        let messageLoading = 'Cargando...';
        let labelError = null;

        if (this.state.loading) {
            const message = this.state.messageLoading;
            messageLoading = message;
        }

        if (this.state.error) {
            labelError = (
                <label className={this.state.typeError}>{this.state.message}</label>
            );
        }

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
                            {'Empieza el'}
                        </label>

                        <div className='col-sm-8'>
                            <DateTimeField
                                inputFormat='DD/MM/YYYY'
                                inputProps={
                                    {
                                        id: 'zimbraPrefOutOfOfficeFromDate',
                                        readOnly: 'readOnly'
                                    }
                                }
                                onChange={(x) => {
                                    this.handleChangeDate(x, 'zimbraPrefOutOfOfficeFromDate');
                                }}
                                defaultText={this.dateStart}
                                mode={'date'}
                            />
                            <input
                                type='hidden'
                                ref='zimbraPrefOutOfOfficeFromDate'
                                value={this.timestampStart}
                            />
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
                                defaultText={this.dateEnd}
                                onChange={(x) => {
                                    this.handleChangeDate(x, 'zimbraPrefOutOfOfficeUntilDate');
                                }}
                                mode={'date'}
                            />
                            <input
                                type='hidden'
                                ref='zimbraPrefOutOfOfficeUntilDate'
                                value={this.timestampEnd}
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
                    <p>{messageLoading}</p>
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
                    <div className='text-center'>
                        <br/>
                        {labelError}
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
