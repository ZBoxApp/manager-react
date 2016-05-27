// Copyright (c) 2016 ZBox, Spa. All Rights Reserved.
// See LICENSE.txt for license information.

import $ from 'jquery';
import React from 'react';
import Promise from 'bluebird';
import EventStore from '../../stores/event_store.jsx';
import {browserHistory} from 'react-router';

import PageInfo from '../page_info.jsx';
import Panel from '../panel.jsx';

//import PanelTab from '../panel_tab.jsx';
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
import ZimbraStore from '../../stores/zimbra_store.jsx';

const QueryOptions = Constants.QueryOptions;
const messageType = Constants.MessageType;

export default class Mailboxes extends React.Component {
    constructor(props) {
        super(props);

        this.showMessage = this.showMessage.bind(this);
        this.refreshAllAccounts = this.refreshAllAccounts.bind(this);
        this.handleChangeFilter = this.handleChangeFilter.bind(this);
        this.handleTabChanged = this.handleTabChanged.bind(this);
        this.makeFilter = this.makeFilter.bind(this);

        const page = parseInt(this.props.location.query.page, 10) || 1;
        this.mailboxes = null;
        this.mailboxesFiltered = null;
        this.filtering = false;
        this.selectedStatusFilter = '';
        this.selectedPlanFilter = '';
        this.selectedPlan = '';
        this.cos = Utils.getEnabledPlansByCos(ZimbraStore.getAllCos());
        this.cosById = Utils.getEnabledPlansByCosId(ZimbraStore.getAllCos());
        this.isRefreshing = true;
        this.optionStatus = {
            active: 'Active',
            locked: 'Inactiva',
            lockout: 'Bloqueada',
            closed: 'Cerrada'
        };
        this.optionPlans = window.manager_config.plans;
        this.domainId = null;
        this.domainName = null;

        this.state = {
            page,
            offset: ((page - 1) * QueryOptions.DEFAULT_LIMIT),
            loading: true
        };
    }

    handleTabChanged(tab) {
        browserHistory.push(`/mailboxes?tab=${tab}`);
    }

    handleChangeFilter(e) {
        const selected = e.target.value;

        if (e.target.className.indexOf('plans') > -1) {
            this.selectedPlanFilter = '';
            if (this.cos[selected]) {
                this.selectedPlanFilter = this.cos[selected];
                this.selectedPlan = selected;
            }
        }

        if (e.target.className.indexOf('status') > -1) {
            this.selectedStatusFilter = selected.length > 0 ? selected : '';
        }

        /*const domainId = this.domainId;
        this.getAllMailboxes(domainId, window.manager_config.maxResultOnRequestZimbra);*/
        browserHistory.push(this.props.location.pathname);
    }

    makeFilter() {
        const mailboxes = Object.assign({}, this.mailboxes);
        let cos = this.selectedPlanFilter;
        let status = this.selectedStatusFilter;

        if (cos === '' && status === '') {
            return false;
        }

        const arrayFiltered = mailboxes.account.filter((strArray) => {
            const CurrentStatus = status || strArray.attrs.zimbraAccountStatus;
            const plan = cos || strArray.attrs.zimbraCOSId;

            if (strArray.attrs.zimbraAccountStatus === CurrentStatus && strArray.attrs.zimbraCOSId === plan) {
                return strArray;
            }

            return false;
        });

        mailboxes.account = arrayFiltered;
        mailboxes.total = arrayFiltered.length;

        this.mailboxesFiltered = mailboxes;

        return this.mailboxesFiltered;
    }

    showMessage(attrs) {
        this.setState({
            error: attrs.error,
            type: attrs.typeError
        });
    }

    handleExportAsCSV(e) {
        e.preventDefault();
        if (MailboxStore.getMailboxByDomainId(this.domainId)) {
            const accounts = MailboxStore.getMailboxByDomainId(this.domainId);
            const title = `Casillas de ${accounts.account[0].domain}`;
            return Utils.exportAsCSV(accounts.account, 'domain', title, true);
        }

        return false;
    }

