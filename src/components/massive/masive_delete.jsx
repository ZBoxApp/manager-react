import React from 'react';

import * as Client from '../../utils/client.jsx';
import * as GlobalActions from '../../action_creators/global_actions.jsx';
import * as Utils from '../../utils/utils.jsx';

import ErrorStore from '../../stores/error_store.jsx';

import PageInfo from '../page_info.jsx';
import Panel from '../panel.jsx';

export default class MassiveDelete extends React.Component {
    constructor(props) {
        super(props);

        this.handleDelete = this.handleDelete.bind(this);
        this.handleCommands = this.handleCommands.bind(this);
        this.removeMassiveAccounts = this.removeMassiveAccounts.bind(this);

        this.isExecuting = false;
    }

    getDetails(e, errors) {
        ErrorStore.saveErrors(errors);
        Utils.handleLink(e, '/errorsFromAction');
    }

    handleCommands(e) {
        if (!e) {
            return null;
        }

        const enter = 13;
        const keyCode = e.keyCode || e.which;
        const isCtrlPressed = e.ctrlKey;
        if (keyCode === enter && isCtrlPressed) {
            e.preventDefault();
            this.handleDelete();
        }
    }

    componentDidMount() {
        this.handleCommands();
    }

    handleDelete(e) {
        if (e) {
            e.preventDefault();
        }

        const consoleText = this.refs.console.value.trim();

        if (consoleText === '' && consoleText.length < 1 || this.isExecuting) {
            return null;
        }

        const preMailboxes = consoleText.split(/\r?\n/gi);
        const getAccountByBatch = [];
        const deleteAccountByBatch = [];
        const wrongEmails = [];
        const emailsNotFound = [];

        preMailboxes.forEach((email) => {
            const pattern = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
            const cleanEmail = email.trim();
            const condition = pattern.test(cleanEmail) && cleanEmail !== '';

            if (condition) {
                getAccountByBatch.push(Client.getAccountByBatch(cleanEmail));
                return condition;
            }

            if (cleanEmail !== '') {
                wrongEmails.push(cleanEmail);
            }

            return condition;
        });

        GlobalActions.emitStartTask({
            origin: 'Borrado Masivo',
            action: 'Borrando Casillas.',
            id: 'deleteMassive'
        });

        this.isExecuting = true;
        Client.batchRequest(getAccountByBatch, (found) => {
            if (found.Fault) {
                found.Fault.forEach((object) => {
                    const parts = object.Reason.Text.split(':');
                    const message = parts.length > 1 ? parts.pop() : object.Reason.Text;
                    emailsNotFound.push({
                        item: message.trim(),
                        error: 'Este email no existe.'
                    });
                });

                if (!found.GetAccountResponse) {
                    return GlobalActions.emitEndTask({
                        id: 'deleteMassive',
                        toast: {
                            message: 'Las casillas indicadas, no existen, verifique por favor',
                            title: 'Borrado Masivo',
                            type: 'error'
                        }
                    });
                }
            }

            if (found.GetAccountResponse) {
                found.GetAccountResponse.forEach((object) => {
                    const id = object.account[0].id;
                    deleteAccountByBatch.push(Client.removeAccountByBatch(id));
                });
            }

            if (deleteAccountByBatch.length > 0) {
                const response = {
                    title: 'Borrado Masivo',
                    message: 'Ha ocurrido los siguientes errores, cuando se intentaba borrar casillas masivamente.',
                    data: {
                        onValid: emailsNotFound
                    }
                };

                this.removeMassiveAccounts(deleteAccountByBatch, response);
            }
        }, (err) => {
            this.isExecuting = false;
            return GlobalActions.emitEndTask({
                id: 'deleteMassive',
                toast: {
                    message: err.message || 'Ocurrió un error desconocido.',
                    title: 'Borrado Masivo',
                    type: 'error'
                }
            });
        });
    }

