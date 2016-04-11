// Copyright (c) 2016 ZBox, Spa. All Rights Reserved.
// See LICENSE.txt for license information.

import $ from 'jquery';
import React from 'react';
import Promise from 'bluebird';
import EventStore from '../../stores/event_store.jsx';

import PageInfo from '../page_info.jsx';
import Panel from '../panel.jsx';
import PanelTab from '../panel_tab.jsx';
import Pagination from '../pagination.jsx';
import MailboxStore from '../../stores/mailbox_store.jsx';
import Button from '../button.jsx';
import statusLabel from '../status_label.jsx';
import MessageBar from '../message_bar.jsx';

import * as Client from '../../utils/client.jsx';
import * as GlobalActions from '../../action_creators/global_actions.jsx';
import * as Utils from '../../utils/utils.jsx';
import Constants from '../../utils/constants.jsx';

import ToggleModalButton from '../toggle_modal_button.jsx';
import ImportMassiveModal from '../import_massive_modal.jsx';

import DomainStore from '../../stores/domain_store.jsx';

const QueryOptions = Constants.QueryOptions;
const messageType = Constants.MessageType;

import ZimbraStore from '../../stores/zimbra_store.jsx';

export default class Mailboxes extends React.Component {
    constructor(props) {
        super(props);

        this.showMessage = this.showMessage.bind(this);
        this.refreshAllAccounts = this.refreshAllAccounts.bind(this);
        this.handleFilterMailbox = this.handleFilterMailbox.bind(this);
        this.handleChangeFilter = this.handleChangeFilter.bind(this);
        const page = parseInt(this.props.location.query.page, 10) || 1;
        this.mailboxes = null;
        this.status = '';
        this.cos = Utils.getEnabledPlansByCos(ZimbraStore.getAllCos());
        this.cosById = Utils.getEnabledPlansByCosId(ZimbraStore.getAllCos());
        this.isRefreshing = true;

        this.state = {
            page,
            offset: ((page - 1) * QueryOptions.DEFAULT_LIMIT)
        };
    }

    handleChangeFilter(e) {
        const selected = e.target.value;
        const cos = Utils.getEnabledPlansByCos(ZimbraStore.getAllCos());

        if (e.target.className.indexOf('plans') > -1) {
            this.cos = cos[selected];
        }

        if (e.target.className.indexOf('status') > -1) {
            this.status = selected;
        }

        const data = Object.assign({}, this.mailboxes);

        const arrayFiltered = data.account.filter((strArray) => {
            const status = this.status === '' ? strArray.attrs.zimbraAccountStatus : this.status;
            const plan = this.cos ? this.cos : strArray.attrs.zimbraCOSId;

            if (strArray.attrs.zimbraAccountStatus === status && strArray.attrs.zimbraCOSId === plan) {
                return strArray;
            }

            return false;
        });

        data.account = arrayFiltered;
        data.total = arrayFiltered.length;

        const tables = this.buildTableFromData(data, ['Todas', 'Bloqueadas']);

        return this.setState({
            data: tables
        });
    }

    handleFilterMailbox(e, info) {
        const search = e.target.value;
        const data = Object.assign({}, info);

        const arrayFiltered = data.account.filter((strArray) => {
            if (this.status === '') {
                if (strArray.name.match(search)) {
                    return strArray;
                }
            }

            if (strArray.name.match(search) && strArray.attrs.zimbraAccountStatus === this.status) {
                return strArray;
            }

            return false;
        });

        data.account = arrayFiltered;
        data.total = arrayFiltered.length;

        const tables = this.buildTableFromData(data, ['Todas', 'Bloqueadas']);

        return this.setState({
            data: tables
        });
    }

    showMessage(attrs) {
        this.setState({
            error: attrs.error,
            type: attrs.typeError
        });
    }

    handleExportAsCSV(e) {
        e.preventDefault();
        const accounts = MailboxStore.getMailboxes();

        if (accounts && accounts.account && accounts.account.length > 0) {
            return Utils.exportAsCSV(accounts.account, 'all_accounts', true);
        }

        return false;
    }

