import $ from 'jquery';
import React from 'react';
import PasswordStrengthMeter from 'react-password-strength-meter';
import Panel from '../panel.jsx';
import Button from '../button.jsx';
import MessageBar from '../message_bar.jsx';
import Promise from 'bluebird';

import DataList from 'react-datalist';
import * as GlobalActions from '../../action_creators/global_actions.jsx';
import * as Client from '../../utils/client.jsx';
import * as Utils from '../../utils/utils.jsx';
import EventStore from '../../stores/event_store.jsx';
import MailboxStore from '../../stores/mailbox_store.jsx';
import DomainStore from '../../stores/domain_store.jsx';
import ZimbraStore from '../../stores/zimbra_store.jsx';
import UserStore from '../../stores/user_store.jsx';

import Constants from '../../utils/constants.jsx';

const messageType = Constants.MessageType;

export default class CreateMailBox extends React.Component {
    constructor(props) {
        super(props);

        this.isStoreEnabled = window.manager_config.enableStores;
        this.handleSubmit = this.handleSubmit.bind(this);
        this.getAllDomains = this.getAllDomains.bind(this);
        this.showMessage = this.showMessage.bind(this);
        this.handleRadioChanged = this.handleRadioChanged.bind(this);
        this.controllerDataList = this.controllerDataList.bind(this);
        this.handlePasswd = this.handlePasswd.bind(this);
        this.getEnableAccountsFromDomain = this.getEnableAccountsFromDomain.bind(this);
        this.cos = Utils.getEnabledPlansByCos(ZimbraStore.getAllCos());

        this.reset = null;
        this.cacheDomain = null;

        this.state = {
            zimbraCOSId: ''
        };
    }

    handlePasswd(e) {
        const hidePasswd = this.refs.passwd;

        hidePasswd.value = e.target.value;
    }

    showMessage(attrs) {
        this.setState({
            error: attrs.message,
            typeError: attrs.typeError
        });
    }

