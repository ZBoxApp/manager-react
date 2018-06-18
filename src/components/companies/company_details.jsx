// Copyright (c) 2016 ZBox, Spa. All Rights Reserved.
// See LICENSE.txt for license information.
//import CompanyAdmins from './company_admins.jsx';

import $ from 'jquery';
import React from 'react';
import PropTypes from 'prop-types';
import Promise from 'bluebird';

import CompanyInfo from './company_info.jsx';
import CompanyMailboxPlans from './company_mailbox_plans.jsx';
import CompanyDomains from './company_domains.jsx';
import CompanyInvoices from './company_invoices.jsx';

import MessageBar from '../message_bar.jsx';
import PageInfo from '../page_info.jsx';
import PanelTab from '../panel_tab.jsx';

import CompaniesStore from '../../stores/company_store.jsx';

import * as Client from '../../utils/client.jsx';
import * as GlobalActions from '../../action_creators/global_actions.jsx';

import Constants from '../../utils/constants.jsx';

const messageTypes = Constants.MessageType;

export default class CompaniesDetails extends React.Component {
    constructor(props) {
        super(props);

        this.isStoreEnabled = window.manager_config.enableStores;
        this.state = {};

        this.getCompany = this.getCompany.bind(this);
        this.getDomains = this.getDomains.bind(this);
        this.getPlans = this.getPlans.bind(this);
    }

    getCompany() {
        const self = this;
        const companyId = this.props.params.id;

        const company = this.isStoreEnabled ? CompaniesStore.getCurrent() : null;
        if (company) {
            self.setState({
                company
            });
            return GlobalActions.emitEndLoading();
        }

        return Client.getCompany(companyId).then((data) => {
            return self.getDomains(data.data).then((comp) => {
                if (this.isStoreEnabled) {
                    CompaniesStore.setCurrent(comp);
                }
                self.setState({
                    company: comp
                });
            }).
            catch((error) => {
                self.setState({error: {
                    message: error.message,
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
                    if (domains) {
                        return self.getPlans(domains).
                        then(() => {
                            company.domains = domains;
                            resolve(company);
                        }).catch((error) => {
                            reject(error);
                        });
                    }

                    return resolve(company);
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

    componentDidMount() {
        $('#sidebar-companies').addClass('active');
        this.getCompany();
    }

    componentWillUnmount() {
        $('#sidebar-companies').removeClass('active');
    }

    render() {
        const company = this.state.company;

        if (!company) {
            return <div/>;
        }

        let message;
        if (this.state.error) {
            message = (
                <MessageBar
                    message={this.state.error.message}
                    type={this.state.error.type || messageTypes.ERROR}
                    autoclose={true}
                />
            );
        }

        /*
         'Administradores de dominio',
         administradores_de_dominio: tabAdmins,
         const tabAdmins = (
         <CompanyAdmins
         company={company}
         location={this.props.location}
         />
         );
         */

        const tabDomains = (
            <CompanyDomains
                company={company}
                location={this.props.location}
            />
        );

        const panelTabs = (
            <PanelTab
                tabNames={['Dominios']}
                tabs={{
                    dominios: tabDomains
                }}
                location={this.props.location}
            />
        );

        return (
            <div>
                <PageInfo
                    titlePage={`Empresa: ${company.name}`}
                    descriptionPage='Las empresas son los que pagan el servicio'
                />
                {message}
                <div className='content animate-panel'>
                    <div className='row'>
                        <div className='layout-back clearfix'>
                            <div className='back-left backstage'>
                                <div className='backbg'></div>
                            </div>
                            <div className='back-right backstage'>
                                <div className='backbg'></div>
                            </div>

                            <div className='col-md-6 central-content'>
                                <CompanyInfo company={company}/>
                            </div>
                            <div className='col-md-6 central-content'>
                                <CompanyMailboxPlans company={company}/>
                            </div>
                        </div>
                    </div>
                    <div className='row'>
                        <div className='col-md-12 central-content'>
                            {panelTabs}
                        </div>
                    </div>
                    <div className='row'>
                        <div className='col-md-12 central-content'>
                            <CompanyInvoices
                                company={company}
                                location={this.props.location}
                            />
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}

CompaniesDetails.propTypes = {
    location: PropTypes.object.isRequired,
    params: PropTypes.object.isRequired
};
