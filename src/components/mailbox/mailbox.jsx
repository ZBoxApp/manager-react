// Copyright (c) 2016 ZBox, Spa. All Rights Reserved.
// See LICENSE.txt for license information.

import $ from 'jquery';
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import EventStore from '../../stores/event_store.jsx';
import { Link } from 'react-router';
import PageInfo from '../page_info.jsx';
import Panel from '../panel.jsx';
import MessageBar from '../message_bar.jsx';
import { countAllLockoutAccounts, getAllAccounts, getDomain } from '../../utils/client.jsx';
import { emitMessage } from '../../action_creators/global_actions.jsx';
import ToggleModalButton from '../toggle_modal_button.jsx';
import ImportMassiveModal from '../import_massive_modal.jsx';
import ZimbraStore from '../../stores/zimbra_store.jsx';
import { normalizeStatusFilter, getAttrsBySectionFromConfig, exportAsCSV } from '../../utils/utils.jsx';
import { classByStatus, StatusLabel, DisplayAccountName, ExportButton } from '../commons.jsx';
import Constants from '../../utils/constants.jsx';
import TableContainer from '../TableContainer.jsx';
const { MessageType } = Constants;

const columns = (coses) => [
    {
        title: 'Status',
        key: 'id',
        render: (item) => {
            const { attrs } = item;
            const { zimbraAccountStatus } = (attrs || {});
            return <StatusLabel status={zimbraAccountStatus}/>;
        }
    },
    {
        title: 'Email',
        key: 'name',
        render: (item) => {
            const { name, id } = item;
            return <Link to={`/mailboxes/${id}`}>{name}</Link>;
        }
    },
    {
        title: 'Nombre',
        key: 'displayName',
        render: (item) => {
            return <DisplayAccountName account={item}/>;
        }
    },
    {
        title: 'Tipo',
        key: 'zimbraCreateTimestamp',
        render: (item) => {
            const { attrs } = item;
            const { zimbraCOSId } = (attrs || {});
            const cos = coses[zimbraCOSId];
            return <span>{cos.name}</span>;
        }
    },
    {
        title: 'Acciones',
        key: 'uid',
        render: (item) => {
            const { id } = item;
            return (
                <Link
                    className={'btn btn-xs btn-default'}
                    to={`/mailboxes/${id}/edit`}
                >
                    {'Editar'}
                </Link>
            );
        }
    }
];

export default class MailboxesContainer extends Component {
    static propTypes = {
        params: PropTypes.object
    };

    constructor(props) {
        super(props);

        this.state = {
            locked: 0,
            error: false,
            lockedAccountLoaded: false,
            message: null,
            type: '',
            filter: {
                zimbraAccountStatus: '',
                zimbraCOSId: ''
            }
        };

        this.domain = null;
        this.createUrlFromParams = props.params.domain_id ? `/domains/${props.params.domain_id}/mailboxes/new` : '/mailboxes/new';
        // get all static plans for accounts
        const optionPlans = window.manager_config.plans;
        this.coses = ZimbraStore.getAllCos();
        this.hashCoses = this.coses.reduce((memo, cos) => {
            const { name, id } = cos;

            memo[id] = {
                name
            };

            return memo;
        }, {});
        const coses = this.coses;

        const plans = Object.keys(optionPlans).map((key) => {
            const cos = coses.find((cos) => cos.name.toLowerCase() === key.toLowerCase());
            let plan = optionPlans[key];

            if (typeof plan === 'boolean') {
                plan = false;
            } else {
                plan.cos = cos;
            }

            return plan;
        }).filter((plan) => typeof plan !== 'boolean').map((plan) => {
            const { cos, label, statusCos } = plan;
            return {
                label,
                value: cos.id,
                className: statusCos
            };
        });

        const status = normalizeStatusFilter(classByStatus);

        this.planFilter = this.generateFilter(plans, 'zimbraCOSId', { label: 'Todos los planes', value: '' });
        this.statusFilter = this.generateFilter(status, 'zimbraAccountStatus');

        this.attributes = getAttrsBySectionFromConfig('mailboxes');
        this.onLoad = this.onLoad.bind(this);
        this.showMessage = this.showMessage.bind(this);
        this.makeQueryFilter = this.makeQueryFilter.bind(this);
        this.handleFilterChange = this.handleFilterChange.bind(this);
        this.generateFilter = this.generateFilter.bind(this);
        this.makeFilter = this.makeFilter.bind(this);
        this.generateAttributes = this.generateAttributes.bind(this);
        this.onExport = this.onExport.bind(this);
        this.onHandlerExport = this.onHandlerExport.bind(this);
        this.showError = this.showError.bind(this);
    }

    getDomainIdFromParams(queryObject) {
        const { params } = queryObject;
        const { domain_id: domainId } = (params || {});
        return domainId || false;
    }

    getLockedAccounts(domain) {
        const domainName = domain ? domain.name : null;
        const { lockedAccountLoaded, locked } = this.state;
        return new Promise((resolve, reject) => {
            if (lockedAccountLoaded) {
                return resolve({ total: locked });
            }
            countAllLockoutAccounts(domainName, resolve, reject);
        });
    }

    makeQueryFilter() {
        const { filter } = this.state;
        const query = Object.keys(filter).reduce((memo, field) => {
            let _memo = memo;
            const value = filter[field];

            if (value) {
                _memo += `(${field}=${value})`;
            }

            return _memo;
        }, '');

        return query ? `(&${query})` : false;
    }

