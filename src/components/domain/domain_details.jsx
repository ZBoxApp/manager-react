// Copyright (c) 2016 ZBox, Spa. All Rights Reserved.
// See LICENSE.txt for license information.

import $ from 'jquery';
import React from 'react';
import {browserHistory} from 'react-router';
import Promise from 'bluebird';

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
import UserStore from '../../stores/user_store.jsx';
import bytesConvertor from 'bytes';

import DomainStore from '../../stores/domain_store.jsx';

import * as Client from '../../utils/client.jsx';
import * as GlobalActions from '../../action_creators/global_actions.jsx';

import Constants from '../../utils/constants.jsx';
const QueryOptions = Constants.QueryOptions;

export default class DomainDetails extends React.Component {
    constructor(props) {
        super(props);

        this.isStoreEnabled = window.manager_config.enableStores;
        this.getDomain = this.getDomain.bind(this);
        this.showMessage = this.showMessage.bind(this);
        this.handleClickOnTab = this.handleClickOnTab.bind(this);
        this.slideLimitDomainAttach = this.slideLimitDomainAttach.bind(this);
        this.handleUpdatePreferences = this.handleUpdatePreferences.bind(this);

        this.isGlobalAdmin = UserStore.isGlobalAdmin();
        this.DomainAttachmentLimit = window.manager_config.maxAttachmentLimit;
        this.sizeOfAttatch = this.DomainAttachmentLimit.max;
        this.state = {};
    }

    handleClickOnTab(tab) {
        const path = this.props.location.pathname;
        browserHistory.push(`${path}?tab=${tab}`);
    }

    slideLimitDomainAttach(e) {
        const bytes = parseInt(e.target.value, 10);
        this.sizeOfAttatch = bytes;
        const sizeOfAttatch = bytesConvertor(bytes);
        this.refs.outputBytes.value = sizeOfAttatch;
        this.refs.amavisMessageSizeLimit.value = this.sizeOfAttatch;
    }