    removeMassiveAccounts(accountsId, response) {
        const accountsInstances = accountsId || null;
        const resp = response || null;

        let control;

        if (!accountsInstances) {
            return;
        }

        if (accountsInstances.length > 0) {
            Client.batchRequest(accountsInstances, (done) => {
                this.isExecuting = false;
                if (done.Fault) {
                    done.Fault.forEach((object) => {
                        const parts = object.Reason.Text.split(':');
                        const message = parts.length > 1 ? parts.pop() : object.Reason.Text;
                        if (resp.data.onRemove) {
                            resp.data.onRemove = [...resp.data.onRemove, {
                                item: message.trim(),
                                error: object.Reason.Text
                            }];
                        } else {
                            resp.data.onRemove = [{
                                item: message.trim(),
                                error: object.Reason.Text
                            }];
                        }
                    });

                    if (!done.DeleteAccountResponse) {
                        control = (
                            <div>
                                <p>
                                    {'Ha ocurrido un error, para mas detalles haga '}
                                    <a
                                        onClick={(e) => {
                                            this.getDetails(e, resp);
                                        }}
                                        className='link-error'
                                    >
                                        Click Aqui
                                    </a>
                                </p>
                            </div>
                        );
                        return GlobalActions.emitEndTask({
                            id: 'deleteMassive',
                            toast: {
                                message: control,
                                title: 'Borrado Masivo',
                                type: 'error'
                            }
                        });
                    }
                }

                const total = done.DeleteAccountResponse.length;
                const totalDeleted = total > 1 ? `${total} casillas` : `${total} casilla`;

                if (this.refs && this.refs.console) {
                    this.refs.console.value = '';
                }

                const hasDetails = resp.data.onValid.length > 0 || (resp.data.onRemove && resp.data.onRemove.length > 0) ? true : null;
                control = (
                    <div>
                        <p>
                            {`Se han borrado ${totalDeleted}, éxitosamente, pero hubo algunos errores en otras, para mas detalle haga `}
                            <a
                                onClick={(e) => {
                                    this.getDetails(e, resp);
                                }}
                                className='link-error'
                            >
                                click aqui
                            </a>
                        </p>
                    </div>
                );

                if (!hasDetails) {
                    control = `Se han borrado ${totalDeleted}, éxitosamente.`;
                }

                return GlobalActions.emitEndTask({
                    id: 'deleteMassive',
                    toast: {
                        message: control,
                        title: 'Borrado Masivo',
                        type: 'success'
                    }
                });
            }, (err) => {
                this.isExecuting = false;
                return GlobalActions.emitEndTask({
                    id: 'deleteMassive',
                    toast: {
                        message: err.message || 'Ocurrió un error desconocido, al intentar de borrar las casillas.',
                        title: 'Borrado Masivo',
                        type: 'error'
                    }
                });
            });
        }
    }

    render() {
        const consoleText = (
            <div
                className='row'
                key='deleteConsole'
            >
                <div className='col-xs-12'>
                    <blockquote className='custom-blockquote'>
                        <p>
                            <i>
                                {'Escribir el nombre de las casillas a la cual se quiere eliminar, cada casilla debe ser separada por un salto de linea (Tecla Enter).'}
                            </i>
                        </p>
                    </blockquote>
                </div>
                <div className='col-xs-12 wrapper-console'>
                    <textarea
                        className='form-control consoleText'
                        ref='console'
                        onKeyDown={this.handleCommands}
                    >
                    </textarea>

                    <span className='tooltip-console'>
                        <code>
                            {'CTRL + ENTER'}
                        </code>
                        {'PARA EJECUTAR'}
                    </span>
                </div>
            </div>
        );

        const buttons = (
            <div
                key={'btn-actions'}
                className='row'
            >
                <div className='col-xs-12 text-right'>
                    <button
                        className='btn btn-danger'
                        onClick={this.handleDelete}
                    >
                        {'Borrar Casillas'}
                    </button>
                </div>
            </div>
        );

        return (
            <div>
                <PageInfo
                    titlePage='Borrado Masivo de Casillas'
                    descriptionPage='Herramienta para borrar masivamente'
                />
                <div className='content animate-panel'>
                    <div className='row'>
                        <div className='col-md-12 central-content'>
                            <Panel
                                children={[consoleText, buttons]}
                                hasHeader={false}
                            />
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}