    componentWillReceiveProps(newProps) {
        const condition = this.props.location.query.page !== newProps.location.query.page;
        let domainId = null;

        if (condition) {
            const page = parseInt(newProps.location.query.page, 10) || 1;

            GlobalActions.emitStartLoading();

            this.state = {
                page,
                offset: ((page - 1) * QueryOptions.DEFAULT_LIMIT)
            };

            domainId = this.props.params.domain_id;

            this.getAllMailboxes(domainId, window.manager_config.maxResultOnRequestZimbra);
        } else {
            GlobalActions.emitStartLoading();

            if (newProps.params.domain_id !== this.props.params.domain_id) {
                domainId = newProps.params.domain_id;
            }

            this.getAllMailboxes(domainId, window.manager_config.maxResultOnRequestZimbra);
        }
    }

    domainInfo(domainId) {
        return new Promise(
            (resolve, reject) => {
                const domain = DomainStore.getCurrent();
                if (domain && domainId === domain.id) {
                    return resolve();
                }

                return Client.getDomain(
                    domainId,
                    (data) => {
                        DomainStore.setCurrent(data);
                        return resolve();
                    },
                    () => {
                        return reject();
                    }
                );
            }
        );
    }

    getAccounts(domainName, maxResult) {
        const attrs = {
            limit: QueryOptions.DEFAULT_LIMIT,
            maxResults: maxResult,
            offset: this.state.offset
        };

        if (domainName) {
            attrs.domain = domainName;
        }

        new Promise((resolve, reject) => {
            if (domainName) {
                return Client.getAllAccounts(attrs, (success) => {
                    return resolve(success);
                }, (error) => {
                    return reject(error);
                });
            }

            if (MailboxStore.hasMailboxes() && MailboxStore.hasThisPage(this.state.page)) {
                console.log('has page with data');
                return resolve(MailboxStore.getMailboxByPage(this.state.page));
            }

            return Client.getAllAccounts(attrs, (success) => {
                MailboxStore.setMailboxes(success, this.state.page);
                this.mailboxes = MailboxStore.getMailboxes();

                return resolve(success);
            }, (error) => {
                return reject(error);
            });
        }).then((data) => {
            if (data.account) {
                this.isRefreshing = false;

                const tables = this.buildTableFromData(data, ['Todas', 'Bloqueadas']);

                if (tables.lockedAlert) {
                    GlobalActions.emitMessage({
                        error: tables.lockedAlert.message,
                        typeError: messageType.LOCKED
                    });
                }

                return this.setState({
                    data: tables
                });
            }

            return this.setState({
                notMatches: true,
                domain: domainName
            });
        }).catch((error) => {
            if (error.code === 'account.TOO_MANY_SEARCH_RESULTS') {
                this.isRefreshing = true;
                const newMaxResult = (parseInt(maxResult, 10) + window.manager_config.autoincrementOnFailRequestZimbra);
                window.manager_config.maxResultOnRequestZimbra = newMaxResult;
                setTimeout(() => {
                    this.getAccounts(domainName, newMaxResult);
                }, 250);
            }
        }).finally(() => {
            if (!this.isRefreshing) {
                GlobalActions.emitEndLoading();
            }
        });
    }

    getAllMailboxes(domainId) {
        if (domainId) {
            return this.domainInfo(domainId).then(() => {
                const domain = DomainStore.getCurrent();
                this.getAccounts(domain.name, window.manager_config.maxResultOnRequestZimbra);
            });
        }

        return this.getAccounts(null, window.manager_config.maxResultOnRequestZimbra);
    }

    refreshAllAccounts() {
        const mailboxes = MailboxStore.getMailboxes();
        const tables = this.buildTableFromData(mailboxes, ['Todas', 'Bloqueadas']);

        if (tables.lockedAlert) {
            GlobalActions.emitMessage({
                error: tables.lockedAlert.message,
                typeError: messageType.LOCKED
            });
        }

        this.setState({
            data: tables
        });
    }

    componentDidMount() {
        $('#sidebar-mailboxes').addClass('active');
        EventStore.addMessageListener(this.showMessage);
        MailboxStore.addListenerAddMassive(this.refreshAllAccounts);
        const domainId = this.props.params.domain_id;
        this.getAllMailboxes(domainId);
    }

    componentWillUnmount() {
        EventStore.removeMessageListener(this.showMessage);
        MailboxStore.removeListenerAddMassive(this.showMessage);
        $('#sidebar-mailboxes').removeClass('active');
    }

