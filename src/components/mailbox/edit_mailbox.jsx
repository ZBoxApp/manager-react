//import select2 from 'select2';
import $ from 'jquery';
import React from 'react';
import Button from '../button.jsx';
import MessageBar from '../message_bar.jsx';
import Panel from '../panel.jsx';
import ConfirmDeleteModal from './confirm_delete_modal.jsx';
import ToggleModalButton from '../toggle_modal_button.jsx';
import DataList from 'react-datalist';
import UserStore from '../../stores/user_store.jsx';
import Promise from 'bluebird';
import MailboxStore from '../../stores/mailbox_store.jsx';

import * as Client from '../../utils/client.jsx';
import * as GlobalActions from '../../action_creators/global_actions.jsx';
import * as Utils from '../../utils/utils.jsx';
import EventStore from '../../stores/event_store.jsx';

import Constants from '../../utils/constants.jsx';

const messageType = Constants.MessageType;

export default class EditMailBox extends React.Component {
    constructor(props) {
        super(props);

        this.handleEdit = this.handleEdit.bind(this);
        this.handleRadioChanged = this.handleRadioChanged.bind(this);
        this.getMailbox = this.getMailbox.bind(this);
        this.fillForm = this.fillForm.bind(this);
        this.showMessage = this.showMessage.bind(this);
        this.handleRenameAccount = this.handleRenameAccount.bind(this);

        this.state = {};
    }

    showMessage(attrs) {
        this.setState({
            error: attrs.message,
            typeError: attrs.typeError
        });
    }

    handleRadioChanged(val) {
        this.refs.zimbraCOSId.value = val;
    }

    handleEnabledRename() {
        const selfButton = this.refs.rename;
        const inputs = document.querySelectorAll('.action-rename');
        const email = inputs[0];
        const domain = inputs[1];

        if (selfButton.hasAttribute('data-rename')) {
            selfButton.removeAttribute('data-rename');
            selfButton.innerHTML = 'Actualizar';
            Utils.toggleStatusButtons('.action-rename', false);
            return false;
        }

        if (domain.value === '') {
            GlobalActions.emitMessage({
                message: 'El dominio es requerido, verifique por favor.',
                typeError: messageType.ERROR
            });

            domain.focus();

            return false;
        }

        if (email.value === '') {
            GlobalActions.emitMessage({
                message: 'El campo mail es requerido, verifique por favor.',
                typeError: messageType.ERROR
            });

            email.focus();

            return false;
        }

        const mail = email.value + '@' + domain.value;
        const isEmail = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

        if (!isEmail.test(mail)) {
            GlobalActions.emitMessage({
                message: 'El email no tiene el formato correcto, verifique por favor.',
                typeError: messageType.ERROR
            });

            return false;
        }

        this.handleRenameAccount(mail);
    }

    handleRenameAccount(email) {
        const account = MailboxStore.getCurrent();

        if (account) {
            const oldName = this.refs.rename.innerHTML;
            this.refs.rename.innerHTML = 'Actualizando';
            Utils.toggleStatusButtons('.change-email', true);

            return account.rename(email, (error, success) => {
                if (error) {
                    this.setState({
                        data: account
                    });

                    this.refs.rename.innerHTML = oldName;
                    Utils.toggleStatusButtons('.change-email', false);

                    return GlobalActions.emitMessage({
                        message: error.extra.reason,
                        typeError: messageType.ERROR
                    });
                }

                let newAccount = MailboxStore.changeAccount(success);

                if (!newAccount) {
                    newAccount = success;
                }

                this.setState({
                    data: newAccount
                });

                this.refs.rename.innerHTML = 'Renombrar';
                this.refs.rename.setAttribute('data-rename', 'true');
                Utils.toggleStatusButtons('.change-email', false);

                return GlobalActions.emitMessage({
                    message: 'Se ha modificado el nombre de su cuenta éxitosamente',
                    typeError: messageType.SUCCESS
                });
            });
        }

        GlobalActions.emitMessage({
            message: 'Error, no existe instancia de la casilla.',
            typeError: messageType.ERROR
        });
    }

    componentDidUpdate() {
        const button = this.refs.rename;

        if (button.hasAttribute('data-rename')) {
            Utils.toggleStatusButtons('.action-rename', true);
        }
    }

    handleEdit(e) {
        e.preventDefault();
        Utils.toggleStatusButtons('.action-button', true);

        Utils.validateInputRequired(this.refs).then(() => {
            // fill new attrs
            const attrs = {
                givenName: this.refs.givenName.value,
                sn: this.refs.sn.value,
                description: this.refs.description.value,
                zimbraCOSId: this.refs.zimbraCOSId.value,
                zimbraAccountStatus: this.refs.zimbraAccountStatus.value
            };

            GlobalActions.emitStartLoading();

            return new Promise((resolve, reject) => {
                Client.modifyAccount(
                    this.props.params.id,
                    attrs,
                    (account) => {
                        return resolve(account);
                    },
                    (error) => {
                        return reject(error);
                    }
                );
            }).then((account) => {
                MailboxStore.changeAccount(account);

                Utils.handleLink(e, `/mailboxes/${this.props.params.id}`, this.props.location);
            }).catch((error) => {
                GlobalActions.emitMessage({
                    message: error.message,
                    typeError: messageType.ERROR
                });
            }).finally(() => {
                GlobalActions.emitEndLoading();
                Utils.toggleStatusButtons('.action-button', false);
            });
        }).catch((err) => {
            GlobalActions.emitMessage({
                message: err.message,
                typeError: messageType.ERROR
            });

            err.node.focus();
            Utils.toggleStatusButtons('.action-button', false);
        });
    }

