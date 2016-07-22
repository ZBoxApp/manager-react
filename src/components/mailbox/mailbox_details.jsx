// Copyright (c) 2016 ZBox, Spa. All Rights Reserved.
// See LICENSE.txt for license information.

import $ from 'jquery';
import React from 'react';
import {browserHistory} from 'react-router';

import EventStore from '../../stores/event_store.jsx';

import PageInfo from '../page_info.jsx';
import PanelTab from '../panel_tab.jsx';
import Panel from '../panel.jsx';
import BlockGeneralInfoMailbox from './info_general_mailbox.jsx';
import BlockStatsMailbox from './stats_mailbox.jsx';
import FormVacacionesMailbox from './form_resp_vacaciones_mailbox.jsx';
import FormAliasMailbox from './../panel_actions.jsx';
import ChangePasswordModal from './change_passwd_modal.jsx';
import ToggleModalButton from '../toggle_modal_button.jsx';
import MessageBar from '../message_bar.jsx';
import Promise from 'bluebird';
import MailboxStore from '../../stores/mailbox_store.jsx';
import ResendForm from './reenvios_form.jsx';

import * as Client from '../../utils/client.jsx';
import * as Utils from '../../utils/utils.jsx';
import * as GlobalActions from '../../action_creators/global_actions.jsx';
import Constants from '../../utils/constants.jsx';

const MessageTypes = Constants.MessageType;

export default class MailboxDetails extends React.Component {
    constructor(props) {
        super(props);

        this.isStoreEnabled = window.manager_config.enableStores;
        this.getMailbox = this.getMailbox.bind(this);
        this.handleEdit = this.handleEdit.bind(this);
        this.showMessage = this.showMessage.bind(this);
        this.onRemoveAlias = this.onRemoveAlias.bind(this);
        this.onCancelAlias = this.onCancelAlias.bind(this);
        this.setDomainId = this.setDomainId.bind(this);

        this.domain_id = this.props.params.domain_id || null;
        this.mailboxId = this.props.params.id || null;

        this.editUrlFromParams = this.domain_id ? `/domains/${this.domain_id}/mailboxes/${this.mailboxId}` : `/mailboxes/${this.mailboxId}`;
        this.editUrlFromParams += '/edit';

        this.state = {};
    }

    setDomainId(domainId) {
        if (!this.domain_id) {
            this.domain_id = domainId;
        }
    }

    handleEdit(e, path, location) {
        Utils.handleLink(e, path, location);
    }

    exportAsCSV(data) {
        Utils.exportAsCSV(data, 'mailboxes_alias', true);
    }

    showMessage(attrs) {
        this.setState({
            error: attrs.error,
            type: attrs.typeError
        });

        if (attrs.logout) {
            setTimeout(() => {
                browserHistory.push('/logout');
            }, 3000);
        }
    }

    onRemoveAlias(alias) {
        const allAlias = this.state.alias.filter((item) => {
            return alias !== item;
        });

        allAlias.sort(Utils.sortByNames);

        this.setState({
            alias: allAlias,
            error: false
        });
    }

    onCancelAlias(arrAlias) {
        const {alias} = this.state;

        alias.push(...arrAlias);
        alias.sort(Utils.sortByNames);

        this.setState({
            alias,
            error: false
        });
    }

    getMailbox(id) {
        return new Promise((resolve, reject) => {
            // get mailbox from store if it exists
            const hasMailboxes = this.isStoreEnabled ? MailboxStore.hasMailboxes() : null;

            if (hasMailboxes) {
                const account = MailboxStore.getMailboxById(id) || MailboxStore.getMailboxByIdInDomain(id, this.domain_id);
                return resolve(account);
            }

            //if is not into store just search it.
            return Client.getAccount(id, (data) => {
                return resolve(data);
            }, (error) => {
                return reject(error);
            });
        }).then((mailbox) => {
            MailboxStore.setCurrent(mailbox);
            let items = mailbox.attrs.zimbraMailAlias || [];

            if (items) {
                if (!Array.isArray(items)) {
                    items = [items];
                }

                items.sort(Utils.sortByNames);
            }

            mailbox.viewMailPath(global.window.manager_config.webmailLifetime, (error, res) => {
                if (res) {
                    return this.setState({
                        data: mailbox,
                        alias: items,
                        webmail: `${global.window.manager_config.webMailUrl}${res}`
                    });
                }

                return this.setState({
                    data: mailbox,
                    alias: items,
                    webmail: false
                });
            });
        }).catch((error) => {
            GlobalActions.emitMessage({
                error: error.message,
                type: error.typeError
            });
        }).finally(() => {
            GlobalActions.emitEndLoading();
            Utils.toggleStatusButtons('.action-info-btns', false);
        });
    }

    componentDidMount() {
        EventStore.addMessageListener(this.showMessage);
        MailboxStore.addListenerSendDomainId(this.setDomainId);
        $('#sidebar-mailboxes').addClass('active');
        this.getMailbox(this.mailboxId);
    }

    componentWillUnmount() {
        EventStore.removeMessageListener(this.showMessage);
        MailboxStore.removeListenerSendDomainId(this.setDomainId);
        $('#sidebar-mailboxes').removeClass('active');
    }