    buildRow(row, classes, status) {
        const id = row.id;
        const attrs = row.attrs;
        let displayName = 'No definido';
        let tipo = attrs.zimbraCOSId || null;

        if (tipo) {
            tipo = this.cosById[tipo] || null;
            if (tipo) {
                tipo = Utils.titleCase(tipo);
            }
        }

        if (!tipo) {
            tipo = 'Desconocido';
        }

        if (attrs.displayName) {
            displayName = attrs.displayName.trim();
        } else if (attrs.cn || attrs.sn) {
            const cn = attrs.cn || '';
            const sn = attrs.sn || '';
            displayName = `${cn.trim()} ${sn.trim()}`;
        }

        return (
            <tr
                key={id}
                className={'mailbox-row'}
                id={id}
            >
                <td className={'mailbox-name'}>
                    <statusLabel className={classes}>{status}</statusLabel>
                    <Button
                        btnAttrs={
                            {
                                className: 'mailbox-link',
                                onClick: (e) => Utils.handleLink(e, 'mailboxes/' + id)
                            }
                        }
                    >
                        {row.name}
                    </Button>
                </td>

                <td className={'mailbox-displayname'}>
                    {displayName}
                </td>

                <td className={'mailbox-cos-plan'}>
                    <statusLabel className={'label-plan label-unknown'}>{tipo}</statusLabel>
                </td>

                <td className='text-center'>
                    <Button
                        btnAttrs={
                            {
                                className: 'btn btn-xs btn-default',
                                onClick: (e) => Utils.handleLink(e, '/mailboxes/' + id + '/edit')
                            }
                        }
                    >
                        {'Editar'}
                    </Button>
                </td>
            </tr>
        );
    }

    makeTable(rows, page) {
        const hasPage = page || false;
        let pagination = null;
        if (hasPage) {
            pagination = (
                <Pagination
                    key='panelPagination'
                    url='mailboxes'
                    currentPage={this.state.page}
                    totalPages={hasPage.total}
                />
            );
        }

        if (Array.isArray(rows) && rows.length < 1) {
            return (
                <div className='text-center'>
                    <h4>
                        No existen resultados para su búsqueda
                    </h4>
                </div>
            );
        }

        return (
            <div
                key='mailbox'
                id='index-mailboxes-table'
                className='table-responsive'
            >
                <table
                    id='index-domains'
                    cellPadding='1'
                    cellSpacing='1'
                    className='table table-condensed table-striped vertical-align index-mailbox-table'
                >
                    <thead>
                    <tr>
                        <th>{'Email'}</th>
                        <th className='td-mbxs text-left'>{'Nombre'}</th>
                        <th className='text-left'>{'Tipo'}</th>
                        <th className='text-center'>{'Acciones'}</th>
                    </tr>
                    </thead>
                    <tbody>
                    {rows}
                    </tbody>
                </table>
                {pagination}
            </div>
        );
    }

    insertToPanel(table, id, btns, filter) {
        const btn = btns || [];
        const getFilter = filter || null;

        return (
            <Panel
                children={table}
                key={id}
                btnsHeader={btn}
                filter={getFilter}
            />
        );
    }

