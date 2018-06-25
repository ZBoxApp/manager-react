//import select2 from 'select2';
//import ConfirmDeleteModal from './confirm_delete_modal.jsx';
//import ToggleModalButton from '../toggle_modal_button.jsx';
import $ from 'jquery';
import React from 'react';
import PropTypes from 'prop-types';
import sweetAlert from 'sweetalert';
import Button from '../button.jsx';
import MessageBar from '../message_bar.jsx';
import Panel from '../panel.jsx';
import DataList from 'react-datalist';
import Promise from 'bluebird';
import currencyFormatter from 'currency-formatter';

import * as Client from '../../utils/client.jsx';
import * as GlobalActions from '../../action_creators/global_actions.jsx';
import * as Utils from '../../utils/utils.jsx';

import UserStore from '../../stores/user_store.jsx';
import EventStore from '../../stores/event_store.jsx';
import MailboxStore from '../../stores/mailbox_store.jsx';
import ZimbraStore from '../../stores/zimbra_store.jsx';

import Constants from '../../utils/constants.jsx';

const messageType = Constants.MessageType;

export default class EditMailBox extends React.Component {
    constructor(props) {
        super(props);

        this.isStoreEnabled = window.manager_config.enableStores;
        this.changeStatus = this.changeStatus.bind(this);
        this.handleEdit = this.handleEdit.bind(this);
        this.handleRadioChanged = this.handleRadioChanged.bind(this);
        this.getMailbox = this.getMailbox.bind(this);
        this.fillForm = this.fillForm.bind(this);
        this.showMessage = this.showMessage.bind(this);
        this.handleRenameAccount = this.handleRenameAccount.bind(this);
        this.addBlurListeneronInput = this.addBlurListeneronInput.bind(this);
        this.getEnableAccountsFromDomain = this.getEnableAccountsFromDomain.bind(this);
        this.watcherRemoveAccount = this.watcherRemoveAccount.bind(this);

        this.isRemove = false;

        this.cos = Utils.getEnabledPlansByCos(ZimbraStore.getAllCos());
        this.editUrlFromParams = this.props.params.domain_id ? `/domains/${this.props.params.domain_id}/mailboxes/` : '/mailboxes/';
        this.currency = window.manager_config.invoiceAPI.currency;
        const precision = this.currency === 'CLP' ? 0 : 2;
        this.currencyParams = {code: this.currency, symbol: '', precision};
        this.domainId = null;
        this.currentPlan = '';

        this.state = {
            zimbraCOSId: '',
            zimbraAccountStatus: ''
        };
    }

    showMessage(attrs) {
        this.setState({
            error: attrs.message,
            typeError: attrs.typeError
        });
    }

    changeStatus(e) {
        const select = e.target;
        const zimbraAccountStatus = select.value;

        this.setState({
            zimbraAccountStatus
        });
    }

