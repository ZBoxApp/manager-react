// Copyright (c) 2016 ZBox, Spa. All Rights Reserved.
// See LICENSE.txt for license information.

import $ from 'jquery';
import React from 'react';
import Promise from 'bluebird';

import MessageBar from '../message_bar.jsx';
import PageInfo from '../page_info.jsx';
import Panel from '../panel.jsx';
import Pagination from '../pagination.jsx';

import CompaniesStore from '../../stores/company_store.jsx';
import ZimbraStore from '../../stores/zimbra_store.jsx';
import UserStore from '../../stores/user_store.jsx';
import DomainStore from '../../stores/domain_store.jsx';

import * as Client from '../../utils/client.jsx';
import * as Utils from '../../utils/utils.jsx';
import * as GlobalActions from '../../action_creators/global_actions.jsx';

import Constants from '../../utils/constants.jsx';

const messageTypes = Constants.MessageType;

export default class Companies extends React.Component {
    constructor(props) {
        super(props);

        this.isStoreEnabled = window.manager_config.enableStores;
        this.getCompanies = this.getCompanies.bind(this);
        this.getDomains = this.getDomains.bind(this);
        this.getPlans = this.getPlans.bind(this);
        this.gotoCompany = this.gotoCompany.bind(this);
        const page = parseInt(this.props.location.query.page, 10) || 1;

        this.state = {
            page,
            offset: ((page - 1) * Constants.QueryOptions.DEFAULT_LIMIT),
            loading: true
        };

        this.isGlobalAdmin = UserStore.isGlobalAdmin();
    }

    gotoCompany(e, company) {
        if (this.isStoreEnabled) {
            CompaniesStore.setCurrent(company);
        }
        Utils.handleLink(e, `/companies/${company.id}`, this.props.location);
    }

    getCompanies() {
        const self = this;
        const companies = this.isStoreEnabled ? CompaniesStore.getCompanies() : null;
        if (companies) {
            self.setState({
                companies
            });
            return GlobalActions.emitEndLoading();
        }

        const mydomain = UserStore.getCurrentUser().name.split('@').pop();

        if (this.isGlobalAdmin) {
            return Client.getAllCompanies().then((data) => {
                const domains = data.map((company) => {
                    return self.getDomains(company);
                });

                return Promise.all(domains).then((comps) => {
                    if (this.isStoreEnabled) {
                        CompaniesStore.setCompanies(comps);
                    }

                    self.setState({
                        companies: comps,
                        loading: false
                    });
                }).
                catch((error) => {
                    self.setState({error: {
                        message: error,
                        type: messageTypes.ERROR,
                        loading: false
                    }});
                });
            }).catch((error) => {
                self.setState({error});
            }).finally(() => {
                GlobalActions.emitEndLoading();
            });
        }

        const domains = this.isStoreEnabled ? DomainStore.getDomains() : null;

        if (domains) {
            const domain = this.isStoreEnabled ? DomainStore.getDomainByName(mydomain) : null;
            Client.getCompany(domain.attrs.businessCategory, (company) => {
                if (this.isStoreEnabled) {
                    CompaniesStore.setCompanies(company);
                }
            }, (error) => {
                self.setState({error: {
                    message: error,
                    type: messageTypes.ERROR,
                    loading: false
                }});
            });
        } else {
            Client.getDomain(mydomain, (dom) => {
                Client.getCompany(dom.attrs.businessCategory, (company) => {
                    self.setState({
                        companies: company
                    });
                }, (error) => {
                    self.setState({error: {
                        message: error,
                        type: messageTypes.ERROR,
                        loading: false
                    }});
                });
            }, (error) => {
                self.setState({
                    error,
                    type: messageTypes.ERROR,
                    loading: false
                });
            });
        }

        return GlobalActions.emitEndLoading();
    }

    getDomains(company) {
        const self = this;
        return new Promise((resolve, reject) => {
            return Client.getAllDomains(
                {
                    query: `businessCategory=${company.id}`
                },
                (data) => {
                    const domains = data.domain;
                    if (domains) {
                        self.getPlans(domains).then(() => {
                            company.domains = domains;
                            resolve(company);
                        }).catch((error) => {
                            reject(error);
                        });
                    } else {
                        company.domains = [];
                        resolve(company);
                    }
                },
                (error) => {
                    reject(error);
                });
        });
    }

    getPlans(domains) {
        const names = domains.map((d) => {
            return d.name;
        });

        return new Promise((resolve, reject) => {
            return Client.batchCountAccount(
                names,
                (data) => {
                    domains.forEach((d, i) => {
                        d.plans = data[i];
                    });
                    resolve(domains);
                },
                (error) => {
                    reject(error);
                }
            );
        });
    }

