// Copyright (c) 2016 ZBox, Spa. All Rights Reserved.
// See LICENSE.txt for license information.

import $ from 'jquery';
import React from 'react';
import Promise from 'bluebird';

import PageInfo from '../page_info.jsx';
import Panel from '../panel.jsx';

import CompaniesStore from '../../stores/company_store.jsx';

import * as Client from '../../utils/client.jsx';
import * as Utils from '../../utils/utils.jsx';
import * as GlobalActions from '../../action_creators/global_actions.jsx';

import Constants from '../../utils/constants.jsx';

const messageTypes = Constants.MessageType;

export default class Companies extends React.Component {
    constructor(props) {
        super(props);

        this.state = {};

        this.getCompanies = this.getCompanies.bind(this);
        this.getDomains = this.getDomains.bind(this);
        this.getPlans = this.getPlans.bind(this);
        this.getAdmins = this.getAdmins.bind(this);
        this.gotoCompany = this.gotoCompany.bind(this);
    }

    gotoCompany(e, company) {
        CompaniesStore.setCurrent(company);
        Utils.handleLink(e, `/companies/${company.id}`, this.props.location);
    }

    getCompanies() {
        const self = this;
        const companies = CompaniesStore.getCompanies();
        if (companies) {
            self.setState({
                companies
            });
            return GlobalActions.emitEndLoading();
        }

        return Client.getAllCompanies().then((data) => {
            const domains = data.map((d) => {
                return self.getDomains(d);
            });

            return Promise.all(domains).then((comps) => {
                CompaniesStore.setCompanies(comps);
                self.setState({
                    companies: comps
                });
            }).
            catch((error) => {
                self.setState({error: {
                    message: error,
                    type: messageTypes.ERROR
                }});
            });
        }).catch((error) => {
            self.setState({error});
        }).finally(() => {
            GlobalActions.emitEndLoading();
        });
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
                    Promise.all([self.getPlans(domains), self.getAdmins(domains)]).
                    then(() => {
                        company.domains = domains;
                        resolve(company);
                    }).catch((error) => {
                        reject(error);
                    });
                },
                (error) => {
                    reject(error);
                });
        });
    }

    getAdmins(domains) {
        return new Promise((resolve, reject) => {
            const promises = domains.map((d) => {
                return new Promise((solve, rej) => {
                    return d.getAdmins((err, admins) => {
                        if (err) {
                            return rej(err);
                        }

                        d.admins = admins;
                        return solve(d);
                    });
                });
            });

            Promise.all(promises).
            then((doms) => {
                resolve(doms);
            }).
            catch((error) => {
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

    componentDidMount() {
        $('#sidebar-companies').addClass('active');
        this.getCompanies();
    }

    componentWillUnmount() {
        $('#sidebar-companies').removeClass('active');
    }

    render() {
        if (!this.state.companies) {
            return <div/>;
        }

        let panelBody;
        if (this.state.companies.length === 0) {
            panelBody = (
                <div className='center-block text-center'>
                    <h5>
                        {'Actualmente no hay ninguna empresa registrada '}
                        <label style={{transform: 'rotate(90deg)'}}>
                            {':=('}
                        </label>
                    </h5>
                </div>
            );
        } else {
            const rows = this.state.companies.map((c) => {
                const plans = Utils.getPlansFromDomains(c.domains);
                const plansString = [];
                const totalBought = Object.keys(plans).reduce((prev, current) => {
                    const limit = plans[current].limit;

                    plansString.push(`${limit} ${Utils.titleCase(current.slice(0, 3))}`); //eslint-disable-line no-undefined

                    if (plans[prev]) {
                        return plans[prev].limit + limit;
                    }
                    return limit;
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
                <div className='table-responsive'>
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
                <div className='content animate-panel'>
                    <div className='row'>
                        <div className='col-md-12 central-content'>
                            <Panel
                                hasHeader={false}
                                children={panelBody}
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