    handleRadioChanged(e, val) {
        const {enabledAccounts} = this.state;
        let needToUpgrade = false;
        let data = null;
        const currentEvent = Object.assign({}, e);

        if (enabledAccounts) {
            if (val && val.trim().length > 0) {
                enabledAccounts.forEach((plan) => {
                    if (plan.cosId === val && plan.enabled < 1) {
                        needToUpgrade = true;
                        data = plan;
                    }
                });
            }
        }

        if (!needToUpgrade) {
            return this.setState({
                zimbraCOSId: val
            });
        }

        currentEvent.target.checked = false;
        const {zimbraCOSId} = this.state;

        if (zimbraCOSId.length > 0) {
            this.setState({
                zimbraCOSId: ''
            });
        }

        const options = {
            title: 'Plan sin cupo',
            text: `Actualmente el plan <strong>${Utils.titleCase(data.plan)}</strong> no tiene cupo para completar la acción solicitada, por lo cual es necesario que compre más casillas`,
            html: true,
            confirmButtonText: 'Obtener Precio',
            showLoaderOnConfirm: true,
            closeOnConfirm: false
        };

        const domainId = this.domainId || this.props.params.domain_id || null;

        const dataJSON = {
            domainId,
            type: 'standar',
            currency: this.currency,
            cosId: val,
            anualRenovation: true,
            upgrade: true
        };

        const request = {
            domainId: this.domainId,
            adminEmail: UserStore.getCurrentUser().name,
            upgrade: true,
            currency: this.currency
        };

        const account = this.state.data;

        Utils.alertToBuy((isConfirmed) => {
            if (isConfirmed) {
                Client.getPrices(dataJSON, (success) => {
                    const prices = success.result.prices;
                    const price = prices[data.plan] ? currencyFormatter.format(prices[data.plan], this.currencyParams) + ' ' + this.currency : 0;
                    const options = {
                        title: 'Cambio de Plan',
                        text: `Al presionar <strong>Aceptar</strong>, está autorizando la emisión de una factura por un total de <strong>${price}</strong> correspondiente a : <br> <ul class="list-buy-dialog"><li>Asunto: Cambio de Plan</li><li>Casilla: <strong>${account.name}</strong></li><li>Plan Original: <strong>${Utils.titleCase(this.currentPlan)}</strong></li><li>Nuevo Plan: <strong>${Utils.titleCase(data.plan)}</strong></li></ul>`,
                        html: true,
                        confirmButtonText: 'Si, Cambiar Plan',
                        showLoaderOnConfirm: true,
                        closeOnConfirm: false
                    };

                    Utils.alertToBuy((isConfirmed) => {
                        if (isConfirmed) {
                            const item = {};

                            item.basic = {
                                type: 'Producto',
                                quantity: 1,
                                price: prices[data.plan],
                                description: `Cambio de plan de la casilla: ${account.name} de ${this.currentPlan} a ${data.plan}`,
                                id: data.cosId
                            };

                            request.items = item;

                            const requestObject = JSON.stringify(request);

                            Client.makeSale(requestObject, () => {
                                Utils.alertToBuy((isConfirmed) => {
                                    if (isConfirmed) {
                                        const enabledAccounts = this.state.enabledAccounts;

                                        enabledAccounts.forEach((plan) => {
                                            if (plan.cosId === data.cosId) {
                                                plan.enabled++;
                                                plan.total++;
                                                currentEvent.target.checked = true;
                                            }
                                        });

                                        this.setState({
                                            enabledAccounts,
                                            zimbraCOSId: data.cosId
                                        });
                                    }
                                }, {
                                    title: 'Cambio de Plan',
                                    text: 'Su compra se ha realizado con éxito.',
                                    showCancelButton: false,
                                    confirmButtonColor: '#4EA5EC',
                                    confirmButtonText: 'Muy bien',
                                    type: 'success'
                                });
                            }, (error) => {
                                Utils.alertToBuy(() => {
                                    return null;
                                }, {
                                    title: 'Error',
                                    text: error.message || error.error.message || 'Ha ocurrido un error desconocido.',
                                    showCancelButton: false,
                                    confirmButtonColor: '#4EA5EC',
                                    confirmButtonText: 'Entiendo',
                                    type: 'error',
                                    closeOnConfirm: true
                                });
                            });
                        }
                    }, options);
                }, (error) => {
                    return EventStore.emitToast({
                        type: 'error',
                        title: 'Compras - Precios',
                        body: error.message || 'Ha ocurrido un error al intentar obtener los precios, vuelva a intentarlo por favor.',
                        options: {
                            timeOut: 4000,
                            extendedTimeOut: 2000,
                            closeButton: true
                        }
                    });
                });
            }
        }, options);
    }

    watcherRemoveAccount(id, resolve) {
        setTimeout(() => {
            Client.getAccount(id, () => {
                if (!this.isRemove) {
                    this.watcherRemoveAccount(id, resolve);
                }
            }, () => {
                return resolve(true);
            });
        }, 5000);
    }

    removeAccount() {
        const account = this.state.data;
        const response = {
            title: 'Se ha borrado con éxito',
            type: 'success'
        };

        sweetAlert({
                title: 'Borrar Casilla',
                text: `¿Esta seguro que desea borrar la casilla ${account.name}?`,
                type: 'info',
                showCancelButton: true,
                confirmButtonColor: '#DD6B55',
                confirmButtonText: 'Si, deseo borrarlo!',
                closeOnConfirm: false,
                showLoaderOnConfirm: true,
                animation: 'slide-from-top'
            },
            (isDeleted) => {
                if (isDeleted) {
                    new Promise((resolve, reject) => {
                        //  start loading
                        GlobalActions.emitStartLoading();
                        this.isRemove = false;

                        Client.removeAccount(
                            account.id,
                            () => {
                                this.isRemove = true;
                                return resolve(true);
                            },
                            (error) => {
                                this.isRemove = true;
                                return reject(error);
                            }
                        );
                        this.watcherRemoveAccount(account.id, resolve);
                    }).then(() => {
                        if (this.isStoreEnabled) {
                            MailboxStore.removeAccount(account);
                        }
                        response.text = 'Será redireccionado a Casillas.';
                        return sweetAlert(
                            response,
                            () => {
                                Utils.handleLink(event, `${this.editUrlFromParams}`, this.props.location);
                            }
                        );
                    }).catch((error) => {
                        response.title = 'Ha ocurrido un error.';
                        response.text = error.message;
                        response.type = 'error';
                        response.confirmButtonText = 'Intentar de nuevo';
                        response.confirmButtonColor = '#DD6B55';

                        return sweetAlert(response);
                    }).finally(() => {
                        GlobalActions.emitEndLoading();
                    });
                }
            }
        );
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

        return this.handleRenameAccount(mail);
    }