    componentWillReceiveProps(nextProps) {
        const arePagesDiff = (nextProps.location.query.page !== this.props.location.query.page);
        if (arePagesDiff) {
            const page = parseInt(nextProps.location.query.page, 10) || 1;
            this.setState({
                page,
                offset: ((page - 1) * Constants.QueryOptions.DEFAULT_LIMIT)
            });
        }
        GlobalActions.emitEndLoading();
    }

    componentDidMount() {
        $('#sidebar-companies').addClass('active');
        this.getCompanies();
    }

    componentWillUnmount() {
        $('#sidebar-companies').removeClass('active');
    }

    render() {
        const textLoading = this.isGlobalAdmin ? 'Cargando Empresas...' : 'Cargando Mi Empresa...';

        if (!this.state.companies && this.state.loading) {
            return (
                <div
                    key='panelbody-loading.company'
                    className='text-center content animate-panel'
                >
                    <i className='fa fa-spinner fa-spin fa-4x fa-fw'></i>
                    <p>{textLoading}</p>
                </div>
            );
        }

        let panelBody;
        let noLimitError;
        let pagination = null;

        if (this.state.companies.length === 0) {
            panelBody = (
                <div
                    key='panelbody-nofound'
                    className='center-block text-center'
                >
                    <h5>
                        {'Actualmente no hay ninguna empresa registrada '}
                        <label style={{transform: 'rotate(90deg)'}}>
                            {':=('}
                        </label>
                    </h5>
                </div>
            );
        } else {
            const data = this.state.companies;

            if (data.length > Constants.QueryOptions.DEFAULT_LIMIT) {
                const totalPages = Math.ceil(data.length / Constants.QueryOptions.DEFAULT_LIMIT);
                pagination = (
                    <Pagination
                        key='paginationCompany'
                        url='companies'
                        currentPage={this.state.page}
                        totalPages={totalPages}
                    />
                );
            }

            const chunk = data.slice(this.state.offset, (this.state.page * Constants.QueryOptions.DEFAULT_LIMIT));

            const rows = chunk.map((c) => {
                const cos = Utils.getEnabledPlansByCosId(ZimbraStore.getAllCos());
                const plansString = [];
                const domains = c.domains;
                const planKeys = Object.keys(cos).map((cosKey) => {
                    return cos[cosKey];
                });
                const plans = {};

                planKeys.forEach((key) => {
                    plans[key] = 0;
                });

                domains.forEach((d) => {
                    const domainCos = d.maxAccountsByCos();
                    if (domainCos) {
                        Object.keys(domainCos).forEach((id) => {
                            const limit = domainCos[id];
                            plans[cos[id]] += limit;
                        });
                    } else if (!noLimitError) {
                        noLimitError = (
                            <MessageBar
                                message='Existen dominios sin límites asignados'
                                type='WARNING'
                                autoclose={false}
                                link={`/search/${Constants.ZimbraSearchs.DOMAINS_WITHOUT_LIMITS}`}
                                linkText='Ver dominios sin límites'
                            />
                        );
                    }
                });

                let totalBought = 0;
                planKeys.forEach((key) => {
                    const limit = plans[key];

                    plansString.push(`${limit} ${Utils.titleCase(key.slice(0, 3))}`); //eslint-disable-line no-undefined

                    totalBought += limit;
                });
                return (
                    <tr key={c.id}>
                        <td className='company-name'>
                            <a
                                href='#'
                                onClick={(e) => this.gotoCompany(e, c)}
                            >
                                {c.name}
                            </a>
                            <br/>
                            <small>
                                {c.id}
                            </small>
                        </td>

                        <td className='company-mbxs'>
                            <span className='total-mbxs'>{totalBought}</span>
                            <br/>
                            <small>{plansString.join(' | ')}</small>
                        </td>
                    </tr>
                );
            });

            panelBody = (
                <div
                    key='panelbody-companies'
                    className='table-responsive'
                >
                    <div className='table-responsive'>
                        <table
                            cellPadding='1'
                            cellSpacing='1'
                            className='table table-condensed table-striped vertical-align'
                        >
                            <thead>
                            <tr>
                                <th>{'Nombre'}</th>
                                <th className='text-center'>{'Casillas compradas'}</th>
                            </tr>
                            </thead>
                            <tbody>
                            {rows}
                            </tbody>
                        </table>
                    </div>
                </div>
            );
        }

        return (
            <div>
                <PageInfo
                    titlePage='Empresas'
                    descriptionPage='Las empresas son los que pagan el servicio'
                />
                {noLimitError}
                <div className='content animate-panel'>
                    <div className='row'>
                        <div className='col-md-12 central-content'>
                            <Panel
                                hasHeader={false}
                                children={[panelBody, pagination]}
                            />
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}

Companies.propTypes = {
    location: React.PropTypes.object.isRequired
};