    componentWillReceiveProps(newProps) {
        const condition = this.props.location.query.page !== newProps.location.query.page;
        let domainId = null;

        //this.domainName = null;
        if (condition) {
            const page = parseInt(newProps.location.query.page, 10) || 1;

            GlobalActions.emitStartLoading();

            this.state = {
                page,
                offset: ((page - 1) * QueryOptions.DEFAULT_LIMIT),
                loading: true
            };

            domainId = this.domainId;

            if (this.props.params.domain_id) {
                domainId = this.props.params.domain_id;
                this.domainId = domainId;
            }

            this.getAllMailboxes(domainId, window.manager_config.maxResultOnRequestZimbra);
        } else {
            GlobalActions.emitStartLoading();

            domainId = newProps.params.domain_id;

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
        //const promises = [];

        const attrs = {
            maxResults: maxResult
        };

        const attrneeded = Utils.getAttrsBySectionFromConfig('mailboxes');

        if (attrneeded) {
            attrs.attrs = attrneeded;
        }

        if (domainName) {
            attrs.domain = domainName;
            this.domainName = domainName;
        }

        /*const attrsForLockOut = Object.assign({}, attrs);
        attrsForLockOut.query = 'zimbraAccountStatus=lockout';
        attrsForLockOut.limit = 10;
        attrsForLockOut.countOnly = true;

        promises.push(Client.getAllAccountsByBatch(attrsForLockOut));

        Client.batchRequest(promises, (exito) => {
            console.log('exito', exito);
        }, (err) => {
            console.log('error', err);
        });*/

        new Promise((resolve, reject) => {
            if (domainName) {
                const hasMailboxForDomain = MailboxStore.getMailboxByDomainId(this.domainId);

                if (hasMailboxForDomain) {
                    return resolve(hasMailboxForDomain);
                }

                return Client.getAllAccounts(attrs, (success) => {
                    const data = Utils.extractLockOuts(success);
                    MailboxStore.setMailboxesByDomain(this.domainId, data);

                    return resolve(success);
                }, (error) => {
                    return reject(error);
                });
            }

            if (MailboxStore.hasMailboxes()) {
                return resolve(MailboxStore.getMailboxes());
            }

            return Client.getAllAccounts(attrs, (success) => {
                const data = Utils.extractLockOuts(success);
                MailboxStore.setMailboxes(data);

                return resolve(data);
            }, (error) => {
                return reject(error);
            });
        }).then((data) => {
            if (data.account) {
                this.mailboxes = data;

                this.isRefreshing = false;

                const items = this.makeFilter() || this.mailboxes;

                //const tables = this.buildTableFromData(items, ['Todas', 'Bloqueadas']);
                const tables = this.buildTableFromData(items);

                if (items.lockout) {
                    GlobalActions.emitMessage({
                        error: `${items.lockout.length} casillas bloqueadas.`,
                        typeError: messageType.LOCKED
                    });
                }

                return this.setState({
                    data: tables,
                    loading: false
                });
            }

            return this.setState({
                notMatches: true,
                domain: domainName,
                loading: false
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
                return GlobalActions.emitEndLoading();
            }

            return GlobalActions.emitEndLoading();
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
        this.domainId = domainId;
        this.getAllMailboxes(domainId);
    }

    componentWillUnmount() {
        EventStore.removeMessageListener(this.showMessage);
        MailboxStore.removeListenerAddMassive(this.showMessage);
        $('#sidebar-mailboxes').removeClass('active');
        this.domainName = null;
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
                    url={this.props.location.pathname}
                    currentPage={this.state.page}
                    totalPages={hasPage.total}
                    total={hasPage.totalItems}
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

    //buildTableFromData(data, arrayTabNames) {
    buildTableFromData(data) {
        if (data.account) {
            const accounts = data.account;
            const totalAccounts = data.total;
            let limit = data.account.length;
            const hasPage = totalAccounts > Constants.QueryOptions.DEFAULT_LIMIT;
            let activeAccounts = [];

            //let lockedAccounts = [];
            //const tabs = {};
            let partialAccounts = accounts;

            //let partialLockOut = data.lockout ? data.lockout : 0;
            //const limitLockout = data.lockout ? data.lockout.length : 0;
            //const hasPageLockOut = limitLockout > Constants.QueryOptions.DEFAULT_LIMIT;

            if (hasPage) {
                partialAccounts = accounts.slice(this.state.offset, (this.state.page * Constants.QueryOptions.DEFAULT_LIMIT));
                limit = partialAccounts.length;
            }

            /*if (hasPageLockOut) {
                partialLockOut = partialLockOut.slice(this.state.offset, (this.state.page * Constants.QueryOptions.DEFAULT_LIMIT));
                partialLockOut = partialLockOut.map((lockout) => {
                    return this.buildRow(lockout, 'label label-locked m-r', 'Bloqueada');
                });
            }*/

            //const response = {};

            for (let i = 0; i < limit; i++) {
                const account = partialAccounts[i].attrs;
                switch (account.zimbraAccountStatus) {
                case 'active':
                    activeAccounts.push(this.buildRow(partialAccounts[i], 'label label-success m-r', 'Activa'));
                    break;
                case 'closed':
                    activeAccounts.push(this.buildRow(partialAccounts[i], 'label label-default m-r', 'Cerrada'));
                    break;
                case 'locked':
                    activeAccounts.push(this.buildRow(partialAccounts[i], 'label label-warning m-r', 'Inactiva'));
                    break;
                case 'lockout':
                    //lockedAccounts.push(this.buildRow(partialAccounts[i], 'label label-locked m-r', 'Bloqueada'));
                    activeAccounts.push(this.buildRow(partialAccounts[i], 'label label-locked m-r', 'Bloqueada'));
                    break;
                }
            }

            /*const all = `${arrayTabNames.shift()} (${totalAccounts})`;
            const locked = `${arrayTabNames.shift()} (${limitLockout})`;*/

            // create structure html for all accountsç
            let exportBtn = null;
            if (this.props.params.domain_id) {
                exportBtn = (
                    <button
                        onClick={(e) => {
                            this.handleExportAsCSV(e);
                        }}
                        className='btn btn-default'
                    >
                        <i className='fa fa-download'/>
                        <span>{'Exportar'}</span>
                    </button>
                );
            }

            const btn = [
                {
                    setComponent: exportBtn
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

            let activePagination = null;
            if (hasPage) {
                const totalPage = Math.ceil(totalAccounts / QueryOptions.DEFAULT_LIMIT);
                activePagination = {
                    total: totalPage,
                    totalItems: totalAccounts
                };
            }

            /*let lockedPagination = null;
            if (hasPageLockOut) {
                const totalPageLockOut = Math.ceil(limitLockout / QueryOptions.DEFAULT_LIMIT);
                lockedPagination = {
                    total: totalPageLockOut
                };
            }*/

            const status = Object.keys(this.optionStatus).map((item, i) => {
                return (
                    <option
                        key={`status-${i}`}
                        value={`${item}`}
                    >
                        {Utils.titleCase(this.optionStatus[item])}
                    </option>
                );
            });

            const plans = Object.keys(this.optionPlans).map((item, i) => {
                if (item.toLowerCase() === 'default') {
                    return false;
                }

                return (
                    <option
                        key={`plan-${i}`}
                        value={`${item}`}
                    >
                        {Utils.titleCase(this.optionPlans[item].label)}
                    </option>
                );
            });

            const filter = (
                <div>
                    <div className='input-group pull-left'>
                        <select
                            className='form-control status'
                            onChange={this.handleChangeFilter}
                            value={this.selectedStatusFilter}
                        >
                            <option value=''>Todas</option>
                            {status}
                        </select>
                    </div>

                    <div className='input-group'>
                        <select
                            className='form-control plans margin-left'
                            onChange={this.handleChangeFilter}
                            value={this.selectedPlan}
                        >
                            <option value=''>Todos los planes</option>
                            {plans}
                        </select>
                    </div>
                </div>
            );

            const tableActive = this.makeTable(activeAccounts, activePagination);
            const panelActive = this.insertToPanel(tableActive, 'panel-all', btn, filter);

            // create structure html for all locked accounts
            //const tableLocked = this.makeTable(partialLockOut, lockedPagination);
            //const panelLocked = this.insertToPanel(tableLocked, 'panel-locked');

            /*arrayTabNames.push(all, locked);
            tabs[Utils.slug(all)] = panelActive;
            tabs[Utils.slug(locked)] = panelLocked;
            response.tabNames = arrayTabNames;
            response.tabs = tabs;*/

            /*if (limitLockout > 0) {
                const isPlural = (limitLockout > 1) ? true : null;
                response.lockedAlert = {
                    total: lockedAccounts.length,
                    message: (isPlural) ? `${lockedAccounts.length} casillas bloqueadas` : `${lockedAccounts.length} casilla bloqueada`
                };
            }*/

            return panelActive;
        }

        return false;
    }

    render() {
        let message = null;
        let content = null;
        const data = this.state.data;

        if (this.state.loading) {
            content = (
                <div className='text-center'>
                    <i className='fa fa-spinner fa-spin fa-4x fa-fw'></i>
                    <p>{'Cargando Casillas...'}</p>
                </div>
            );
        }

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
            const domain = (this.domainName) ? `para el dominio: ${this.domainName}` : '';
            content = (
                <div className='text-center'>
                    <h4>
                        {`No se han encontrado resultados ${domain}`}
                    </h4>
                </div>
            );
        }

        let panelInfo = (
            <PageInfo
                titlePage='Casillas'
                descriptionPage='Usuarios de correo electrónico'
            />
        );

        if (this.domainId && data && this.domainName) {
            const domainName = this.domainName;
            panelInfo = (
                <PageInfo
                    titlePage='Casillas'
                    descriptionPage={`Usuarios de correo electrónico de ${domainName}`}
                />
            );
        }

        if (data) {
            /*content = (
                <PanelTab
                    tabNames={data.tabNames}
                    tabs={data.tabs}
                    location={this.props.location}
                    onClick={this.handleTabChanged}
                />
            );*/

            content = data;
        }

        return (
            <div>
                {panelInfo}
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
