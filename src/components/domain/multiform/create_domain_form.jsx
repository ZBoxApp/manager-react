import React from 'react';
import {browserHistory} from 'react-router';

import CompanyStore from '../../../stores/company_store.jsx';
import DomainStore from '../../../stores/domain_store.jsx';
import ZimbraStore from '../../../stores/zimbra_store.jsx';

import * as Client from '../../../utils/client.jsx';
import * as Utils from '../../../utils/utils.jsx';
import * as GlobalActions from '../../../action_creators/global_actions.jsx';

import Constants from '../../../utils/constants.jsx';

const MessageType = Constants.MessageType;

export default class CreateDomainForm extends React.Component {
    constructor(props) {
        super(props);

        this.isStoreEnabled = window.manager_config.enableStores;
        this.planSize = this.planSize.bind(this);
        this.getCompanies = this.getCompanies.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);

        this.state = {};
    }

    planSize(e) {
        e.preventDefault();
        let total = 0;
        const plans = Object.keys(this.state.plans);

        plans.forEach((p) => {
            total += parseInt(this.refs[`plan-${p}`].value, 10) || 0;
        });

        this.refs.mailboxLimit.value = total;
    }

    getCompanies() {
        const companyId = this.props.params.id;
        const companies = CompanyStore.getCompanies();

        if (this.isStoreEnabled && companies) {
            this.setState({
                plans: Utils.getEnabledPlansByCos(ZimbraStore.getAllCos()),
                companies,
                companyId
            });
            return GlobalActions.emitEndLoading();
        }
        return Client.getAllCompanies().
        then((data) => {
            this.setState({
                plans: Utils.getEnabledPlansByCos(ZimbraStore.getAllCos()),
                companies: data,
                companyId
            });
        }).
        catch((error) => {
            GlobalActions.emitMessage({
                message: error.message,
                typeError: MessageType.ERROR
            });
        }).
        finally(() => {
            GlobalActions.emitEndLoading();
        });
    }

    handleSubmit(e) {
        e.preventDefault();
        const button = this.refs.createdomainbtn;
        const oldContent = button.innerHTML;

        if (this.props.state.total === this.props.state.step) {
            GlobalActions.emitStartLoading();
        }

        const elementList = document.querySelectorAll('.has-error');
        Array.from(elementList).forEach((el) => el.classList.remove('has-error'));

        Utils.validateInputRequired(this.refs).
        then(() => {
            const plans = Object.keys(this.state.plans);
            const zimbraDomainCOSMaxAccounts = [];
            const name = this.refs.domainName.value.trim();
            const businessCategory = this.refs.company.value.trim();
            const zimbraDomainStatus = this.refs.zimbraDomainStatus.value.trim();
            const isDomain = /^[a-zA-Z0-9][a-zA-Z0-9-]{1,61}[a-zA-Z0-9](?:\.[a-zA-Z]{2,})+$/gi;

            if (!isDomain.test(name)) {
                return GlobalActions.emitMessage({
                    message: 'No se permite caracteres especiales en un dominio, por favor verificar.',
                    typeError: MessageType.ERROR
                });
            }

            plans.forEach((p) => {
                zimbraDomainCOSMaxAccounts.push(`${this.refs[`plan-${p}`].getAttribute('data-id')}:${this.refs[`plan-${p}`].value || 0}`);
            });

            const domain = {
                name,
                attrs: {
                    zimbraDomainCOSMaxAccounts,
                    businessCategory,
                    zimbraDomainStatus
                }
            };

            button.innerHTML = '<i class=\'fa fa-spinner fa-spin\'></i> Creando Dominio';
            Utils.toggleStatusButtons('.action-create-domain', true);

            Client.createDomain(
                domain,
                (data) => {
                    if (this.isStoreEnabled) {
                        CompanyStore.addDomain(businessCategory, data);
                        DomainStore.setCurrent(data);
                    }

                    if (this.props.state.total === this.props.state.step) {
                        browserHistory.push(`/domains/${data.id}`);
                    } else {
                        DomainStore.emitNextStep({
                            step: ++this.props.state.step,
                            domain: data
                        });
                    }

                    button.innerHTML = oldContent;
                    Utils.toggleStatusButtons('.action-create-domain', false);
                },
                (error) => {
                    if (this.props.state.total === this.props.state.step) {
                        GlobalActions.emitEndLoading();
                    }
                    button.innerHTML = oldContent;
                    Utils.toggleStatusButtons('.action-create-domain', false);
                    return GlobalActions.emitMessage({
                        message: error.message,
                        typeError: MessageType.ERROR
                    });
                }
            );
        }).
        catch((error) => {
            if (this.props.state.total === this.props.state.step) {
                GlobalActions.emitEndLoading();
            }
            error.refs = true;
            error.type = error.typeError;
            error.node.closest('.form-group').classList.add('has-error');
            return GlobalActions.emitMessage({
                message: error.message,
                typeError: error.type
            });
        });
    }

    componentDidMount() {
        Client.initPowerDNS();
        this.getCompanies();
    }

    render() {
        const companies = this.state.companies;
        const error = this.state.error;

        if (companies || error) {
            let backUrl = '/domains';
            if (this.state.companyId) {
                backUrl = `/companies/${this.state.companyId}`;
            }

            const companiesOptions = companies.map((c) => {
                return (
                    <option
                        key={`company-${c.id}`}
                        value={c.id}
                    >
                        {c.name}
                    </option>
                );
            });

            const statePlans = this.state.plans;
            const enabledPlans = Object.keys(statePlans);
            const plans = enabledPlans.map((p) => {
                return (
                    <div
                        key={`plan-${statePlans[p]}`}
                        className='col-md-4 form-group required'
                    >
                        <label
                            htmlFor={`plan-${p}`}
                            clasName='label-top control-label'
                        >
                            <abbr title='Requerido'>{'*'}</abbr><br/>
                            {Utils.titleCase(p)}
                        </label>

                        <br/>

                        <div className='row'>
                            <div className='col-sm-8'>
                                <input
                                    type='text'
                                    className='form-control'
                                    defaultValue='0'
                                    data-required='true'
                                    data-message={`Debe asignar la cantidad de casillas del tipo ${Utils.titleCase(p)}`}
                                    data-id={statePlans[p]}
                                    ref={`plan-${p}`}
                                    onKeyUp={this.planSize}
                                />
                            </div>
                        </div>
                    </div>
                );
            });

            const form = (
                <form
                    className='simple_form form-horizontal mailbox-form'
                    onSubmit={this.handleSubmit}
                >
                    <div className='form-group string required'>
                        <label className='string required col-sm-3 control-label'>
                            <abbr title='requerido'>{'*'}</abbr>
                            {'Nombre'}
                        </label>

                        <div className='col-sm-8'>
                            <input
                                type='text'
                                data-required='true'
                                data-message='El nombre del dominio es obligatorio'
                                className='form-control'
                                ref='domainName'
                                placeholder='example.com'
                            />
                        </div>
                    </div>

                    <div className='form-group string'>
                        <label className='string required col-sm-3 control-label'>
                            <abbr title='requerido'>{'*'}</abbr>
                            {'Empresa'}
                        </label>

                        <div className='col-sm-8'>
                            <select
                                className='form-control select required'
                                data-required='true'
                                data-message='Debe especificar a que empresa corresponde el dominio'
                                ref='company'
                                defaultValue={this.state.companyId}
                            >
                                {companiesOptions}
                            </select>
                        </div>
                    </div>

                    <div className='form-group row'>
                        <div className='col-md-8 col-md-offset-3'>
                            <div className='box-content'>
                                {plans}
                            </div>
                        </div>
                    </div>

                    <div className='form-group string'>
                        <label className='string required col-sm-3 control-label'>
                            <abbr title='requerido'>{'*'}</abbr>
                            {'Status'}
                        </label>

                        <div className='col-sm-8'>
                            <select
                                className='form-control select'
                                data-required='true'
                                data-message='Debe especificar el status del dominio'
                                ref='zimbraDomainStatus'
                            >
                                <option value='active'>Activo</option>
                                <option value='closed'>Cerrado</option>
                                <option value='locked'>Bloqueado</option>
                                <option value='maintenance'>En Mantención</option>
                                <option value='suspended'>Suspendido</option>
                            </select>
                        </div>
                    </div>

                    <div className='form-group string'>
                        <label className='string required col-sm-3 control-label'>
                            {'Límite de casillas'}
                        </label>

                        <div className='col-sm-8'>
                            <input
                                type='text'
                                className='form-control'
                                ref='mailboxLimit'
                                value='0'
                                disabled='disabled'
                            />
                        </div>
                    </div>

                    <div className='form-group'>
                        <div className='col-sm-8 col-sm-offset-3'>
                            <button
                                className='btn btn-info action-create-domain'
                                ref='createdomainbtn'
                            >
                                {'Guardar'}
                            </button>

                            <a
                                href='#'
                                className='btn btn-default'
                                onClick={(e) => Utils.handleLink(e, backUrl)}
                            >
                                {'Cancelar'}
                            </a>
                        </div>
                    </div>
                </form>
            );

            return (
                <div>
                    {form}
                </div>
            );
        }

        return <div/>;
    }
}

CreateDomainForm.propTypes = {
    params: React.PropTypes.object.isRequired,
    state: React.PropTypes.object
};
