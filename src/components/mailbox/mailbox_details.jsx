// Copyright (c) 2016 ZBox, Spa. All Rights Reserved.
// See LICENSE.txt for license information.

import $ from 'jquery';
import React from 'react';

import PageInfo from '../page_info.jsx';
import PanelTab from '../panel_tab.jsx';
import Panel from '../panel.jsx';
import BlockGeneralInfoMailbox from './info_general_mailbox.jsx';
import BlockStatsMailbox from './stats_mailbox.jsx';
import FormVacacionesMailbox from './form_resp_vacaciones_mailbox.jsx';
import FormAliasMailbox from './form_alias_mailbox.jsx';
import ChangePasswordModal from './change_passwd_modal.jsx';
import ToggleModalButton from '../toggle_modal_button.jsx';

import * as Client from '../../utils/client.jsx';
import * as Utils from '../../utils/utils.jsx';
import * as GlobalActions from '../../action_creators/global_actions.jsx';

export default class MailboxDetails extends React.Component {
    constructor(props) {
        super(props);

        this.getMailbox = this.getMailbox.bind(this);
        this.handleEdit = this.handleEdit.bind(this);

        this.state = {};
    }

    handleEdit(e, path, location) {
        Utils.handleLink(e, path, location);
    }

    getMailbox() {
        const id = this.props.params.id;
        Utils.toggleStatusButtons('.action-info-btns', true);

        Client.getAccount(id, (data) => {
            this.setState({
                data
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
        $('#sidebar-mailboxes').addClass('active');
        this.getMailbox();
    }

    componentWillUnmount() {
        $('#sidebar-mailboxes').removeClass('active');
    }

    render() {
        let generalData;
        let statsData;
        let btnsGeneralInfo = [];
        let btnsStats = [];

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

        const formAutoResp = (
            <FormVacacionesMailbox/>
        );

        const formAlias = (
            <FormAliasMailbox/>
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
                children={formAlias}
            />
        );

        const panelTabs = (
            <PanelTab
                tabNames={['Resp Vacaciones', 'Alias']}
                tabs={{
                    resp_vacaciones: tabAdmin,
                    alias: tab2
                }}
                location={this.props.location}
            />
        );

        return (
            <div>
                {pageInfo}
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