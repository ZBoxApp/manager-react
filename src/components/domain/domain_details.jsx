// Copyright (c) 2016 ZBox, Spa. All Rights Reserved.
// See LICENSE.txt for license information.

import $ from 'jquery';
import React from 'react';

import MessageBar from '../message_bar.jsx';
import PageInfo from '../page_info.jsx';
import PanelTab from '../panel_tab.jsx';

import DomainGeneralInfo from './domain_general_info.jsx';
import DomainMailboxPlans from './domain_mailbox_plans.jsx';
import DomainAdmins from './domain_admin_list.jsx';
import DomainDistributionList from './domain_distribution_list.jsx';
import ToggleModalButton from '../toggle_modal_button.jsx';
import MultipleTaskModal from './multiple_task_modal.jsx';
import AntiSpamComponent from './antispam.jsx';
import ZonaDNS from './domain_admin_dns.jsx';
import EventStore from '../../stores/event_store.jsx';

import DomainStore from '../../stores/domain_store.jsx';

import * as Client from '../../utils/client.jsx';
import * as GlobalActions from '../../action_creators/global_actions.jsx';

//import Constants from '../../utils/constants.jsx';

export default class DomainDetails extends React.Component {
    constructor(props) {
        super(props);

        this.getDomain = this.getDomain.bind(this);
        this.showMessage = this.showMessage.bind(this);

        this.state = {};
    }

    showMessage(attrs) {
        this.setState({
            error: {
                message: attrs.message,
                type: attrs.typeError
            }
        });
    }

    getDomain() {
        const domain = DomainStore.getCurrent();

        if (domain && domain.id === this.props.params.id) {
            GlobalActions.emitEndLoading();
            this.setState({
                domain
            });
            Client.getZone(domain.name, (zone) => {
                DomainStore.setZoneDNS(zone);

                this.setState({
                    domain
                });

                GlobalActions.emitEndLoading();
            }, () => {
                DomainStore.setZoneDNS(null);

                this.setState({
                    domain
                });

                GlobalActions.emitEndLoading();
            });
        } else {
            Client.getDomain(
                this.props.params.id,
                (data) => {
                    DomainStore.setCurrent(data);

                    Client.getZone(data.name, (zone) => {
                        DomainStore.setZoneDNS(zone);

                        this.setState({
                            domain: data
                        });

                        GlobalActions.emitEndLoading();
                    }, () => {
                        this.setState({
                            domain: data
                        });

                        GlobalActions.emitEndLoading();
                    });
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
        EventStore.addMessageListener(this.showMessage);
        $('#sidebar-domains').addClass('active');
        this.getDomain();
    }

    componentWillUnmount() {
        $('#sidebar-domains').removeClass('active');
        EventStore.removeMessageListener(this.showMessage);
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

            const zonaDNS = (
                <ZonaDNS
                    domain={domain}
                    location={this.props.location}
                />
            );

            const panelTabs = (
                <PanelTab
                    tabNames={['Administradores', 'AntiSpam', 'Listas De Distribución', 'Tareas Masivas', 'Zona DNS']}
                    tabs={{
                        administradores: tabAdmin,
                        antispam: tabAntiSpam,
                        listas_de_distribución: tabDistribution,
                        tareas_masivas: tabTareasMasivas,
                        zona_dns: zonaDNS
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
