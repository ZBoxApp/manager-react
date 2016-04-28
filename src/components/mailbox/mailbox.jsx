// Copyright (c) 2016 ZBox, Spa. All Rights Reserved.
// See LICENSE.txt for license information.

import $ from 'jquery';
import React from 'react';
import {browserHistory} from 'react-router';

import Button from '../button.jsx';
import MessageBar from '../message_bar.jsx';
import PageInfo from '../page_info.jsx';
import Panel from '../panel.jsx';
import PanelTab from '../panel_tab.jsx';
import Pagination from '../pagination.jsx';
import statusLabel from '../status_label.jsx';

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

        this.handleEdit = this.handleEdit.bind(this);
        this.getMailboxes = this.getMailboxes.bind(this);
        this.handleAddMailbox = this.handleAddMailbox.bind(this);
        this.handleExportAsCSV = this.handleExportAsCSV.bind(this);
        this.handleTabChanged = this.handleTabChanged.bind(this);
        this.handleWatchInfo = this.handleWatchInfo.bind(this);
        this.domainInfo = this.domainInfo.bind(this);

        const page = parseInt(this.props.location.query.page, 10) || 1;

        this.state = {
            page,
            offset: ((page - 1) * QueryOptions.DEFAULT_LIMIT)
        };
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

    handleWatchInfo(e, path, location) {
        Utils.handleLink(e, path, location);
    }

    getAccounts(domainName) {
        Client.getAllAccounts(
            {
                limit: QueryOptions.DEFAULT_LIMIT,
                offset: this.state.offset,
                domain: domainName
            },
            (data) => {
                this.setState({
                    data
                });
                GlobalActions.emitEndLoading();
            },
            (error) => {
                this.setState({
                    error: error.message
                });
                GlobalActions.emitEndLoading();
            }
        );
    }

    getMailboxes() {
        const domainId = this.props.params.domain_id;
        if (domainId) {
            return this.domainInfo(domainId).then(
                () => {
                    const domain = DomainStore.getCurrent();
                    this.getAccounts(domain.name);
                }
            );
        }

        return this.getAccounts();
    }

    handleAddMailbox(e, path) {
        e.preventDefault();
        if ((this.props.location.basename + this.props.location.pathname) !== path) {
            browserHistory.push(path);
            GlobalActions.emitStartLoading();
        }
    }

    handleExportAsCSV(e) {
        e.preventDefault();
    }

    handleTabChanged(tab) {
        browserHistory.push(this.props.location.pathname + '?tab=' + tab);
    }

    componentWillReceiveProps(newProps) {
        if (this.props.location.query.page !== newProps.location.query.page) {
            const page = parseInt(newProps.location.query.page, 10) || 1;

            GlobalActions.emitStartLoading();

            this.state = {
                page,
                offset: ((page - 1) * QueryOptions.DEFAULT_LIMIT)
            };

            this.getMailboxes();
        }
    }

    componentDidMount() {
        $('#sidebar-mailboxes').addClass('active');
        this.getMailboxes();
    }

    componentWillUnmount() {
        $('#sidebar-mailboxes').removeClass('active');
    }

    handleEdit(e, path) {
        e.preventDefault();
        if ((this.props.location.basename + this.props.location.pathname) !== path) {
            GlobalActions.emitStartLoading();
            browserHistory.push(path);
        }
    }

    render() {
        let message;
        let panelTabs;
        if (this.state.error) {
            message = (
                <MessageBar
                    message={this.state.error}
                    type={messageType.SUCCESS}
                    autoclose={true}
                />
            );
        }

        let tableResults;
        let total = 0;
        const arrLocked = [];

        if (this.state.data) {
            total = this.state.data.account.length;
            tableResults = this.state.data.account.map((mail) => {
                let attrs = mail.attrs;
                let statusClass = '';
                let status = attrs.zimbraAccountStatus;
                let id = mail.id;
                switch (status) {
                case 'locked':
                    statusClass = 'label label-warning';
                    status = 'Bloqueada';
                    arrLocked.push(mail);
                    break;
                default:
                    statusClass = 'label label-success';
                    status = 'Activa';
                    break;
                }

                return (
                    <tr
                        key={id}
                        className={'mailbox-row'}
                        id={id}
                    >
                        <td className={'mailbox-name'}>
                            <statusLabel className={statusClass}>{status}</statusLabel>
                            <Button
                                btnAttrs={{
                                    className: 'mailbox-link',
                                    onClick: (e) => {
                                        this.handleWatchInfo(e, `mailboxes/${mail.id}`, location);
                                    }
                                }}
                            >
                                {mail.name}
                            </Button>
                        </td>

                        <td className={'mailbox-displayname'}>
                            {mail.name}
                        </td>

                        <td className={'mailbox-cos-plan'}>
                            <statusLabel className={'label-plan label-unknown'}>unknown</statusLabel>
                        </td>

                        <td>
                            <Button
                                btnAttrs={
                                    {
                                        className: 'btn btn-xs btn-default',
                                        onClick: (e) => {
                                            this.handleEdit(e, '/mailboxes/' + mail.id + '/edit');
                                        }
                                    }
                                }
                            >
                                {'Editar'}
                            </Button>
                        </td>
                    </tr>
                );
            });

            const panelBody = (
                <div
                    key='mailboxes-body'
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
                        {tableResults}
                        </tbody>
                    </table>
                </div>
            );

            const todas = `Todas (${total})`;
            const archiving = 'Archiving';
            const noPlan = `Sin Plan (${total})`;
            const locked = `Bloqueada (${arrLocked.length})`;

            const arrTabNames = [
                todas,
                archiving,
                noPlan,
                locked
            ];

            let pagination;
            if (this.state.offset > 0 || (this.state.data && this.state.data.more)) {
                const totalPages = this.state.data ? Math.ceil(this.state.data.total / QueryOptions.DEFAULT_LIMIT) : 0;
                const tab = this.props.location.query.tab || Utils.slug(todas);
                pagination = (
                    <Pagination
                        key='panelPagination'
                        url={`mailboxes?tab=${tab}`}
                        currentPage={this.state.page}
                        totalPages={totalPages}
                    />
                );
            }

            const icon = (
                <div>
                    <i className='/fa fa-download'/>
                    <span>{'Exportar'}</span>
                </div>
            );

            const tab1 = (
                <div>
                    <Panel
                        title=''
                        children={[panelBody, pagination]}
                        btnsHeader={[
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
                                    onClick: (e) => {
                                        this.handleAddMailbox(e, '/mailboxes/new');
                                    }
                                },
                                label: '+ Nueva Casilla'
                            }
                        ]}
                    />
                </div>
            );

            const tab2 = (
                <Panel
                    title='Casillas tab2'
                    children={[panelBody, pagination]}
                />
            );

            const tab3 = (
                <Panel
                    title='Casillas tb3'
                    children={panelBody}
                />
            );

            const tab4 = (
                <Panel
                    title='Casillas tab4'
                    children={panelBody}
                />
            );

            const arrTabs = {};
            arrTabs[Utils.slug(todas)] = tab1;
            arrTabs[Utils.slug(archiving)] = tab2;
            arrTabs[Utils.slug(noPlan)] = tab3;
            arrTabs[Utils.slug(locked)] = tab4;

            panelTabs = (
                <PanelTab
                    tabNames={arrTabNames}
                    tabs={arrTabs}
                    location={this.props.location}
                    onClick={this.handleTabChanged}
                />
            );
        }

        const content = panelTabs || '';

        let title = 'Casillas';
        const domain = DomainStore.getCurrent();
        if (this.props.params.domain_id && domain) {
            title = (
                <div>
                    {'Casillas del dominio: '}
                    <a
                        href='#'
                        onClick={(e) => Utils.handleLink(e, `/domains/${domain.id}`)}
                    >
                        {`@${domain.name}`}
                    </a>
                </div>
            );
        }

        return (
            <div>
                <PageInfo
                    titlePage={title}
                    descriptionPage='Usuarios de correo electrónico'
                />

                {message}

                <div className='content animate-panel'>
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