    onAliasSubmit(response) {
        return new Promise((resolve) => {
            return Utils.makeRequest(response, this.state.data, resolve, false);
        }).then((data) => {
            const errors = [];
            const {alias} = this.state;
            const mailbox = this.state.data;

            if (data.error) {
                data.error.forEach((err) => {
                    errors.push({
                        error: `Hubo un error al ${err.action} ${err.target}, debido a : ${err.extra.reason}`,
                        type: MessageTypes.ERROR
                    });
                });
            }

            if (data.completed) {
                errors.push({
                    error: 'Se han guardado los datos éxitosamente.',
                    type: MessageTypes.SUCCESS
                });

                data.completed.forEach((obj) => {
                    if (obj.isNew) {
                        alias.push(obj.target);
                    }
                });

                alias.sort(Utils.sortByNames);
            }

            if (this.isStoreEnabled) {
                mailbox.attrs.zimbraMailAlias = alias;
                MailboxStore.updateMailbox(this.mailboxId, mailbox, this.domain_id);
            }

            return this.setState({
                error: errors.length > 0 ? errors : null,
                alias
            });
        }).finally(() => {
            response.reset();
        });
    }

    render() {
        let generalData;
        let statsData;
        let btnsGeneralInfo = [];
        let btnsStats = [];
        let panelTabs;
        let message;

        if (this.state.error) {
            if (Array.isArray(this.state.error)) {
                message = this.state.error.map((err, i) => {
                    return (
                        <MessageBar
                            key={`new-error-${i}`}
                            message={err.error}
                            type={err.type}
                            autoclose={true}
                        />
                    );
                });
            } else {
                message = (
                    <MessageBar
                        message={this.state.error}
                        type={this.state.type}
                        autoclose={true}
                    />
                );
            }
        }

        if (this.state.data) {
            const webmail = this.state.webmail || null;
            generalData = (
                <BlockGeneralInfoMailbox
                    data={this.state.data}
                    webmail={webmail}
                    location={this.props.location}
                />
            );

            statsData = (
                <BlockStatsMailbox
                    data={this.state.data}
                />
            );

            btnsGeneralInfo = [
                {
                    props: {
                        className: 'btn btn-xs btn-default action-info-btns',
                        onClick: (e) => {
                            this.handleEdit(e, this.editUrlFromParams, this.props.location);
                        }
                    },
                    label: 'Editar'
                },
                {
                    setComponent: (
                        <ToggleModalButton
                            role='button'
                            className='btn btn-xs btn-danger action-info-btns'
                            dialogType={ChangePasswordModal}
                            dialogProps={{
                                data: this.state.data
                            }}
                            key='change-passwd-mailbox'
                        >
                            {'Cambiar Contraseña'}
                        </ToggleModalButton>
                    )
                }
            ];

            if (this.state.webmail) {
                btnsStats = [
                    {
                        props: {
                            className: 'btn btn-xs btn-default action-info-btns',
                            target: '_blank',
                            href: this.state.webmail
                        },
                        label: 'Ver Correos'
                    }
                ];
            } else {
                btnsStats = [
                    {
                        props: {
                            className: 'btn btn-xs btn-default disabled',
                            title: 'Hubo un error al obtener el acceso al mail',
                            disabled: 'disabled'
                        },
                        label: 'Ver Correos'
                    }
                ];
            }

            const formAutoResp = (
                <FormVacacionesMailbox
                    data={this.state.data}
                    domainId={this.domain_id}
                />
            );

            const formAlias = (
                <FormAliasMailbox
                    name={'alias'}
                    data={this.state.alias}
                    isEmail={true}
                    onDelete={(alias) => {
                        this.onRemoveAlias(alias);
                    }}
                    onCancel={(arrAlias) => {
                        this.onCancelAlias(arrAlias);
                    }}
                    onApplyChanges={(response) => {
                        this.onAliasSubmit(response);
                    }}
                    nameFunc={'AccountAlias'}
                />
            );

            const tabAdmin = (
                <Panel
                    hasHeader={false}
                    children={formAutoResp}
                />
            );

            const tabAlias = (
                <Panel
                    title='Casillas'
                    hasHeader={false}
                    classHeader={'reset-panel'}
                    children={formAlias}
                />
            );

            const reenvios = (
                <ResendForm mailbox={this.state.data}/>
            );

            panelTabs = (
                <PanelTab
                    tabNames={['Resp Vacaciones', 'Alias', 'Reenvios']}
                    tabs={{
                        resp_vacaciones: tabAdmin,
                        alias: tabAlias,
                        reenvios
                    }}
                    location={this.props.location}
                />
            );
        }

        const pageInfo = (
            <PageInfo
                titlePage='Casillas'
                descriptionPage='Usuarios de correo electrónico.'
            />
        );

        if (this.state.notFound) {
            return (
                <div>
                    {pageInfo}
                    <div className='block-center text-center'>
                        <h3>{this.state.message}</h3>
                    </div>
                </div>
            );
        }

        return (
            <div>
                {pageInfo}
                <div className='content animate-panel'>
                    {message}
                    <div className='row'>
                        <div className='layout-back clearfix'>
                            <div className='back-left backstage'>
                                <div className='backbg'></div>
                            </div>
                            <div className='back-right backstage'>
                                <div className='backbg'></div>
                            </div>

                            <div className='col-md-6 central-content'>
                                <Panel
                                    title='Información General'
                                    btnsHeader={btnsGeneralInfo}
                                    children={generalData}
                                    classHeader='with-min-height'
                                />
                            </div>
                            <div className='col-md-6 central-content'>
                                <Panel
                                    title='Estadísticas'
                                    btnsHeader={btnsStats}
                                    children={statsData}
                                    classHeader='with-min-height'
                                />
                            </div>
                        </div>
                    </div>
                    <div className='row'>
                        <div className='col-md-12 panel-with-tabs'>
                            {panelTabs}
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}

MailboxDetails.propTypes = {
    location: React.PropTypes.object,
    params: React.PropTypes.object
};
