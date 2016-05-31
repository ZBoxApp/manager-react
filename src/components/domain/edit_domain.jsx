//import Textarea from 'react-textarea-autosize';
import React from 'react';
import {browserHistory} from 'react-router';

import MessageBar from '../message_bar.jsx';
import Panel from '../panel.jsx';

import CompanyStore from '../../stores/company_store.jsx';
import DomainStore from '../../stores/domain_store.jsx';
import UserStore from '../../stores/user_store.jsx';
import ZimbraStore from '../../stores/zimbra_store.jsx';

import * as Client from '../../utils/client.jsx';
import * as Utils from '../../utils/utils.jsx';

import Constants from '../../utils/constants.jsx';

import * as GlobalActions from '../../action_creators/global_actions.jsx';

export default class EditDomain extends React.Component {
    constructor(props) {
        super(props);

        this.isStoreEnabled = window.manager_config.enableStores;
        this.getDomain = this.getDomain.bind(this);
        this.getCompanies = this.getCompanies.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);
        this.planSize = this.planSize.bind(this);
        this.isGlobalAdmin = UserStore.isGlobalAdmin();

        this.state = {
            plans: Utils.getEnabledPlansByCos(ZimbraStore.getAllCos())
        };
    }

    getDomain() {
        const domain = this.isStoreEnabled ? DomainStore.getCurrent() : null;
        const domainId = this.props.params.id;

        if (domain && domain.id === domainId) {
            return this.getCompanies(domain);
        }

        return Client.getDomain(
            domainId,
            (data) => {
                this.getCompanies(data);
            },
            (error) => {
                GlobalActions.emitEndLoading();
                this.setState({error});
            }
        );
    }

    getCompanies(domain) {
        const companies = this.isStoreEnabled ? CompanyStore.getCompanies() : null;

        if (companies) {
            this.setState({
                domain,
                companies
            });
            return GlobalActions.emitEndLoading();
        }

        return Client.getAllCompanies().
        then((data) => {
            this.setState({
                domain,
                companies: data
            });
            GlobalActions.emitEndLoading();
        }).
        catch((error) => {
            error.type = Constants.MessageType.ERROR;
            this.setState({error});
            GlobalActions.emitEndLoading();
        });
    }

    handleSubmit(e) {
        e.preventDefault();
        GlobalActions.emitStartLoading();

        const elementList = document.querySelectorAll('.has-error');
        Array.from(elementList).forEach((el) => el.classList.remove('has-error'));

        Utils.validateInputRequired(this.refs).
        then(() => {
            const stateDomain = this.state.domain;
            const id = stateDomain.id;
            const prevCompanyId = stateDomain.attrs.businessCategory;
            const businessCategory = this.refs.company.value.trim();
            const description = this.refs.description.value.trim();
            const zimbraNotes = this.refs.notes.value.trim();
            const plans = this.state.plans;
            const plansKeys = Object.keys(plans);
            const zimbraDomainCOSMaxAccounts = [];

            plansKeys.forEach((p) => {
                zimbraDomainCOSMaxAccounts.push(`${plans[p]}:${this.refs[`plan-${plans[p]}`].value || 0}`);
            });

            const domain = {
                id,
                attrs: {
                    businessCategory,
                    description,
                    zimbraNotes,
                    zimbraDomainCOSMaxAccounts
                }
            };

            Client.modifyDomain(
                domain,
                (data) => {
                    if (this.isStoreEnabled) {
                        CompanyStore.modifyDomain(prevCompanyId, data);
                        DomainStore.setCurrent(data);
                    }
                    browserHistory.push(`/domains/${data.id}`);
                },
                (error) => {
                    GlobalActions.emitEndLoading();
                    return this.setState({error});
                }
            );
        }).
        catch((error) => {
            GlobalActions.emitEndLoading();
            error.refs = true;
            error.type = error.typeError;
            if (error.node) {
                error.node.closest('.form-group').classList.add('has-error');
            }
            return this.setState({error});
        });
    }

    planSize(e) {
        e.preventDefault();
        let total = 0;
        const objectPlans = this.state.plans;
        const plans = Object.keys(objectPlans);

        plans.forEach((p) => {
            const planId = objectPlans[p];
            total += parseInt(this.refs[`plan-${planId}`].value, 10) || 0;
        });

        this.refs.mailboxLimit.value = total;
    }

    componentDidMount() {
        if (this.isGlobalAdmin) {
            this.getDomain();
        }
    }

    render() {
        const domain = this.state.domain;
        const error = this.state.error;
        const plans = this.state.plans;
        let form = null;

        if (domain || error) {
            const companies = this.state.companies;
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

            let messageBar;
            if (error) {
                messageBar = (
                    <MessageBar
                        message={error.message}
                        type={error.type}
                        autoclose={true}
                    />
                );
            }

            let lastRenovation;

            // DESCOMENTAR ESTO Y CREAR LA FUNCIONALIDAD PARA MANEJAR LA ÚLTIMA FECHA DE RENOVACIÓN
            // <div className='form-group string'>
            //     <label className='string required col-sm-3 control-label'>
            //         {'Última Renovación'}
            //     </label>
            //
            //     <div className='col-sm-8'>
            //         <div className='input-group date datetimepicker'>
            //             <input
            //                 type='text'
            //                 className='form-control'
            //                 ref='lastRenovation'
            //             />
            //                 <span className='input-group-btn'>
            //                     <button
            //                         className='btn btn-default'
            //                         type='button'
            //                     >
            //                         <span className='fa fa-calendar'></span>
            //                     </button>
            //                 </span>
            //         </div>
            //     </div>
            // </div>

            let enabledPlans = Object.keys(plans);
            const maxCosAccounts = Utils.parseMaxCOSAccounts(domain.attrs.zimbraDomainCOSMaxAccounts);
            let total = 0;
            const ownPlans = enabledPlans.map((p) => {
                const planId = maxCosAccounts[plans[p]] || 0;
                total += parseInt(planId, 10) || 0;
                return (
                    <div
                        key={`plan-${p}`}
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
                                    defaultValue={planId}
                                    data-required='true'
                                    data-message={`Debe asignar la cantidad de casillas del tipo ${Utils.titleCase(p)}`}
                                    data-id={p}
                                    ref={`plan-${plans[p]}`}
                                    onKeyUp={(e) => {
                                        this.planSize(e);
                                    }}
                                />
                            </div>
                        </div>
                    </div>
                );
            });

            if (this.isGlobalAdmin) {
                form = (
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
                                    className='form-control'
                                    ref='domainName'
                                    value={domain.name}
                                    disabled='disabled'
                                />
                            </div>
                        </div>

                        {lastRenovation}

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
                                    defaultValue={domain.attrs.businessCategory}
                                >
                                    {companiesOptions}
                                </select>
                            </div>
                        </div>

                        <div className='form-group row'>
                            <div className='col-md-8 col-md-offset-3'>
                                <div className='box-content'>
                                    {ownPlans}
                                </div>
                            </div>
                        </div>

                        <div className='form-group string'>
                            <label className='string col-sm-3 control-label'>
                                {'Descripción'}
                            </label>

                            <div className='col-sm-8'>
                                <input
                                    type='text'
                                    className='form-control'
                                    ref='description'
                                    placeholder='Descripción del dominio'
                                    defaultValue={domain.attrs.description}
                                />
                            </div>
                        </div>

                        <div className='form-group string'>
                            <label className='string col-sm-3 control-label'>
                                {'Notas'}
                            </label>

                            <div className='col-sm-8'>
                            <textarea
                                className='form-control'
                                ref='notes'
                                defaultValue={domain.attrs.zimbraNotes}
                                placeholder='Notas para el dominio'
                                minRows={3}
                                maxRows={9}
                            />
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
                                    value={total}
                                    disabled='disabled'
                                />
                            </div>
                        </div>

                        <div className='form-group'>
                            <div className='col-sm-8 col-sm-offset-3'>
                                <input
                                    type='submit'
                                    name='commit'
                                    value='Guardar'
                                    className='btn btn-info'
                                />
                                <a
                                    href='#'
                                    className='btn btn-default'
                                    onClick={(e) => Utils.handleLink(e, `/domains/${domain.id}`)}
                                >
                                    {'Cancelar'}
                                </a>
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
                        onClick: (e) => Utils.handleLink(e, `/domains/${domain.id}`)
                    }
                }
            ];

            return (
                <div className='content animate-panel'>
                    <div className='row'>
                        <div className='col-md-12 central-content'>
                            <Panel
                                title={'Editar Dominio'}
                                btnsHeader={actions}
                                classHeader={'forum-box'}
                                error={messageBar}
                            >
                                {form}
                            </Panel>
                        </div>
                    </div>
                </div>
            );
        }

        if (!this.isGlobalAdmin) {
            return (
                <div className='text-center'>
                    <h4 className='text-danger'>
                        {'Lo sentimos pero usted no tiene permiso para editar dominios.'}
                    </h4>
                </div>
            );
        }

        return <div/>;
    }
}

EditDomain.propTypes = {
    params: React.PropTypes.object.isRequired
};