    handleUpdatePreferences(e) {
        e.preventDefault();
        const domain = {
            id: this.state.domain.id,
            attrs: {
                amavisMessageSizeLimit: this.refs.amavisMessageSizeLimit.value
            }
        };

        GlobalActions.emitStartLoading();

        new Promise((resolve, reject) => {
            Client.modifyDomain(
                domain,
                (data) => {
                    resolve(data);
                },
                (error) => {
                    reject(error);
                }
            );
        }).then((success) => {
            this.setState({
                domain: success
            });

            GlobalActions.emitMessage({
                message: 'Se han guardado sus preferencias con éxtio.',
                typeError: Constants.MessageType.SUCCESS
            });
        }).catch((error) => {
            GlobalActions.emitMessage({
                message: error.message,
                typeError: Constants.MessageType.ERROR
            });
        }).finally(() => {
            GlobalActions.emitEndLoading();
        });
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
        const domain = this.isStoreEnabled ? DomainStore.getCurrent() : null;
        const states = {};

        if (domain && domain.id === this.props.params.id) {
            states.domain = domain;

            this.sizeOfAttatch = domain.attrs.amavisMessageSizeLimit || this.DomainAttachmentLimit.max;

            GlobalActions.emitEndLoading();

            this.setState(states);

            Client.getZone(domain.name, (zone) => {
                states.zone = this.isStoreEnabled ? DomainStore.setZoneDNS(zone) : zone;

                this.setState(states);

                GlobalActions.emitEndLoading();
            }, () => {
                if (this.isStoreEnabled) {
                    DomainStore.setZoneDNS(null);
                }

                this.setState(states);

                GlobalActions.emitEndLoading();
            });
        } else {
            Client.getDomain(
                this.props.params.id,
                (data) => {
                    if (this.isStoreEnabled) {
                        DomainStore.setCurrent(data);
                    }
                    states.domain = data;

                    this.sizeOfAttatch = data.attrs.amavisMessageSizeLimit || this.DomainAttachmentLimit.max;

                    Client.getZone(data.name, (zone) => {
                        states.zone = this.isStoreEnabled ? DomainStore.setZoneDNS(zone) : zone;

                        this.setState(states);

                        GlobalActions.emitEndLoading();
                    }, () => {
                        this.setState(states);

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

    componentWillReceiveProps(nextProps) {
        const condition = nextProps.params.id !== this.props.params.id;

        if (condition) {
            this.props.params.id = nextProps.params.id;
            this.getDomain();
        }

        const isPaging = this.props.location.query.page !== nextProps.location.query.page;

        if (isPaging) {
            const page = parseInt(nextProps.location.query.page, 10) || 1;

            this.setState({
                page,
                offset: ((page - 1) * QueryOptions.DEFAULT_LIMIT)
            });
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
        let message = null;
        let classForCol = 'col-xs-6';
        let isVisible = 'show';
        let hasLayout = 'layout-back';
        let tabNames = [];
        let tabs = {};

        if (domain) {
            if (domain.isAliasDomain) {
                classForCol = 'col-xs-12';
                isVisible = 'hide';
            }

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

            const sizOfArratchment = this.sizeOfAttatch && typeof this.sizeOfAttatch === 'number' ? bytesConvertor(this.sizeOfAttatch, 10) : bytesConvertor(parseInt(this.sizeOfAttatch, 10));

            const tabPreferencesBtns = [
                <ToggleModalButton
                    role='button'
                    className='btn btn-info'
                    dialogType={MultipleTaskModal}
                    dialogProps={{
                                    data: domain
                                }}
                    key='change-passwd-import'
                >
                    {'Mensaje fuera de Oficina'}
                </ToggleModalButton>,
                <div
                    key='range-max-attachment'
                    className='row'
                >
                    <div className='col-xs-6'>
                        <div className='input-group'>
                            <div className='input-group-addon'>Tamaño Adjunto</div>
                                <input
                                    type='text'
                                    className='form-control'
                                    ref='outputBytes'
                                    readOnly='readOnly'
                                    value={sizOfArratchment}
                                />
                                <input
                                    type='hidden'
                                    ref='amavisMessageSizeLimit'
                                    value={this.sizeOfAttatch}
                                />
                        </div>
                    </div>

                    <div className='col-xs-6'>
                        <input
                            type='range'
                            className='range-size'
                            placeholder='Amount'
                            max={this.DomainAttachmentLimit.max}
                            min={this.DomainAttachmentLimit.min}
                            data-max={bytesConvertor(this.DomainAttachmentLimit.max)}
                            data-min={bytesConvertor(this.DomainAttachmentLimit.min)}
                            onChange={this.slideLimitDomainAttach}
                            step={this.DomainAttachmentLimit.step}
                            defaultValue={this.sizeOfAttatch}
                        />
                    </div>
                </div>
            ];

            const listsBtns = tabPreferencesBtns.map((btn, i) => {
                return (
                    <li
                        key={`preference-${i}`}
                        className='list-group-item'
                    >
                        {btn}
                    </li>
                );
            });

            const tabPreferences = (
                <div>
                    <div className='text-right'>
                        <button
                            className='btn btn-info'
                            onClick={this.handleUpdatePreferences}
                        >
                            Guardar Preferencias
                        </button>
                    </div>
                    <ul className='list-group clearfix set-margin-up'>
                        {listsBtns}
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
                    zone={this.state.zone}
                />
            );

            tabNames = ['Administradores', 'AntiSpam', 'Listas De Distribución', 'Preferencias', 'Zona DNS'];
            tabs = {
                administradores: tabAdmin,
                antispam: tabAntiSpam,
                listas_de_distribución: tabDistribution,
                preferencias: tabPreferences,
                zona_dns: zonaDNS
            };

            /*if (!this.isGlobalAdmin) {
                tabNames = ['Administradores', 'Listas De Distribución', 'Preferencias', 'Zona DNS'];
                tabs = {
                    administradores: tabAdmin,
                    listas_de_distribución: tabDistribution,
                    preferencias: tabPreferences,
                    zona_dns: zonaDNS
                };
            }*/

            if (domain.isAliasDomain) {
                tabNames = ['Zona DNS'];
                tabs = {
                    zona_dns: zonaDNS
                };
                hasLayout = '';
            }

            const panelTabs = (
                <PanelTab
                    tabNames={tabNames}
                    tabs={tabs}
                    location={this.props.location}
                    onClick={this.handleClickOnTab}
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
                            <div className={`${hasLayout} clearfix`}>
                                <div className={`back-left backstage ${isVisible}`}>
                                    <div className='backbg'></div>
                                </div>
                                <div className={`back-right backstage ${isVisible}`}>
                                    <div className='backbg'></div>
                                </div>
                                <div className={`${classForCol} central-content`}>
                                    <DomainGeneralInfo
                                        domain={domain}
                                        location={this.props.location}
                                        params={this.props.params}
                                    />
                                </div>
                                {!domain.isAliasDomain && (
                                    <div className={`${classForCol} central-content`}>
                                        <DomainMailboxPlans
                                            domain={domain}
                                            location={this.props.location}
                                            params={this.props.params}
                                        />
                                    </div>
                                )}
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
