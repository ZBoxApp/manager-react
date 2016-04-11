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

import DomainStore from '../../stores/domain_store.jsx';

const QueryOptions = Constants.QueryOptions;
const messageType = Constants.MessageType;

export default class Mailboxes extends React.Component {
    constructor(props) {
        super(props);

        this.showMessage = this.showMessage.bind(this);
        const page = parseInt(this.props.location.query.page, 10) || 1;

        this.state = {
            page,
            offset: ((page - 1) * QueryOptions.DEFAULT_LIMIT)
        };
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
        if (condition) {
            const page = parseInt(newProps.location.query.page, 10) || 1;

            GlobalActions.emitStartLoading();

            this.state = {
                page,
                offset: ((page - 1) * QueryOptions.DEFAULT_LIMIT)
            };

            this.getAllMailboxes();
        } else {
            GlobalActions.emitStartLoading();
            let domainId;
            if (newProps.params.domain_id !== this.props.params.domain_id) {
                domainId = newProps.params.domain_id;
            }
            this.getAllMailboxes(domainId);
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

    getAccounts(domainName) {
        const attrs = {};
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

            if (MailboxStore.hasMailboxes()) {
                resolve(MailboxStore.getMailboxes());
            }

            return Client.getAllAccounts(attrs, (success) => {
                MailboxStore.setMailboxes(success);
                return resolve(success);
            }, (error) => {
                return reject(error);
            });
        }).then((data) => {
            if (data.account) {
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
                domainNotFound: domainName
            });
        }).catch(() => {
            //console.log(error);
        }).finally(() => {
            GlobalActions.emitEndLoading();
        });
    }

    getAllMailboxes(domainId) {
        if (domainId) {
            return this.domainInfo(domainId).then(() => {
                const domain = DomainStore.getCurrent();
                this.getAccounts(domain.name);
            });
        }

        return this.getAccounts();
    }

    componentDidMount() {
        $('#sidebar-mailboxes').addClass('active');
        EventStore.addMessageListener(this.showMessage);
        const domainId = this.props.params.domain_id;
        this.getAllMailboxes(domainId);
    }

    componentWillUnmount() {
        EventStore.removeMessageListener(this.showMessage);
        $('#sidebar-mailboxes').removeClass('active');
    }

    buildRow(row, classes, status) {
        const id = row.id;
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
                    {row.name}
                </td>

                <td className={'mailbox-cos-plan'}>
                    <statusLabel className={'label-plan label-unknown'}>{'unknown'}</statusLabel>
                </td>

                <td>
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
                        <th className='text-center text-center'>{'Tipo'}</th>
                        <th className='text-center text-center'>{'Acciones'}</th>
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

    insertToPanel(table, id, btns) {
        const btn = btns || [];

        return (
            <Panel
                children={table}
                key={id}
                btnsHeader={btn}
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
            const all = `${arrayTabNames.shift()} (${activeAccounts.length})`;
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
                    props: {
                        className: 'btn btn-success',
                        onClick: (e) => Utils.handleLink(e, '/mailboxes/new')
                    },
                    label: '+ Nueva Casilla'
                }
            ];

            let activePagination = null;
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

            const tableActive = this.makeTable(activeAccounts, activePagination);
            const panelActive = this.insertToPanel(tableActive, 'panel-all', btn);

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

        if (this.state.error) {
            message = (
                <MessageBar
                    message={this.state.error}
                    type={this.state.type}
                    autoclose={false}
                />
            );
        }

        let content = (
            <div className='text-center'>
                <h4>
                    No se han encontrado casillas para el dominio : {this.state.domainNotFound}
                </h4>
            </div>
        );
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