    handleRenameAccount(email) {
        const account = this.isStoreEnabled ? MailboxStore.getCurrent() : this.state.data || null;

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

                let newAccount = this.isStoreEnabled ? MailboxStore.changeAccount(success) : null;

                if (!newAccount) {
                    newAccount = success;
                }

                this.setState({
                    data: newAccount || success
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

        return GlobalActions.emitMessage({
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

    getEnableAccountsFromDomain(e, currentDomain) {
        const target = 'react-datalist-input';
        const hasEvent = e;
        let rightInput = null;
        let value = currentDomain || null;
        if (hasEvent) {
            rightInput = e.target;
            value = rightInput.value.trim();
        }

        const classesList = [];
        if (value.length > 0) {
            if (hasEvent) {
                Array.prototype.push.apply(classesList, rightInput.classList);
            }
            if (classesList.includes(target) || currentDomain) {
                const domains = this.state.domains;
                const thatDomainExists = domains.find((domain) => {
                    const domainName = domain.name;
                    return domainName.includes(value) && domainName.length === value.length;
                });

                if (thatDomainExists && this.cacheDomain && thatDomainExists.name === this.cacheDomain.name) {
                    return null;
                }

                if (thatDomainExists) {
                    this.cacheDomain = thatDomainExists;
                    const maxCosAccounts = Utils.parseMaxCOSAccounts(thatDomainExists.attrs.zimbraDomainCOSMaxAccounts);
                    this.setState({
                        loadingEnableAccounts: true,
                        error: false
                    });

                    return Client.batchCountAccount([thatDomainExists.name],
                        (s) => {
                            const usedAccounts = s.pop();
                            const plansName = Object.keys(usedAccounts);
                            const response = [];
                            const plans = window.manager_config.plans;
                            if (!maxCosAccounts) {
                                this.setState({
                                    loadingEnableAccounts: false,
                                    enabledAccounts: false
                                });

                                return GlobalActions.emitMessage({
                                    message: `El dominio: ${value}, no tiene plan, afíliese a un plan por favor.`,
                                    typeError: messageType.ERROR
                                });
                            }
                            plansName.forEach((plan) => {
                                const item = usedAccounts[plan];
                                if (maxCosAccounts[item.id]) {
                                    const used = parseInt(item.used, 10);
                                    const total = parseInt(maxCosAccounts[item.id], 10);
                                    const enabled = (total - used);
                                    const error = enabled < 0 ? `${enabled}` : null;
                                    const classCss = plans[plan].statusCos;

                                    response.push(
                                        {
                                            plan,
                                            enabled,
                                            error,
                                            total,
                                            used,
                                            classCss,
                                            cosId: item.id
                                        }
                                    );
                                }

                                return false;
                            });

                            return this.setState({
                                loadingEnableAccounts: false,
                                enabledAccounts: response
                            });
                        },
                        (err) => {
                            this.setState({
                                loadingEnableAccounts: false,
                                enabledAccounts: false
                            });

                            return GlobalActions.emitMessage({
                                message: err.message,
                                typeError: messageType.ERROR
                            });
                        });
                }

                this.cacheDomain = null;
                return GlobalActions.emitMessage({
                    message: `El dominio: ${value}, no existe, por favor verifíque.`,
                    typeError: messageType.ERROR
                });
            }
        }
    }

    addBlurListeneronInput() {
        const parent = document.getElementById('edit-mailbox');

        if (parent) {
            Utils.addEventListenerFixed(parent, 'blur', this.getEnableAccountsFromDomain);
        }
    }

    handleEdit(e) {
        e.preventDefault();
        let shouldEnableArchiving = false;
        let shouldDisabledArchiving = false;
        const {cos} = this.state;
        const mailbox = this.state.data;
        let p;
        Utils.toggleStatusButtons('.action-button', true);

        Utils.validateInputRequired(this.refs).then(() => {
            // fill new attrs
            const attrs = {
                givenName: this.refs.givenName.value,
                sn: this.refs.sn.value,
                description: this.refs.description.value,
                zimbraCOSId: this.refs.zimbraCOSId.value,
                zimbraAccountStatus: this.refs.zimbraAccountStatus.value,
                displayName: `${this.refs.givenName.value} ${this.refs.sn.value}`
            };

            const keysPlans = Object.keys(cos);
            const plansConfig = window.manager_config.plans;
            keysPlans.forEach((plan) => {
                if (cos[plan] === attrs.zimbraCOSId && plansConfig[plan].archiving) {
                    shouldEnableArchiving = !shouldEnableArchiving;
                    p = plansConfig[plan].refer || plan;
                }
            });

            if (mailbox.attrs.zimbraCOSId !== attrs.zimbraCOSId && mailbox.archiveEnabled) {
                shouldDisabledArchiving = !shouldDisabledArchiving;
            }

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
                if (this.isStoreEnabled) {
                    MailboxStore.updateMailbox(account.id, account, this.domainId);
                }

                if (shouldDisabledArchiving && !shouldEnableArchiving) {
                    account.disableArchiving((err) => {
                        if (err) {
                            return err;
                        }

                        return Utils.handleLink(null, `/mailboxes/${this.props.params.id}`, this.props.location);
                    });
                }

                if (shouldEnableArchiving && !shouldDisabledArchiving && !mailbox.archiveEnabled) {
                    account.enableArchiving(p, (err) => {
                        if (err) {
                            return err;
                        }

                        return Utils.handleLink(null, `/mailboxes/${this.props.params.id}`, this.props.location);
                    });
                }

                return Utils.handleLink(null, `/mailboxes/${this.props.params.id}`, this.props.location);
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
        const max = 1000;
        Utils.toggleStatusButtons('.action-save', true);
        const hasMailboxes = this.isStoreEnabled ? MailboxStore.hasMailboxes() : null;

        if (hasMailboxes) {
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

            promises.push(domains);

            Promise.all(promises).then((result) => {
                const domains = Utils.getDomainsCleaned(result.shift().domain);
                const currentDomain = Utils.findDomaindIdFromAccount(data, domains);

                this.setState({
                    data,
                    zimbraCOSId: data.attrs.zimbraCOSId,
                    zimbraAccountStatus: data.attrs.zimbraAccountStatus,
                    domains,
                    cos: this.cos
                });

                if (currentDomain) {
                    this.domainId = currentDomain.id;
                    return this.getEnableAccountsFromDomain(null, currentDomain.name);
                }
            }).catch((error) => {
                GlobalActions.emitMessage({
                    message: error.message,
                    typeError: error.type
                });
            }).finally(() => {
                GlobalActions.emitEndLoading();
                Utils.toggleStatusButtons('.action-save', false);
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
                    (data) => {
                        return resolve(data);
                    },
                    (error) => {
                        return reject(error);
                    }
                );
            });

            promises.push(mailbox, doms);

            Promise.all(promises).then((result) => {
                const account = result.shift();
                const domains = Utils.getDomainsCleaned(result.shift().domain);

                const currentDomain = Utils.findDomaindIdFromAccount(account, domains);

                this.setState({
                    data: account,
                    zimbraCOSId: account.attrs.zimbraCOSId,
                    zimbraAccountStatus: account.attrs.zimbraAccountStatus,
                    domains,
                    cos: this.cos
                });

                if (currentDomain) {
                    this.domainId = currentDomain.id;
                    return this.getEnableAccountsFromDomain(null, currentDomain.name);
                }
            }).catch((error) => {
                GlobalActions.emitMessage({
                    message: error.message,
                    typeError: error.type
                });
            }).finally(() => {
                GlobalActions.emitEndLoading();
                Utils.toggleStatusButtons('.action-save', false);
            });
        }
    }

    componentDidMount() {
        $('#sidebar-mailboxes').addClass('active');
        EventStore.addMessageListener(this.showMessage);
        this.getMailbox(this.props.params.id);
        this.addBlurListeneronInput();
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
        this.refs.zimbraAccountStatus.value = attrs.zimbraAccountStatus;
    }

    render() {
        let buttonDelete = null;
        let message;
        let data;
        let actions;
        let form;
        let options;
        const domains = [];
        let currentDomain = '';
        const cosElements = [];
        const {cos} = this.state;
        const {zimbraCOSId, zimbraAccountStatus} = this.state;
        let enableAccounts;
        let counterPlans = 9999;

        let datalist = (
            <input
                type='text'
                className='form-control'
                placeholder='Dominio'
            />
        );

        if (this.state.loadingEnableAccounts) {
            enableAccounts = (
                <div
                    className='text-center'
                    key={'loader-plans'}
                >
                    <i className='fa fa-refresh fa-spin fa-2x'></i>
                    <p>Cargando casillas disponibles</p>
                </div>
            );

            cosElements.push(
                <div
                    key={'loader-checkboxes'}
                >
                    <i className='fa fa-spinner fa-pulse fa-2x fa-fw'></i>
                </div>
            );
        }

        if (this.state.enabledAccounts) {
            const accounts = this.state.enabledAccounts;
            counterPlans = accounts.length;
            accounts.forEach((plan) => {
                if (plan.enabled <= 0) {
                    counterPlans--;
                }
            });
        }

        if (this.state.error) {
            message = (
                <MessageBar
                    message={this.state.error}
                    type={this.state.typeError}
                    autoclose={true}
                />
            );
        }

        if (this.state.data && !this.state.loadingEnableAccounts) {
            data = this.state.data;
            const doms = this.state.domains;
            currentDomain = data.name.split('@').pop();

            buttonDelete = (
                <a
                    className='btn btn-danger btn-xs action-button'
                    onClick={
                        () => {
                            this.removeAccount();
                        }
                    }
                    key='btn-delete-mailbox-key'
                >
                    {'Eliminar Casilla'}
                </a>
            );

            const length = doms.length;
            for (let i = 0; i < length; i++) {
                domains.push(doms[i].name);
            }

            const keyPlans = Object.keys(cos);
            const id = data.attrs.zimbraCOSId;

            keyPlans.forEach((plan) => {
                if (cos[plan]) {
                    let isChecked = false;
                    //let isDisabled = null;
                    let classCss = null;
                    let info = null;
                    let hasPlan = false;
                    if (id) {
                        if (cos[plan] === id) {
                            this.currentPlan = plan;
                            isChecked = 'checked';
                        }
                    }
                    if (this.state.enabledAccounts) {
                        this.state.enabledAccounts.forEach((p) => {
                            if (cos[plan] === p.cosId) {
                                hasPlan = true;
                                //isDisabled = p.enabled < 1 ? true : null;
                                classCss = p.classCss;
                                info = (
                                    <div>
                                        <span>
                                            Usadas: {p.used}
                                        </span>
                                        <span> - </span>
                                        <span className={p.enabled <= 0 ? 'text-danger' : 'text-success'}>
                                            Libres: {p.enabled}
                                        </span>
                                    </div>
                                );
                            }
                        });
                    }

                    if (this.state.enabledAccounts && !hasPlan && null) {
                        //isDisabled = true;
                        info = (
                            <div>
                                <span className='text-danger'>
                                    Este plan no esta contratado
                                </span>
                            </div>
                        );
                    }

                    //let disabledCss = isDisabled ? 'disabled' : '';

                    const item = (
                        <label
                            className='radio radio-info radio-inline pretty-input'
                            key={plan}
                        >
                            <div className='pretty-radio'>
                                <input
                                    type='radio'
                                    className='pretty'
                                    name='mailbox'
                                    onChange={(e) => {
                                        this.handleRadioChanged(e, cos[plan]);
                                    }}
                                    defaultChecked={isChecked}
                                />
                                <span></span>
                            </div>

                            <span className={`${classCss} status-plan`}>
                                {Utils.titleCase(plan)}
                            </span>
                            {info}
                        </label>
                    );
                    cosElements.push(item);
                }
            });

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

            options = Object.keys(Constants.status).map((option, i) => {
                if (Constants.status[option].isEnabledOnEdit) {
                    return (
                        <option
                            value={option}
                            key={`option-plan-${i}`}
                        >
                            {Constants.status[option].label}
                        </option>
                    );
                }

                return null;
            });
        }

        form = (
            <form
                className='simple_form form-horizontal mailbox-form'
                id='editAccount'
                onSubmit={(e) => {
                    this.handleEdit(e);
                }}
                key={'form-edit'}
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
                            value={zimbraAccountStatus}
                            onChange={this.changeStatus}
                        >
                            {options}
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
                            value={zimbraCOSId}
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
                                        Utils.handleLink(e, `${this.editUrlFromParams}${this.props.params.id}`, this.props.location);
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
                        Utils.handleLink(e, `${this.editUrlFromParams}${this.props.params.id}`, this.props.location);
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
                        <div
                            className='col-md-12 central-content'
                            id='edit-mailbox'
                        >
                            <Panel
                                title={'Editar Casilla'}
                                btnsHeader={actions}
                                classHeader={'forum-box'}
                            >
                                {[enableAccounts, form]}
                            </Panel>
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}

EditMailBox.propTypes = {
    location: PropTypes.object,
    params: PropTypes.any
};
