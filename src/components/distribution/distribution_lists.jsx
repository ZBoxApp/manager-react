// Copyright (c) 2016 ZBox, Spa. All Rights Reserved.
// See LICENSE.txt for license information.

import $ from 'jquery';
import React from 'react';
import PropTypes from 'prop-types';

import EventStore from '../../stores/event_store.jsx';

import PageInfo from '../page_info.jsx';
import PanelTab from '../panel_tab.jsx';
import Button from '../button.jsx';
import Panel from '../panel.jsx';
import ActionsPanel from '../panel_actions.jsx';
import ActionsPanelAllows from '../panel_actions_allows.jsx';
import MessageBar from '../message_bar.jsx';
import Promise from 'bluebird';

import * as Client from '../../utils/client.jsx';
import * as Utils from '../../utils/utils.jsx';
import * as GlobalActions from '../../action_creators/global_actions.jsx';
import DomainStore from '../../stores/domain_store.jsx';
import UserStore from '../../stores/user_store.jsx';
import Constants from '../../utils/constants.jsx';

const MessagesType = Constants.MessageType;

export default class DistributionLists extends React.Component {
    constructor(props) {
        super(props);

        this.isStoreEnabled = window.manager_config.enableStores;
        this.getDistributionLists = this.getDistributionLists.bind(this);
        this.showMessage = this.showMessage.bind(this);
        this.onDeleteMember = this.onDeleteMember.bind(this);
        this.onDeleteOwner = this.onDeleteOwner.bind(this);
        this.onCancelMember = this.onCancelMember.bind(this);
        this.onCancelOwner = this.onCancelOwner.bind(this);
        this.onExportMembers = this.onExportMembers.bind(this);
        this.onExportAllowers = this.onExportAllowers.bind(this);
        this.domain = null;
        this.isGlobalAdmin = UserStore.isGlobalAdmin();

        this.state = {};
    }

    showMessage(attrs) {
        const autoTimer = 10;
        this.setState({
            error: attrs.error,
            type: attrs.typeError,
            autocloseInSecs: autoTimer
        });
    }

    onExportMembers(data) {
        const title = `Miembros de la lista de distribución '${this.state.distributionsList.name}' de ${this.state.domain.name}`;
        Utils.exportAsCSV(data, 'members', title, true);
    }

    onExportAllowers(data) {
        const title = `Permitidos de la lista de distribución '${this.state.distributionsList.name}' de ${this.state.domain.name}`;
        Utils.exportAsCSV(data, 'allowers', title, true);
    }

    getDistributionLists() {
        const domain = this.isStoreEnabled ? DomainStore.getCurrent() : null;
        const id = this.props.params.id;
        const response = {};

        return new Promise((resolve, reject) => {
            if (domain) {
                response.domain = domain;
                const dl = this.isStoreEnabled ? DomainStore.getDistributionListById(id, domain) : null;
                response.distributionsList = dl;

                dl.getOwners((error, owners) => {
                    if (owners) {
                        response.owners = owners;
                        return resolve(response);
                    }

                    return reject(error);
                });
            }

            return Client.getDistributionList(id, (success) => {
                const distributionsList = success;
                response.distributionsList = distributionsList;
                const domainId = this.props.params.domain_id === 'null' ? distributionsList.name.split('@').pop() : this.props.params.domain_id;

                distributionsList.getOwners((error, owners) => {
                    if (owners) {
                        response.owners = owners;
                        Client.getDomain(domainId, (doma) => {
                            response.domain = doma;
                            resolve(response);
                        }, (err) => {
                            reject(err);
                        });
                    }
                });
            }, (error) => {
                reject(error);
            });
        }).then((data) => {
            if (this.isStoreEnabled) {
                DomainStore.setOwners(data.owners);
                DomainStore.setMembers(data.distributionsList.members);
            }

            return this.setState({
                distributionsList: data.distributionsList,
                members: this.isStoreEnabled ? DomainStore.getMembers() : data.distributionsList.members,
                owners: this.isStoreEnabled ? DomainStore.getOwners() : data.owners,
                domain: data.domain
            });
        }).catch((error) => {
            GlobalActions.emitMessage({
                error: error.message,
                typeError: MessagesType.ERROR
            });
        }).finally(() => {
            GlobalActions.emitEndLoading();
        });
    }

    onSubmitActions(response) {
        return new Promise((resolve) => {
            return Utils.makeRequest(response, this.state.distributionsList, resolve);
        }).then((data) => {
            const errors = [];
            if (data.error) {
                data.error.forEach((err) => {
                    errors.push({
                        error: `Hubo un error al ${err.action} ${err.target}, debido a : ${err.extra.reason}`,
                        type: MessagesType.ERROR
                    });
                });
            }

            if (data.completed) {
                errors.push({
                    error: 'Se han guardado los datos éxitosamente.',
                    type: MessagesType.SUCCESS
                });
            }

            const dl = data.data;

            if (response.target.match(/owner/gi)) {
                return dl.getOwners((err, owners) => {
                    if (owners) {
                        this.setState({
                            owners,
                            error: errors.length > 0 ? errors : null,
                            distributionsList: dl
                        });
                    }
                });
            }

            const id = this.props.params.id;
            return Client.getDistributionList(id, (success) => {
                const dl = success;

                return this.setState({
                    error: errors.length > 0 ? errors : null,
                    distributionsList: dl,
                    members: dl.members
                });
            }, (error) => {
                return GlobalActions.emitMessage({
                    error: error.message,
                    typeError: MessagesType.ERROR
                });
            });
        }).finally(() => {
            response.reset();
        });
    }

