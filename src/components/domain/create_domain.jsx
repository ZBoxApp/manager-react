import React from 'react';
import {browserHistory} from 'react-router';

import MessageBar from '../message_bar.jsx';
import Panel from '../panel.jsx';

import CompanyStore from '../../stores/company_store.jsx';
import DomainStore from '../../stores/domain_store.jsx';
import ZimbraStore from '../../stores/zimbra_store.jsx';

import * as Client from '../../utils/client.jsx';
import * as Utils from '../../utils/utils.jsx';
import * as GlobalActions from '../../action_creators/global_actions.jsx';

import Constants from '../../utils/constants.jsx';

export default class CreateDomain extends React.Component {
    constructor(props) {
        super(props);

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

        if (companies) {
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
            error.type = Constants.MessageType.ERROR;
            this.setState({error});
        }).
        finally(() => {
            GlobalActions.emitEndLoading();
        });
    }

    handleSubmit(e) {
        e.preventDefault();
        GlobalActions.emitStartLoading();
        Utils.validateInputRequired(this.refs).
        then(() => {
            const plans = Object.keys(this.state.plans);
            const zimbraDomainCOSMaxAccounts = [];
            const name = this.refs.domainName.value.trim();
            const businessCategory = this.refs.account.value.trim();

            plans.forEach((p) => {
                zimbraDomainCOSMaxAccounts.push(`${this.refs[`plan-${p}`].getAttribute('data-id')}:${this.refs[`plan-${p}`].value || 0}`);
            });

            const domain = {
                name,
                attrs: {
                    zimbraDomainCOSMaxAccounts,
                    businessCategory
                }
            };

            Client.createDomain(
                domain,
                (data) => {
                    CompanyStore.addDomain(businessCategory, data);
                    DomainStore.setCurrent(data);
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
            return this.setState({error});
        });
    }

    componentDidMount() {
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

            let errorBar;
            let formClass = 'simple_form form-horizontal mailbox-form';
            if (error) {
                if (error.refs) {
                    formClass += ' has-error';
                }
                errorBar = (
                    <MessageBar
                        message={error.message}
                        type={error.type}
                        autoclose={true}
                    />
                );
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
                    className={formClass}
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
                            {'Cuenta'}
                        </label>

                        <div className='col-sm-8'>
                            <select
                                className='form-control select required'
                                data-required='true'
                                data-message='Debe especificar a que cuenta corresponde el dominio'
                                ref='account'
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
                            <input
                                type='submit'
                                name='commit'
                                value='Guardar'
                                className='btn btn-info'
                            />
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

            const actions = [
                {
                    label: 'Cancelar',
                    props: {
                        className: 'btn btn-default btn-xs',
                        onClick: (e) => Utils.handleLink(e, backUrl)
                    }
                }
            ];

            return (
                <Panel
                    title={'Agregar Dominio'}
                    btnsHeader={actions}
                    error={errorBar}
                    classHeader={'forum-box'}
                >
                    {form}
                </Panel>
            );
        }

        return <div/>;
    }
}

CreateDomain.propTypes = {
    params: React.PropTypes.object.isRequired
};
