// Copyright (c) 2016 ZBox, Spa. All Rights Reserved.
// See LICENSE.txt for license information.

import $ from 'jquery';
import React from 'react';
import Promise from 'bluebird';

import MessageBar from '../message_bar.jsx';
import PageInfo from '../page_info.jsx';
import Pagination from '../pagination.jsx';
import Panel from '../panel.jsx';
import StatusLabel from '../status_label.jsx';

import DomainStore from '../../stores/domain_store.jsx';

import * as Client from '../../utils/client.jsx';
import * as Utils from '../../utils/utils.jsx';
import * as GlobalActions from '../../action_creators/global_actions.jsx';
import Constants from '../../utils/constants.jsx';
import UserStore from '../../stores/user_store.jsx';

const QueryOptions = Constants.QueryOptions;
const messageType = Constants.MessageType;

export default class Domains extends React.Component {
    constructor(props) {
        super(props);

        this.getDomains = this.getDomains.bind(this);

        const page = parseInt(this.props.location.query.page, 10) || 1;
        this.isGlobalAdmin = UserStore.isGlobalAdmin();

        this.state = {
            page,
            offset: ((page - 1) * QueryOptions.DEFAULT_LIMIT),
            loading: true
        };
    }

    getDomains() {
        const self = this;
        let domains = null;
        if (DomainStore.getDomains()) {
            const data = DomainStore.getDomains();

            GlobalActions.emitEndLoading();

            return self.setState({
                data,
                loading: false
            });
        }

        Client.getAllDomains(
            {
                maxResults: window.manager_config.maxResultOnRequestZimbra
            },
            (data) => {
                domains = data.domain;
                DomainStore.setDomains(data);
                this.getPlans(domains).
                then(() => {
                    self.setState({
                        data,
                        loading: false
                    });
                }).
                catch(() => {
                    this.setState({
                        error: {
                            message: 'No se obtuvieron los planes de las cuentas',
                            type: messageType.ERROR,
                            loading: false
                        }
                    });
                }).
                finally(() => {
                    GlobalActions.emitEndLoading();
                });
            },
            (error) => {
                this.setState({
                    error: {
                        message: error.message,
                        type: messageType.ERROR,
                        loading: false
                    }
                });
                GlobalActions.emitEndLoading();
            }
        );

        return null;
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
    componentWillReceiveProps(newProps) {
        if (this.props.location.query.page !== newProps.location.query.page) {
            const page = parseInt(newProps.location.query.page, 10) || 1;

            GlobalActions.emitStartLoading();

            this.state = {
                page,
                offset: ((page - 1) * QueryOptions.DEFAULT_LIMIT),
                loading: true
            };

            this.getDomains();
        }
    }
    componentDidMount() {
        $('#sidebar-domains').addClass('active');
        this.getDomains();
    }

    componentWillUnmount() {
        $('#sidebar-domains').removeClass('active');
    }

    render() {
        const error = this.state.error;
        let message = null;
        let addDomainButton = null;
        let pagination = null;
        let panelBody = null;
        let tableResults = null;

        if (error) {
            message = (
                <MessageBar
                    message={error.message}
                    type={error.type}
                    autoclose={true}
                />
            );
        }

        if (this.state.loading) {
            panelBody = (
                <div
                    className='text-center'
                    key={'domain-loading'}
                >
                    <i className='fa fa-spinner fa-spin fa-4x fa-fw'></i>
                    <p>{'Cargando Dominios...'}</p>
                </div>
            );
        }

        if (this.isGlobalAdmin) {
            addDomainButton = [{
                label: 'Agregar Dominio',
                props: {
                    className: 'btn btn-success',
                    onClick: (e) => {
                        Utils.handleLink(e, '/domains/new');
                    }
                }
            }];
        }

        if (this.state.data) {
            const domain = this.state.data;
            let domains = domain.domain;

            if (domain.total > Constants.QueryOptions.DEFAULT_LIMIT) {
                domains = domain.domain.slice(this.state.offset, (this.state.page * QueryOptions.DEFAULT_LIMIT));
            }

            const configPlans = global.window.manager_config.plans;
            tableResults = domains.map((d) => {
                let status;
                let statusClass = 'btn btn-sm ';
                switch (d.attrs.zimbraDomainStatus) {
                case 'active':
                    status = 'Activo';
                    statusClass += 'btn-info';
                    break;
                case 'inactive':
                    status = 'Inactivo';
                    statusClass += 'btn-default';
                    break;
                default:
                    status = 'Migrando';
                    statusClass += 'btn-warning2';
                    break;
                }

                let mailboxes;
                if (d.plans) {
                    let total = 0;
                    const types = [];
                    Object.keys(d.plans).forEach((key) => {
                        if (d.plans.hasOwnProperty(key) && configPlans[key]) {
                            const plan = d.plans[key];
                            total += plan.used;
                            types.push(<li key={`domain-plan-${key}`}>{plan.used} {key}</li>);
                        }
                    });

                    mailboxes = (
                        <td className='vertical-middle text-center'>
                            <span className='total-mbxs-per-domain'>{total}</span>
                            <ul className='list-inline'>
                                {types}
                            </ul>
                        </td>
                    );
                } else {
                    mailboxes = (<td className='vertical-middle text-center'/>);
                }

                return (
                    <tr
                        key={d.id}
                        className='domain-row'
                        id={`domain-${d.id}`}
                    >
                        <td className='domain-name'>
                            <h4>
                                <a
                                    href='#'
                                    onClick={(e) => {
                                        DomainStore.setCurrent(d);
                                        Utils.handleLink(e, `/domains/${d.id}`);
                                    }}
                                >
                                    {d.name}
                                </a>
                                <br/>
                                <small/>
                            </h4>
                        </td>
                        {mailboxes}
                        <td className='vertical-middle text-justify'>
                            {d.attrs.description}
                        </td>
                        <td className='vertical-middle text-center'>
                            <StatusLabel
                                classes={statusClass}
                                children={status}
                            />
                        </td>
                    </tr>
                );
            });

            if (domain.total > Constants.QueryOptions.DEFAULT_LIMIT) {
                const totalPages = this.state.data ? Math.ceil(this.state.data.total / QueryOptions.DEFAULT_LIMIT) : 0;
                pagination = (
                    <Pagination
                        key='panelPagination'
                        url='domains'
                        currentPage={this.state.page}
                        totalPages={totalPages}
                    />
                );
            }

            panelBody = (
                <div key={'body-domains'}>
                    <div
                        id='index-domains-table'
                        className='table-responsive'
                    >
                        <table
                            id='index-domains'
                            cellPadding='1'
                            cellSpacing='1'
                            className='table table-condensed table-striped vertical-align'
                        >
                            <thead>
                            <tr key='table-heading'>
                                <th>{'Nombre'}</th>
                                <th className='text-center'>{'Casillas Compradas'}</th>
                                <th className='text-center'>{'Descripción'}</th>
                                <th className='text-center'>{'Estado'}</th>
                            </tr>
                            </thead>
                            <tbody>
                            {tableResults}
                            </tbody>
                        </table>

                    </div>
                </div>
            );
        }

        return (
            <div>
                <PageInfo
                    titlePage='Dominios'
                    descriptionPage='Dominios de correos creados'
                />
                {message}
                <div className='content animate-panel'>
                    <div className='row'>
                        <div className='col-md-12 central-content'>
                            <Panel
                                btnsHeader={addDomainButton}
                                children={[panelBody, pagination]}
                            />
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}

Domains.propTypes = {
    location: React.PropTypes.object.isRequired
};
