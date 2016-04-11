// Copyright (c) 2016 ZBox, Spa. All Rights Reserved.
// See LICENSE.txt for license information.

import $ from 'jquery';
import React from 'react';

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

import * as Client from '../../utils/client.jsx';
import * as Utils from '../../utils/utils.jsx';
import * as GlobalActions from '../../action_creators/global_actions.jsx';
import Constants from '../../utils/constants.jsx';

export default class MailboxDetails extends React.Component {
    constructor(props) {
        super(props);

        this.getMailbox = this.getMailbox.bind(this);
        this.handleEdit = this.handleEdit.bind(this);
        this.showMessage = this.showMessage.bind(this);
        this.handleModifyAlias = this.handleModifyAlias.bind(this);

        this.state = {};
    }

    handleEdit(e, path, location) {
        Utils.handleLink(e, path, location);
    }

    handleModifyAlias(response) {
        const account = this.state.data;

        Utils.addOrRemoveAlias(account, response).then((handle) => {
            const errors = [];
            let flag = false;
            for (let i = 0; i < handle.length; i++) {
                if (!handle[i].hasOwnProperty('err')) {
                    flag = true;
                }

                if (handle[i].hasOwnProperty('err')) {
                    const action = (handle[i].action === 'add') ? 'Agregar' : 'Eliminar';
                    errors.push({
                        error: `No se ha podido ${action} el alias : ${handle[i].item}`,
                        type: Constants.MessageType.ERROR
                    });
                }
            }

            if (flag) {
                errors.push({
                    error: 'Se han realizado los cambios éxitosamente.',
                    type: Constants.MessageType.SUCCESS
                });
            }

            Client.getAccount(this.state.data.id, (data) => {
                const items = (typeof data.attrs.zimbraMailAlias == 'string') ? new Array(data.attrs.zimbraMailAlias) : data.attrs.zimbraMailAlias;
                this.setState({
                    alias: items
                });

                GlobalActions.emitMessage({
                    error: errors,
                    type: Constants.MessageType.ERROR
                });

                response.reset();
            }, (error) => {
                this.setState({
                    notFound: true,
                    message: error.message
                });
            });
        });
    }

    showMessage(attrs) {
        this.setState({
            error: attrs.error,
            type: attrs.type.toLowerCase()
        });
    }

    getMailbox() {
        const id = this.props.params.id;
        Utils.toggleStatusButtons('.action-info-btns', true);

        Client.getAccount(id, (data) => {
            let alias = (typeof data.attrs.zimbraMailAlias == 'string') ? new Array(data.attrs.zimbraMailAlias) : data.attrs.zimbraMailAlias;
            this.setState({
                data,
                alias: alias
            });

            GlobalActions.emitEndLoading();
            Utils.toggleStatusButtons('.action-info-btns', false);
        }, (error) => {
            this.setState({
                notFound: true,
                message: error.message
            });

            GlobalActions.emitEndLoading();
            Utils.toggleStatusButtons('.action-info-btns', false);
        });
    }

    componentDidMount() {
        EventStore.addMessageListener(this.showMessage);
        $('#sidebar-mailboxes').addClass('active');
        this.getMailbox();
    }

    componentWillUnmount() {
        EventStore.removeMessageListener(this.showMessage);
        $('#sidebar-mailboxes').removeClass('active');
    }

    render() {
        let generalData;
        let statsData;
        let btnsGeneralInfo = [];
        let btnsStats = [];
        let panelTabs;
        let message;

        if (this.state.error) {
            if (typeof this.state.error === 'object' && Array.isArray(this.state.error)) {
                message = this.state.error.map((err, i) => {
                    return (
                        <MessageBar
                            key={`new-error-${i}`}
                            message={err.error}
                            type={err.type.toLowerCase()}
                            autoclose={true}
                        />
                    );
                });
            } else {
                message = (
                    <MessageBar
                        message={this.state.error}
                        type={this.state.type.toLowerCase()}
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

            btnsStats = [
                {
                    props: {
                        className: 'btn btn-xs btn-default action-info-btns'
                    },
                    label: 'Ver Correos'
                }
            ];

            const formAutoResp = (
                <FormVacacionesMailbox data={this.state.data}/>
            );

            const formAlias = (
                <FormAliasMailbox
                    name={'alias'}
                    data={this.state.alias}
                    onApplyChanges={this.handleModifyAlias}
                    hasExport={true}
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
                {message}
                <div className='content animate-panel'>
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