    addBlurListeneronInput() {
        const parent = document.getElementById('add-mailbox');

        if (parent) {
            Utils.addEventListenerFixed(parent, 'blur', this.getEnableAccountsFromDomain);
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
                const domains = this.state.domains.domain;
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
                        error: false,
                        zimbraCOSId: ''
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

    handleSubmit(e) {
        e.preventDefault();

        Utils.validateInputRequired(this.refs).then(() => {
            // here assign missing properties.
            const domain = document.querySelector('input[list=\'domain\']');
            const passwd = this.refs.passwd.value;
            const maskPasswd = document.getElementById('password');
            let shouldEnableArchive = false;
            const plans = this.state.plans;
            let plan = null;

            if (domain.value === '') {
                GlobalActions.emitMessage({
                    message: 'El dominio es requerido, verifique por favor.',
                    typeError: messageType.ERROR
                });

                domain.focus();

                return false;
            }

            if (passwd.length < Constants.MaxLengthOfPasswd) {
                GlobalActions.emitMessage({
                    message: 'La contraseña debe ser mayor a 8 caracteres, verifique por favor.',
                    typeError: messageType.ERROR
                });

                maskPasswd.focus();

                return false;
            }

            const email = this.refs.mail.value + '@' + domain.value;

            //falta campo de tipo de casilla
            const attrs = {
                givenName: this.refs.givenName.value,
                sn: this.refs.sn.value,
                displayName: `${this.refs.givenName.value} ${this.refs.sn.value}`,
                description: this.refs.description.value,
                zimbraCOSId: this.state.zimbraCOSId,
                zimbraAccountStatus: this.refs.zimbraAccountStatus.value,
                zimbraIsDelegatedAdminAccount: this.refs.zimbraIsDelegatedAdminAccount.checked.toString().toUpperCase()
            };

            const keysPlans = Object.keys(this.state.plans);

            keysPlans.forEach((p) => {
                if (plans[p] === this.state.zimbraCOSId) {
                    plan = p;
                    shouldEnableArchive = window.manager_config.plans[p].archiving;
                }
            });

            Client.createAccount(
                email,
                passwd,
                attrs,
                (data) => {
                    // reset form when all is ok
                    document.getElementById('createAccount').reset();
                    this.reset.toggleOptions();

                    if (this.isStoreEnabled) {
                        const domainId = this.props.params.domainId || this.cacheDomain.id || null;
                        MailboxStore.setMailbox(data);
                        MailboxStore.setMailboxByDomain(domainId, data);
                    }

                    if (shouldEnableArchive) {
                        data.enableArchiving(plan, (err) => {
                            if (err) {
                                return err;
                            }

                            return Utils.handleLink(event, `/mailboxes/${data.id}`, this.props.location);
                        });
                    } else {
                        return Utils.handleLink(event, `/mailboxes/${data.id}`, this.props.location);
                    }
                },
                (error) => {
                    GlobalActions.emitMessage({
                        message: error.message,
                        typeError: messageType.ERROR
                    });
                }
            );

            return true;
        }).catch((err) => {
            GlobalActions.emitMessage({
                message: err.message,
                typeError: messageType.ERROR
            });

            err.node.focus();
        });
    }

    handleRadioChanged(e, val) {
        const {enabledAccounts} = this.state;
        let needToBuy = false;
        let data = {};

        if (enabledAccounts) {
            const keys = Object.keys(enabledAccounts);
            keys.forEach((pos) => {
                if (enabledAccounts[pos].cosId === val && enabledAccounts[pos].enabled < 1) {
                    needToBuy = true;
                    data = enabledAccounts[pos];
                }
            });
        }

        if (!needToBuy) {
            return this.setState({
                zimbraCOSId: val
            });
        }

        e.target.checked = false;
        const {zimbraCOSId} = this.state;

        if (zimbraCOSId.length > 0) {
            this.setState({
                zimbraCOSId: ''
            });
        }

        if (UserStore.isGlobalAdmin()) {
            const options = {
                title: 'Comprar Casilla',
                text: `Por ahora no tienes más cupo para crear una casilla tipo <strong>${Utils.titleCase(data.plan)}</strong>, ¿Deseas comprar más?`,
                html: true,
                confirmButtonText: 'Si, compraré'
            };

            return Utils.alertToBuy((isConfirmed) => {
                if (isConfirmed) {
                    const {id} = this.cacheDomain;
                    if (id) {
                        return Utils.handleLink(null, `/sales/${id}/mailboxes`);
                    }
                }
            }, options);
        }
    }

    getAllDomains() {
        const max = 200;

        new Promise((resolve, reject) => {
            Client.getAllDomains(
                {
                    limit: max
                },
                (data) => {
                    resolve(data);
                },
                (error) => {
                    reject(error);
                }
            );
        }).then((domains) => {
            const rightsDomains = Utils.getDomainsCleaned(domains.domain);
            domains.domain = rightsDomains;
            domains.total = rightsDomains.length;

            const response = {
                plans: this.cos,
                domains
            };

            if (this.props.params.id) {
                let defaultDomain = null;
                if (DomainStore.getCurrent()) {
                    defaultDomain = DomainStore.getCurrent();
                }

                if (!defaultDomain) {
                    const currentDomainId = this.props.params.id;
                    defaultDomain = response.domains.domain.find((domain) => {
                        if (currentDomainId === domain.id) {
                            return domain;
                        }

                        return null;
                    });
                }

                response.currentDomain = defaultDomain.name;
            }

            this.setState(response);

            if (response.currentDomain) {
                this.getEnableAccountsFromDomain(null, response.currentDomain);
            }
        }, (error) => {
            GlobalActions.emitMessage({
                error: error.message,
                typeError: error.type
            });
        }).finally(() => {
            GlobalActions.emitEndLoading();
            Utils.toggleStatusButtons('.action-save', false);
        });
    }

    componentDidMount() {
        EventStore.addMessageListener(this.showMessage);
        Utils.toggleStatusButtons('.action-save', true);
        $('#sidebar-mailboxes').addClass('active');
        this.getAllDomains();
        this.addBlurListeneronInput();
    }

    componentWillUnmount() {
        EventStore.removeMessageListener(this.showMessage);
        $('#sidebar-mailboxes').removeClass('active');
        this.cacheDomain = null;
        const parent = document.getElementById('add-mailbox');
        parent.removeEventListener('focusout', null);
    }

    controllerDataList(controller) {
        this.reset = controller;
    }

    render() {
        const {zimbraCOSId} = this.state;
        let message;
        let domains = [];
        let form = null;
        let checkboxes = [];
        let counterPlans = 9999;

        if (this.state.error) {
            message = (
                <MessageBar
                    message={this.state.error}
                    type={this.state.typeError}
                    autoclose={true}
                />
            );
        }

        let enableAccounts;
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

        if (this.state.domains) {
            const object = this.state.domains.domain;
            const plans = this.state.plans;
            let limit = object.length;
            for (; limit-- > 0;) {
                domains.push(object[limit].name);
            }

            const options = Object.keys(Constants.status).map((option, i) => {
                if (Constants.status[option].isEnabledOnCreate) {
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

            const keyPlans = Object.keys(plans);

            keyPlans.forEach((plan) => {
                if (plans[plan]) {
                    //let isDisabled = null;
                    let classCss = null;
                    let info = null;
                    let hasPlan = false;
                    if (this.state.enabledAccounts) {
                        this.state.enabledAccounts.forEach((p) => {
                            if (plans[plan] === p.cosId) {
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

                    //const disabledCss = isDisabled ? 'disabled' : '';

                    const item = (
                        <label
                            className={'radio radio-info radio-inline pretty-input'}
                            key={plan}
                        >
                            <div className='pretty-radio'>
                                <input
                                    type='radio'
                                    className='pretty'
                                    name='mailbox'
                                    onChange={(e) => {
                                        this.handleRadioChanged(e, plans[plan]);
                                    }}
                                />
                                <span></span>
                            </div>

                            <span className={`${classCss} status-plan`}>
                                {Utils.titleCase(plan)}
                            </span>
                            {info}
                        </label>
                    );
                    checkboxes.push(item);
                }
            });

            form = (
                <form
                    className='simple_form form-horizontal mailbox-form'
                    onSubmit={(e) => {
                        this.handleSubmit(e);
                    }}
                    id='createAccount'
                    key={'form-create-mailbox'}
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
                                            className='form-control'
                                            ref='mail'
                                            data-required='true'
                                            data-message='El nombre de la casilla es requerida, verifique por favor.'
                                            placeholder='Mail'
                                        />
                                        <span className='input-group-addon'>{'@'}</span>
                                        <DataList
                                            list='domain'
                                            options={domains}
                                            className='form-control'
                                            placeholder='Dominio'
                                            getController={this.controllerDataList}
                                            initialFilter={this.state.currentDomain}
                                        />
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
                                {options}
                            </select>
                        </div>
                    </div>

                    <div className='form-group string'>
                        <label className='string col-sm-3 control-label'>
                            {'Administrador Delegado'}
                        </label>

                        <div className='col-sm-8'>
                            <label
                                className='radio radio-info radio-inline pretty-input'
                            >
                                <div className='pretty-checkbox'>
                                    <input
                                        type='checkbox'
                                        className='pretty'
                                        name='mailbox'
                                        ref='zimbraIsDelegatedAdminAccount'
                                    />
                                    <span></span>
                                </div>
                            </label>
                        </div>
                    </div>

                    <div className='form-group string'>
                        <label className='string required col-sm-3 control-label'>
                            <abbr title='Requerido'>{'*'}</abbr>
                            {'Tipo de casilla'}
                        </label>

                        <div className='col-sm-8'>

                            {checkboxes}

                            <input
                                type='hidden'
                                ref='zimbraCOSId'
                                data-required='true'
                                value={zimbraCOSId}
                                data-message='El plan de su casilla es requerido, por favor verificar.'
                            />
                        </div>
                    </div>

                    <div className='form-group string'>
                        <label className='string required col-sm-3 control-label'>
                            <abbr title='Requerido'>{'*'}</abbr>
                            {'Contraseña'}
                        </label>

                        <div className='col-sm-8'>
                            <input
                                type='hidden'
                                className='form-control'
                                data-required='true'
                                data-message='La contraseña de su casilla es requerida, verifique por favor.'
                                ref='passwd'
                                id='passwdMeter'
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
                    </div>

                    <div className='form-group'>
                        <div className='col-sm-8 col-sm-offset-3'>
                            <input
                                type='submit'
                                name='commit'
                                value='Guardar'
                                className='btn btn-primary action-save'
                            />
                            <Button
                                btnAttrs={
                                    {
                                        className: 'btn btn-default',
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
        }

        const actions = [
            {
                label: 'Cancelar',
                props: {
                    className: 'btn btn-default btn-xs',
                    onClick: (e) => {
                        Utils.handleLink(e, '/mailboxes', this.props.location);
                    }
                }
            }
        ];

        return (
            <div>
                <div className='content animate-panel'>
                    {message}
                    <div className='row'>
                        <div
                            className='col-md-12 central-content'
                            id='add-mailbox'
                        >
                            <Panel
                                title={'Agregar Casilla'}
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

CreateMailBox.propTypes = {
    location: React.PropTypes.object,
    params: React.PropTypes.object
};