    getMailbox(id) {
        const promises = [];
        let data = null;
        const max = 200;
        Utils.toggleStatusButtons('.action-save', true);

        if (MailboxStore.hasMailboxes()) {
            data = MailboxStore.getMailboxById(id);

            const domains = new Promise((resolve, reject) => {
                Client.getAllDomains(
                    {
                        limit: max
                    },
                    (dataDomains) => {
                        return resolve(dataDomains);
                    },
                    (error) => {
                        return reject(error);
                    }
                );
            });

            const cos = new Promise((resolve, reject) => {
                Client.getAllCos((success) => {
                    resolve(success);
                }, (error) => {
                    reject(error);
                });
            });

            promises.push(domains, cos);

            Promise.all(promises).then((result) => {
                MailboxStore.setCurrent(data);
                this.setState({
                    data,
                    domains: result.shift().domain,
                    cos: Utils.getEnabledPlansByCos(result.shift())
                });
                Utils.toggleStatusButtons('.action-save', false);
            }).catch((error) => {
                GlobalActions.emitMessage({
                    message: error.message,
                    typeError: error.type
                });
            }).finally(() => {
                GlobalActions.emitEndLoading();
            });
        } else {
            const mailbox = new Promise((resolve, reject) => {
                Client.getAccount(
                    id,
                    (resultMailbox) => {
                        return resolve(resultMailbox);
                    },
                    (error) => {
                        return reject(error);
                    }
                );
            });

            const doms = new Promise((resolve, reject) => {
                Client.getAllDomains(
                    {
                        limit: max
                    },
                    (domain) => {
                        return resolve(domain);
                    },
                    (error) => {
                        return reject(error);
                    }
                );
            });

            const cos = new Promise((resolve, reject) => {
                Client.getAllCos((success) => {
                    resolve(success);
                }, (error) => {
                    reject(error);
                });
            });

            promises.push(mailbox, doms, cos);

            Promise.all(promises).then((result) => {
                const account = result.shift();

                this.setState({
                    data: account,
                    domains: result.shift().domain,
                    cos: Utils.getEnabledPlansByCos(result.shift())
                });

                Utils.toggleStatusButtons('.action-save', false);
                MailboxStore.setCurrent(account);
            }).catch((error) => {
                GlobalActions.emitMessage({
                    message: error.message,
                    typeError: error.type
                });
            }).finally(() => {
                GlobalActions.emitEndLoading();
            });
        }
    }

    componentDidMount() {
        /*Client.renameAccount('nuevomodificado@zboxapp.dev', (exito) => {
            console.log('exito', exito);
        }, (fallo) => {
            console.log('fallo', fallo);
        });*/
        $('#sidebar-mailboxes').addClass('active');
        EventStore.addMessageListener(this.showMessage);
        this.getMailbox(this.props.params.id);
    }

    componentWillUnmount() {
        EventStore.removeMessageListener(this.showMessage);
        $('#sidebar-mailboxes').removeClass('active');
    }

    fillForm(data) {
        const attrs = data.attrs;
        this.refs.mail.value = data.name.split('@').shift();
        this.refs.givenName.value = attrs.givenName || '';
        this.refs.sn.value = attrs.sn;
        this.refs.description.value = attrs.description || '';
        this.refs.zimbraCOSId.value = attrs.zimbraCOSId || '';
        this.refs.zimbraAccountStatus.value = attrs.zimbraAccountStatus;
    }