    onDeleteMember(member) {
        if (this.isStoreEnabled) {
            DomainStore.removeMember(member);
        }

        let currentMembers = this.isStoreEnabled ? DomainStore.getMembers() : null;

        if (!currentMembers) {
            currentMembers = this.state.members.filter((target) => {
                return target !== member;
            });
        }

        this.setState({
            members: currentMembers,
            error: false
        });
    }

    onCancelMember(response) {
        if (response && response.length > 0) {
            response.forEach((member) => {
                if (this.isStoreEnabled) {
                    DomainStore.addMember(member);
                }
            });

            let newMembers = this.isStoreEnabled ? DomainStore.getMembers() : null;

            if (!newMembers) {
                newMembers = this.state.members;
                newMembers.push(...response);
            }

            this.setState({
                members: newMembers,
                error: false
            });
        }

        return null;
    }

    onDeleteOwner(owner) {
        if (this.isStoreEnabled) {
            DomainStore.removeOwner(owner);
        }

        let currentOwners = this.isStoreEnabled ? DomainStore.getOwners() : null;

        if (!currentOwners) {
            currentOwners = this.state.owners.filter((target) => {
                return target !== owner;
            });
        }

        this.setState({
            owners: currentOwners,
            error: false
        });
    }

    onCancelOwner(response) {
        if (response && response.length > 0) {
            response.forEach((member) => {
                if (this.isStoreEnabled) {
                    DomainStore.addOwners(member);
                }
            });

            let newOwners = this.isStoreEnabled ? DomainStore.getOwners() : null;
            if (!newOwners) {
                newOwners = this.state.owners;
                newOwners.push(...response);
            }

            this.setState({
                owners: newOwners,
                error: false
            });
        }

        return null;
    }

    componentDidMount() {
        EventStore.addMessageListener(this.showMessage);
        $('#sidebar-domains').addClass('active');
        this.getDistributionLists();
    }

    componentWillUnmount() {
        EventStore.removeMessageListener(this.showMessage);
        $('#sidebar-domains').removeClass('active');
    }

    render() {
        let generalData;
        let domainInfo;
        let btnsGeneralInfo = [];
        let actionTabsAllows = [];
        let actionTabsMembers = [];
        let message;
        let panelTabs;
        let isPrivate = null;

        if (this.state.distributionsList && this.state.owners) {
            const data = this.state.distributionsList;
            const domain = this.state.domain;
            const owners = this.state.owners;
            const arrayMembers = this.state.members;
            const membersFormatted = Utils.getMembers(arrayMembers, 'Miembros');

            if (owners.length > 0) {
                isPrivate = (
                    <span className='label label-danger'>
                        {'Privada'}
                    </span>
                );
            }

            generalData = (
                <div>
                    <h4>{data.name}</h4>
                    <p>{membersFormatted}</p>
                    {isPrivate}
                </div>
            );

            domainInfo = (
                <div>
                    <h4>
                        <Button
                            btnAttrs={
                                {
                                    className: 'text-success domain-name',
                                    onClick: (e) => {
                                        Utils.handleLink(e, `/domains/${domain.id}`);
                                    }
                                }
                            }
                        >
                            {`@${domain.name}`}
                        </Button>
                    </h4>
                </div>
            );

            btnsGeneralInfo = [
                {
                    props: {
                        className: 'btn btn-xs btn-default',
                        onClick: (e) => {
                            Utils.handleLink(e, `/domains/${this.props.params.domain_id}/distribution_lists/${this.props.params.id}/edit`, this.props.location);
                        }
                    },
                    label: 'Editar'
                }
            ];

            actionTabsMembers = (
                <ActionsPanel
                    name={'Miembros'}
                    data={arrayMembers}
                    onApplyChanges={(response) => {
                        this.onSubmitActions(response);
                    }}
                    hasExport={true}
                    isEmail={true}
                    onDelete={(member) => {
                        this.onDeleteMember(member);
                    }}
                    onCancel={(response) => {
                        this.onCancelMember(response);
                    }}
                    onExport={(members) => {
                        this.onExportMembers(members);
                    }}
                    nameFunc={'Members'}
                />
            );

            actionTabsAllows = (
                <ActionsPanelAllows
                    name={'Permitidos'}
                    data={owners}
                    onApplyChanges={(response) => {
                        this.onSubmitActions(response);
                    }}
                    hasExport={true}
                    isEmail={true}
                    onDelete={(owner) => {
                        this.onDeleteOwner(owner);
                    }}
                    onCancel={(response) => {
                        this.onCancelOwner(response);
                    }}
                    onExport={(allowers) => {
                        this.onExportAllowers(allowers);
                    }}
                    nameFunc={'Owner'}
                />
            );
        }

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

        const pageInfo = (
            <PageInfo
                titlePage='lista de distribución'
                descriptionPage='Para enviar correo a grupos de usuarios'
            />
        );

        const allows = (
            <Panel
                title='Permitidos'
                hasHeader={false}
                classHeader={'reset-panel'}
                children={actionTabsAllows}
            />
        );

        const members = (
            <Panel
                title='Miembres'
                hasHeader={false}
                classHeader={'reset-panel'}
                children={actionTabsMembers}
            />
        );

        let tabNamesArray = ['Miembros', 'Permitidos'];
        let tabs = {
            miembros: members,
            permitidos: allows
        };

        /*const not = false;
        //if (!this.isGlobalAdmin) {
        if (not) {
            tabNamesArray = ['Miembros'];
            tabs = {
                miembros: members
            };
        }*/

        panelTabs = (
            <PanelTab
                tabNames={tabNamesArray}
                tabs={tabs}
                location={this.props.location}
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
                                    title='Dominio'
                                    children={domainInfo}
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

DistributionLists.propTypes = {
    location: PropTypes.object,
    params: PropTypes.object
};
