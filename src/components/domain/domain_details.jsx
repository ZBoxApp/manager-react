// Copyright (c) 2016 ZBox, Spa. All Rights Reserved.
// See LICENSE.txt for license information.

import $ from 'jquery';
import React from 'react';

import MessageBar from '../message_bar.jsx';
import PageInfo from '../page_info.jsx';
import PanelTab from '../panel_tab.jsx';

import Button from '../button.jsx';
import DomainGeneralInfo from './domain_general_info.jsx';
import DomainMailboxPlans from './domain_mailbox_plans.jsx';
import DomainAdmins from './domain_admin_list.jsx';
import DomainDistributionList from './domain_distribution_list.jsx';
import ToggleModalButton from '../toggle_modal_button.jsx';
import MultipleTaskModal from './multiple_task_modal.jsx';
import AntiSpamComponent from './antispam.jsx';

import DomainStore from '../../stores/domain_store.jsx';

import * as Client from '../../utils/client.jsx';
import * as GlobalActions from '../../action_creators/global_actions.jsx';

export default class DomainDetails extends React.Component {
    constructor(props) {
        super(props);

        this.getDomain = this.getDomain.bind(this);

        this.state = {};
    }

    getDomain() {
        const domain = DomainStore.getCurrent();

        if (domain && domain.id === this.props.params.id) {
            GlobalActions.emitEndLoading();
            this.setState({
                domain
            });
        } else {
            Client.getDomain(
                this.props.params.id,
                (data) => {
                    DomainStore.setCurrent(data);
                    this.setState({
                        domain: data
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
    }

    componentDidMount() {
        $('#sidebar-domains').addClass('active');
        this.getDomain();
    }

    componentWillUnmount() {
        $('#sidebar-domains').removeClass('active');
    }

    render() {
        const domain = this.state.domain;

        if (domain) {
            let message;
            if (this.state.error) {
                message = (
                    <MessageBar
                        message={this.state.error.message}
                        type={this.state.error.type}
                        autoclose={true}
                    />
                );
            }

            const tabAdmin = (
                <DomainAdmins
                    domain={domain}
                    location={this.props.location}
                />
            );

            const tabDistribution = (
                <DomainDistributionList
                    domain={domain}
                    location={this.props.location}
                />
            );

            const tabTareasMasivas = (
                <div>
                    <ul className='list-inline'>
                        <li>
                            <ToggleModalButton
                                role='button'
                                className=''
                                dialogType={MultipleTaskModal}
                                dialogProps={{
                                    data: domain
                                }}
                                key='change-passwd-import'
                            >
                                {'Mensaje fuera de Oficina'}
                            </ToggleModalButton>
                        </li>
                    </ul>
                </div>
            );

            const tabAntiSpam = (
                <div>
                    <AntiSpamComponent
                        data={this.state.domain}
                    />
                </div>
            );

            const panelTabs = (
                <PanelTab
                    tabNames={['Administradores', 'AntiSpam', 'Listas De Distribución', 'Tareas Masivas']}
                    tabs={{
                        administradores: tabAdmin,
                        antispam: tabAntiSpam,
                        listas_de_distribución: tabDistribution,
                        tareas_masivas: tabTareasMasivas
                    }}
                    location={this.props.location}
                />
            );

            return (
                <div>
                    <PageInfo
                        titlePage='Dominios'
                        descriptionPage='Dominios de correos creados'
                    />
                    {message}
                    <div className='content animate-panel'>
                        <div className='row'>
                            <div className='layout-back clearfix'>
                                <div className='back-left backstage'>
                                    <div className='backbg'></div>
                                </div>
                                <div className='back-right backstage'>
                                    <div className='backbg'></div>
                                </div>
                                <div className='col-md-6 central-content'>
                                    <DomainGeneralInfo
                                        domain={domain}
                                        location={this.props.location}
                                        params={this.props.params}
                                    />
                                </div>
                                <div className='col-md-6 central-content'>
                                    <DomainMailboxPlans
                                        domain={domain}
                                        location={this.props.location}
                                        params={this.props.params}
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

        return <div/>;
    }
}

DomainDetails.propTypes = {
    location: React.PropTypes.object.isRequired,
    params: React.PropTypes.object.isRequired
};