    render() {
        let message;
        let data;
        let actions;
        let form;
        const domains = [];
        let buttonDelete = null;
        let currentDomain = '';
        const cosElements = [];
        let datalist = (
            <input
                type='text'
                className='form-control'
                placeholder='Dominio'
            />
        );

        if (this.state.error) {
            message = (
                <MessageBar
                    message={this.state.error}
                    type={this.state.typeError}
                    autoclose={true}
                />
            );
        }

        if (this.state.data) {
            data = this.state.data;
            const doms = this.state.domains;
            const cos = this.state.cos;
            currentDomain = data.name.split('@').pop();

            buttonDelete = (
                <ToggleModalButton
                    role='button'
                    className='btn btn-xs btn-danger action-button'
                    dialogType={ConfirmDeleteModal}
                    dialogProps={{data}}
                    key='delete-mailbox'
                >
                    {'Eliminar'}
                </ToggleModalButton>
            );

            const length = doms.length;
            for (let i = 0; i < length; i++) {
                domains.push(doms[i].name);
            }

            for (let cosName in cos) {
                if (cos.hasOwnProperty(cosName)) {
                    let isChecked = false;
                    const id = data.attrs.zimbraCOSId;

                    if (id) {
                        if (cos[cosName] === id) {
                            isChecked = 'checked';
                        }
                    }

                    const checkbox = (
                        <label
                            key={cos[cosName]}
                            className='radio radio-info radio-inline pretty-input'
                        >
                            <div className='pretty-radio'>
                                <input
                                    type='radio'
                                    className='pretty'
                                    name='mailbox'
                                    defaultChecked={isChecked}
                                    onChange={() => {
                                        this.handleRadioChanged(cos[cosName]);
                                    }}
                                />
                                <span></span>
                            </div>
                            {cosName}
                        </label>
                    );
                    cosElements.push(checkbox);
                }
            }

            if (UserStore.getCurrentUser().name === data.name) {
                buttonDelete = null;
            }

            this.fillForm(data);
            datalist = (
                <DataList
                    list='domain'
                    options={domains}
                    className='form-control action-rename'
                    placeholder='Dominio'
                    initialFilter={currentDomain}
                />
            );
        }

        form = (
            <form
                className='simple_form form-horizontal mailbox-form'
                id='editAccount'
                onSubmit={(e) => {
                    this.handleEdit(e);
                }}
            >
                <div className='form-group string required'>
                    <label className='string required col-sm-3 control-label'>
                        <abbr title='requerido'>{'*'}</abbr>
                        {'Dirección'}
                    </label>

                    <div className='col-sm-8'>
                        <div className='row'>
                            <div className='col-xs-12'>
                                <div className='input-group'>
                                    <input
                                        type='text'
                                        className='form-control action-rename'
                                        ref='mail'
                                        placeholder='Mail'
                                    />
                                    <span className='input-group-addon'>{'@'}</span>
                                    {datalist}
                                    <span className='input-group-btn'>
                                        <button
                                            className='btn btn-default change-email'
                                            type='button'
                                            ref='rename'
                                            data-rename='true'
                                            onClick={() => {
                                                this.handleEnabledRename();
                                            }}
                                        >
                                            Renombrar
                                        </button>
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className='form-group string'>
                    <label className='string required col-sm-3 control-label'>
                        {'Nombre'}
                    </label>

                    <div className='col-sm-8'>
                        <input
                            type='text'
                            className='form-control'
                            ref='givenName'
                        />
                    </div>
                </div>

                <div className='form-group string'>
                    <label className='string required col-sm-3 control-label'>
                        {'Apellido'}
                    </label>

                    <div className='col-sm-8'>
                        <input
                            type='text'
                            className='form-control'
                            ref='sn'
                        />
                    </div>
                </div>

                <div className='form-group string'>
                    <label className='string required col-sm-3 control-label'>
                        {'Descripción'}
                    </label>

                    <div className='col-sm-8'>
                        <input
                            type='text'
                            className='form-control'
                            ref='description'
                        />
                    </div>
                </div>

                <div className='form-group string'>
                    <label className='string col-sm-3 control-label'>
                        {'Status'}
                    </label>

                    <div className='col-sm-8'>
                        <select
                            className='form-control'
                            ref='zimbraAccountStatus'
                        >
                            <option value='active'>Activa</option>
                            <option value='closed'>Cerrada</option>
                            <option value='locked'>Bloqueada</option>
                        </select>
                    </div>
                </div>

                <div className='form-group string'>
                    <label className='string required col-sm-3 control-label'>
                        <abbr title='Requerido'>{'*'}</abbr>
                        {'Tipo de casilla'}
                    </label>

                    <div className='col-sm-8'>
                        {cosElements}

                        <input
                            type='hidden'
                            ref='zimbraCOSId'
                            data-required='true'
                            data-message='El plan de su cuenta es requerido, por favor verificar.'
                        />
                    </div>
                </div>

                <div className='form-group'>
                    <div className='col-sm-8 col-sm-offset-3'>
                        <input
                            type='submit'
                            name='commit'
                            value='Guardar'
                            className='btn btn-primary action-button'
                            id='modifyButton'
                        />
                        <Button
                            btnAttrs={
                                {
                                    className: 'btn btn-default action-button',
                                    onClick: (e) => {
                                        Utils.handleLink(e, '/mailboxes', this.props.location);
                                    }
                                }
                            }
                        >
                            {'Cancelar'}
                        </Button>
                    </div>
                </div>
            </form>
        );

        actions = [
            {
                label: 'Cancelar',
                props: {
                    className: 'btn btn-default btn-xs action-button',
                    onClick: (e) => {
                        Utils.handleLink(e, `/mailboxes/${this.props.params.id}`, this.props.location);
                    }
                }
            },
            {
                setComponent: buttonDelete
            }
        ];

        return (
            <div>
                <div className='content animate-panel'>
                    {message}
                    <div className='row'>
                        <div className='col-md-12 central-content'>
                            <Panel
                                title={'Editar Casilla'}
                                btnsHeader={actions}
                                classHeader={'forum-box'}
                            >
                                {form}
                            </Panel>
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}

EditMailBox.propTypes = {
    location: React.PropTypes.object,
    params: React.PropTypes.any
};