    generateAttributes(queryObject) {
        const { query: queryUrl } = queryObject;
        const domainId = this.getDomainIdFromParams(queryObject);
        const { page, limit } = queryUrl;
        const offset = (page - 1) * limit;

        const attributes = {
            maxResults: 0,
            types: 'accounts',
            attrs: this.attributes,
            offset,
            limit
        };

        const query = this.makeQueryFilter();

        if (query) {
            attributes.query = query;
        }

        if (domainId) {
            attributes.domain = this.domain.name;
        }

        return attributes;
    }

    loadAccounts(attributes) {
        return new Promise((resolve, reject) => {
            getAllAccounts(attributes, resolve, reject);
        });
    }

    loadDomain(queryObject) {
        const domainId = this.getDomainIdFromParams(queryObject);
        const needToLoadDomain = domainId || false;
        return new Promise((resolve, reject) => {
            if (!needToLoadDomain) {
                return resolve(this.domain);
            }

            if (this.domain) {
                return resolve(this.domain);
            }

           getDomain(domainId, resolve, reject);
        });
    }

    showError(error, update) {
        update({ loading: false });
        const { message } = error;

        this.setState({ error: true }, () => {
            emitMessage({
                error: message,
                typeError: MessageType.ERROR
            });
        });
    }

    onLoad(queryObject, update) {
        const { lockedAccountLoaded, error } = this.state;

        if (error) {
            return;
        }

        update({ loading: true });

        this.loadDomain(queryObject).then((domain) => {
            this.domain = domain;

            // load locked accounts
            this.getLockedAccounts(this.domain).then(({ total: locked }) => {
                const attributes = this.generateAttributes(queryObject);
                this.loadAccounts(attributes).then(({ total, account }) => {
                    // show locked account is exist
                    if (!lockedAccountLoaded && !isNaN(Number(locked)) && locked > 0) {
                        const mailboxLabel = locked === 1 ? 'casillas' : 'casilla';

                        emitMessage({
                            error: `${locked} ${mailboxLabel} bloqueadas.`,
                            typeError: MessageType.LOCKED
                        });
                    }

                    update({ total, items: (account || []), loading: false, locked, lockedAccountLoaded: true });
                }).catch((error) => this.showError(error, update));
            }).catch((error) => this.showError(error, update));
        }).catch((error) => this.showError(error, update));
    }

    showMessage(attrs) {
        this.setState({
            message: attrs.error,
            type: attrs.typeError
        });
    }

    componentDidMount() {
        $('#sidebar-mailboxes').addClass('active');
        EventStore.addMessageListener(this.showMessage);
    }

    componentWillUnmount() {
        EventStore.removeMessageListener(this.showMessage);
        $('#sidebar-mailboxes').removeClass('active');
    }

    showMessageBanner() {
        const { message, type } = this.state;

        if (message) {
            return (
                <MessageBar
                    message={message}
                    type={type}
                    autoclose={false}
                />
            );
        }

        return <div/>;
    }

    makeFilter() {
        return (
            <div>
                <div className='input-group pull-left'>
                    {this.statusFilter}
                </div>

                <div className='input-group'>
                    {this.planFilter}
                </div>
            </div>
        );
    }

    onExport() {
        const { name } = this.domain;

        const attributes = {
            maxResults: 0,
            type: 'accounts',
            domain: name
        };

        return this.loadAccounts(attributes);
    }

    onHandlerExport({ account }) {
        const { name } = this.domain;
        const msg = `Casillas del dominio: ${name}`;
        exportAsCSV(account, 'domain', msg, true);
    }

    handleFilterChange(event) {
        const { target } = event;
        const { name, value } = target;

        const { filter } = this.state;
        const nextFilter = { ...filter, ...{ [name]: value } };

        this.setState({
            filter: nextFilter
        });
    }

    generateFilter(items, name, _default = { label: 'Todas', value: '' }) {
        const options = items.map((plan) => {
            const { label, value } = plan;
            return (
                <option
                    key={value}
                    value={value}
                >
                    {label}
                </option>
            );
        });

        return (
            <select
                className='form-control status'
                onChange={(event) => this.handleFilterChange(event)}
                name={name}
            >
                <option value={_default.value}>{_default.label}</option>
                {options}
            </select>
        );
    }

    makeHeaderButton() {
        const buttons = [
            {
                setComponent: (
                    <ExportButton
                        onExport={this.onExport}
                        onSuccess={this.onHandlerExport}
                    >
                        {'Exportar Casillas'}
                    </ExportButton>
                )
            },
            {
                setComponent: (
                    <ToggleModalButton
                        role='button'
                        className='btn btn-info hide-xs hide-sm m-r'
                        dialogType={ImportMassiveModal}
                        dialogProps={{
                            data: this.state.data
                        }}
                        key='change-passwd-import'
                    >
                        {'Importar'}
                    </ToggleModalButton>
                )
            },
            {
                setComponent: (
                    <Link
                        to={this.createUrlFromParams}
                        className={'btn btn-success'}
                    >
                        {'+ Nueva Casilla'}
                    </Link>
                )
            }
        ];

        if (!this.domain) {
            buttons.shift();
        }

        return buttons;
    }

    makeCols() {
        return columns(this.hashCoses);
    }

    render() {
        return (
            <div>
                <PageInfo
                    titlePage='Casillas'
                    descriptionPage='Usuarios de correo electrónico'
                />
                <div className='content animate-panel'>
                    {this.showMessageBanner()}
                    <div className='row'>
                        <div className='col-md-12 panel-with-tabs'>
                            <Panel
                                btnsHeader={this.makeHeaderButton()}
                                filter={this.makeFilter()}
                            >
                                <TableContainer
                                    {...this.props}
                                    onLoad={this.onLoad}
                                    columns={this.makeCols()}
                                />
                            </Panel>
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}