    buildTableFromData(data, arrayTabNames) {
        if (data.account) {
            const accounts = data.account;
            const totalAccounts = data.total;
            const limit = data.account.length;
            let activeAccounts = [];
            let lockedAccounts = [];
            const tabs = {};

            for (let i = 0; i < limit; i++) {
                const account = accounts[i].attrs;
                switch (account.zimbraAccountStatus) {
                case 'active':
                    activeAccounts.push(this.buildRow(accounts[i], 'label label-success m-r', 'Activa'));
                    break;
                case 'closed':
                    activeAccounts.push(this.buildRow(accounts[i], 'label label-default m-r', 'Cerrada'));
                    break;
                case 'locked':
                    activeAccounts.push(this.buildRow(accounts[i], 'label label-warning m-r', 'Inactiva'));
                    break;
                case 'lockedout':
                    lockedAccounts.push(this.buildRow(accounts[i], 'label label-locked m-r', 'Bloqueada'));
                    activeAccounts.push(this.buildRow(accounts[i], 'label label-locked m-r', 'Bloqueada'));
                    break;
                }
            }

            const response = {};
            const all = `${arrayTabNames.shift()} (${totalAccounts})`;
            const locked = `${arrayTabNames.shift()} (${lockedAccounts.length})`;

            // create structure html for all accountsç
            const icon = (
                <div>
                    <i className='fa fa-download'/>
                    <span>{'Exportar'}</span>
                </div>
            );

            const btn = [
                {
                    props: {
                        className: 'btn btn-default',
                        onClick: (e) => {
                            this.handleExportAsCSV(e);
                        }
                    },
                    label: icon
                },
                {
                    setComponent: (
                        <ToggleModalButton
                            role='button'
                            className='btn btn-info hide-xs hide-sm'
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
                    props: {
                        className: 'btn btn-success',
                        onClick: (e) => Utils.handleLink(e, '/mailboxes/new')
                    },
                    label: '+ Nueva Casilla'
                }
            ];

            let activePagination = {
                total: totalAccounts
            };
            const totalPage = Math.ceil(totalAccounts / QueryOptions.DEFAULT_LIMIT);
            if (activeAccounts.length > QueryOptions.DEFAULT_LIMIT) {
                activeAccounts = activeAccounts.slice(this.state.offset, (this.state.page * QueryOptions.DEFAULT_LIMIT));
                activePagination = {
                    total: totalPage
                };
            }

            let lockedPagination = null;
            if (lockedAccounts.length > QueryOptions.DEFAULT_LIMIT) {
                lockedAccounts = lockedAccounts.slice(this.state.offset, (this.state.page * QueryOptions.DEFAULT_LIMIT));
                lockedPagination = {
                    total: totalPage
                };
            }

            const filter = (
                <div>
                    <div className='input-group pull-left'>
                        <select
                            className='form-control status'
                            onChange={this.handleChangeFilter}
                        >
                            <option value=''>Todas</option>
                            <option value='active'>Activa</option>
                            <option value='locked'>Inactiva</option>
                            <option value='lockedout'>Bloqueada</option>
                            <option value='closed'>Cerradas</option>
                        </select>
                    </div>

                    <div className='input-group'>
                        <select
                            className='form-control plans'
                            onChange={this.handleChangeFilter}
                        >
                            <option value=''>Todos los planes</option>
                            <option value='basic'>Básico</option>
                            <option value='professional'>Profesional</option>
                            <option value='premium'>Premium</option>
                        </select>
                    </div>
                </div>
            );

            const tableActive = this.makeTable(activeAccounts, activePagination);
            const panelActive = this.insertToPanel(tableActive, 'panel-all', btn, filter);

            // create structure html for all locked accounts
            const tableLocked = this.makeTable(lockedAccounts, lockedPagination);
            const panelLocked = this.insertToPanel(tableLocked, 'panel-locked');

            arrayTabNames.push(all, locked);
            tabs[Utils.slug(all)] = panelActive;
            tabs[Utils.slug(locked)] = panelLocked;
            response.tabNames = arrayTabNames;
            response.tabs = tabs;

            if (lockedAccounts.length > 0) {
                const isPlural = (lockedAccounts.length > 1) ? true : null;
                response.lockedAlert = {
                    total: lockedAccounts.length,
                    message: (isPlural) ? `${lockedAccounts.length} casillas bloqueadas` : `${lockedAccounts.length} casilla bloqueada`
                };
            }

            return response;
        }

        return false;
    }

    render() {
        let message = null;
        let content = null;

        if (this.state.error) {
            message = (
                <MessageBar
                    message={this.state.error}
                    type={this.state.type}
                    autoclose={false}
                />
            );
        }

        if (this.state.notMatches) {
            const domain = (this.state.domain) ? `para el dominio: ${this.state.domain}` : '';
            content = (
                <div className='text-center'>
                    <h4>
                        {`No se han encontrado resultados ${domain}`}
                    </h4>
                </div>
            );
        }

        const pagelInfo = (
            <PageInfo
                titlePage='Casillas'
                descriptionPage='Usuarios de correo electrónico'
            />
        );

        if (this.state.data) {
            const data = this.state.data;

            content = (
                <PanelTab
                    tabNames={data.tabNames}
                    tabs={data.tabs}
                    location={this.props.location}
                    onClick={this.handleTabChanged}
                />
            );
        }

        return (
            <div>
                {pagelInfo}
                <div className='content animate-panel'>
                    {message}
                    <div className='row'>
                        <div className='col-md-12 panel-with-tabs'>
                            {content}
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}

Mailboxes.propTypes = {
    location: React.PropTypes.object.isRequired,
    params: React.PropTypes.object.isRequired
};
