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

import * as Client from '../../utils/client.jsx';
import * as Utils from '../../utils/utils.jsx';
import * as GlobalActions from '../../action_creators/global_actions.jsx';
import Constants from '../../utils/constants.jsx';

const MessageTypes = Constants.MessageType;

export default class MailboxDetails extends React.Component {
    constructor(props) {
        super(props);

        this.getMailbox = this.getMailbox.bind(this);
        this.handleEdit = this.handleEdit.bind(this);
        this.showMessage = this.showMessage.bind(this);
        this.onRemoveAlias = this.onRemoveAlias.bind(this);
        this.onCancelAlias = this.onCancelAlias.bind(this);

        this.state = {};
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
        MailboxStore.removeAlias(alias);

        const items = MailboxStore.getAlias();

        this.setState({
            alias: items,
            error: false
        });
    }

    onCancelAlias(arrAlias) {
        MailboxStore.refreshAlias(arrAlias);

        const items = MailboxStore.getAlias();

        this.setState({
            alias: items,
            error: false
        });
    }

    getMailbox(id) {
        if (MailboxStore.hasMailboxes()) {
            const account = MailboxStore.getMailboxById(id);
            MailboxStore.setCurrent(account);
            let items = account.attrs.zimbraMailAlias;

            if (items) {
                if (!Array.isArray(items)) {
                    items = [items];
                }
            }

            account.viewMailPath(global.window.manager_config.webmailLifetime, (error, res) => {
                if (res) {
                    return this.setState({
                        data: account,
                        alias: items,
                        webmail: `${global.window.manager_config.webMailUrl}${res}`
                    });
                }

                return this.setState({
                    data: account,
                    alias: items,
                    webmail: false
                });
            });

            GlobalActions.emitEndLoading();
            Utils.toggleStatusButtons('.action-info-btns', false);
        } else {
            return new Promise((resolve, reject) => {
                Client.getAccount(id, (data) => {
                    return resolve(data);
                }, (error) => {
                    return reject(error);
                });
            }).then((result) => {
                MailboxStore.setCurrent(result);
                let items = result.attrs.zimbraMailAlias;

                if (items) {
                    if (!Array.isArray(items)) {
                        items = [items];
                    }
                }

                result.viewMailPath(global.window.manager_config.webmailLifetime, (error, res) => {
                    if (res) {
                        return this.setState({
                            data: result,
                            alias: items,
                            webmail: `${global.window.manager_config.webMailUrl}${res}`
                        });
                    }

                    return this.setState({
                        data: result,
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

        return true;
    }

    componentDidMount() {
        EventStore.addMessageListener(this.showMessage);
        $('#sidebar-mailboxes').addClass('active');
        this.getMailbox(this.props.params.id);
    }

    componentWillUnmount() {
        EventStore.removeMessageListener(this.showMessage);
        $('#sidebar-mailboxes').removeClass('active');
    }

    onAliasSubmit(response) {
        if (response.refresh) {
            MailboxStore.refreshAlias(response.refresh);
        }

        this.multipleActions(response, this.state.data).then((result) => {
            const limit = result.length;
            const errors = [];
            for (let index = 0; index < limit; index++) {
                const res = result[index];
                if (result[index].error) {
                    const action = (res.action === 'remove') ? 'eliminar' : 'agregar';
                    errors.push({
                        error: `Hubo un error al ${action} el alias: ${res.item}, debido a ${res.error.extra.reason}`,
                        type: MessageTypes.ERROR
                    });
                }

                if (res.isCompleted && res.action === 'add') {
                    MailboxStore.setAlias(res.item);
                }
            }

            if (errors.length !== limit) {
                errors.push({
                    error: 'Se han guardado los datos éxitosamente.',
                    type: MessageTypes.SUCCESS
                });
            }

            this.setState({
                error: errors,
                alias: MailboxStore.getAlias()
            });

            response.reset();
        });
    }

    multipleActions(response, account) {
        const promises = [];

        for (const key in response) {
            if (response.hasOwnProperty(key) && key === 'add') {
                const array = response[key];
                const limit = array.length;

                for (let index = 0; index < limit; index++) {
                    const res = {};
                    const promesa = new Promise((resolve) => {
                        account.addAccountAlias(array[index], (error) => {
                            if (error) {
                                res.isCompleted = false;
                                res.item = response[key][index];
                                res.action = key;
                                res.error = error;
                            } else {
                                res.isCompleted = true;
                                res.item = response[key][index];
                                res.action = key;
                            }

                            return resolve(res);
                        });
                    });

                    promises.push(promesa);
                }
            }

            if (response.hasOwnProperty(key) && key === 'remove') {
                const array = response[key];
                const limit = array.length;

                for (let index = 0; index < limit; index++) {
                    const res = {};
                    const promesa = new Promise((resolve) => {
                        account.removeAccountAlias(array[index], (error) => {
                            if (error) {
                                res.isCompleted = false;
                                res.item = response[key][index];
                                res.action = key;
                                res.error = error;
                            } else {
                                res.isCompleted = true;
                                res.item = response[key][index];
                                res.action = key;
                            }

                            return resolve(res);
                        });
                    });

                    promises.push(promesa);
                }
            }
        }

        return Promise.all(promises);
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
            generalData = (
                <BlockGeneralInfoMailbox
                    data={this.state.data}
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
                            this.handleEdit(e, `mailboxes/${this.state.data.id}/edit`, this.props.location);
                        }
                    },
                    label: 'Editar'
                },
                {
                    setComponent: (
                        <ToggleModalButton
                            role='button'
                            className='btn btn-xs btn-default action-info-btns'
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
                <FormVacacionesMailbox data={this.state.data}/>
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
                />
            );

            const tabAdmin = (
                <Panel
                    hasHeader={false}
                    children={formAutoResp}
                />
            );

            const tab2 = (
                <Panel
                    title='Casillas'
                    hasHeader={false}
                    classHeader={'reset-panel'}
                    children={formAlias}
                />
            );

            panelTabs = (
                <PanelTab
                    tabNames={['Resp Vacaciones', 'Alias']}
                    tabs={{
                        resp_vacaciones: tabAdmin,
                        alias: tab2
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
