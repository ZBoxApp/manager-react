// Copyright (c) 2016 ZBox, Spa. All Rights Reserved.
// See LICENSE.txt for license information.

import $ from 'jquery';
import React from 'react';

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
import Constants from '../../utils/constants.jsx';

const MessagesType = Constants.MessageType;

export default class DistributionLists extends React.Component {
    constructor(props) {
        super(props);

        this.getDistributionLists = this.getDistributionLists.bind(this);
        this.showMessage = this.showMessage.bind(this);
        this.onDeleteMember = this.onDeleteMember.bind(this);
        this.onDeleteOwner = this.onDeleteOwner.bind(this);
        this.onSubmitMembers = this.onSubmitMembers.bind(this);
        this.onCancelMember = this.onCancelMember.bind(this);
        this.onCancelOwner = this.onCancelOwner.bind(this);
        this.domain = null;

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

    getDistributionLists() {
        const id = this.props.params.id;
        const response = {};
        const domain = DomainStore.getCurrent();

        return new Promise((resolve, reject) => {
            if (domain) {
                response.domain = domain;
                const dl = DomainStore.getDistributionListById(id, domain);
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
                const domainId = this.props.params.domain_id;

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
            DomainStore.setOwners(Utils.getOwners(data.owners));
            DomainStore.setMembers(data.distributionsList.members);

            this.setState({
                distributionsList: data.distributionsList,
                members: DomainStore.getMembers(),
                owners: DomainStore.getOwners(),
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

    onSubmitOwners(response) {
        if (response.refresh) {
            response.refresh.forEach((member) => {
                DomainStore.addOwners(member);
            });
        }

        this.multipleActionsOwners(response, this.state.distributionsList).then((res) => {
            const newOwners = DomainStore.getOwners();
            const errors = [];
            const limit = res.length;

            for (let i = 0; i < limit; i++) {
                const items = res[i];
                if (items.error) {
                    const action = (items.action === 'remove') ? 'eliminar' : 'agregar';
                    errors.push({
                        error: `Hubo un error al ${action} ${items.item}, debido a : ${items.error.extra.reason}`,
                        type: MessagesType.ERROR
                    });
                }
            }

            if (errors.length !== limit) {
                errors.push({
                    error: 'Se han guardado los datos para permitidos éxitosamente.',
                    type: MessagesType.SUCCESS
                });
            }

            this.setState({
                owners: newOwners,
                error: errors
            });

            response.reset();
        });
    }

    onSubmitMembers(response) {
        if (response.refresh) {
            response.refresh.forEach((member) => {
                DomainStore.addMember(member);
            });
        }

        this.multipleActionsMembers(response, this.state.distributionsList).then((res) => {
            const newMembers = DomainStore.getMembers();
            const errors = [];
            const limit = res.length;

            for (let i = 0; i < limit; i++) {
                const items = res[i];
                if (items.error) {
                    const action = (items.action === 'remove') ? 'eliminar' : 'agregar';
                    errors.push({
                        error: `Hubo un error al ${action} ${items.item}, debido a : ${items.error.extra.reason}`,
                        type: MessagesType.ERROR
                    });
                }
            }

            if (errors.length !== limit) {
                errors.push({
                    error: 'Se han guardado los datos para miembros éxitosamente.',
                    type: MessagesType.SUCCESS
                });
            }

            this.setState({
                members: newMembers,
                error: errors
            });

            response.reset();
        });
    }

    multipleActionsMembers(response, account) {
        const promises = [];
        if (response.add || response.remove) {
            if (response.add) {
                const add = new Promise((resolve) => {
                    account.addMembers(response.add, (error) => {
                        const res = {};
                        if (error) {
                            res.isCompleted = false;
                            res.action = 'add';
                            res.error = error;

                            return resolve(res);
                        }

                        response.add.forEach((member) => {
                            DomainStore.addMember(member);
                        });

                        res.isCompleted = true;
                        res.action = 'add';

                        return resolve(res);
                    });
                });

                promises.push(add);
            }

            if (response.remove) {
                const remove = new Promise((resolve) => {
                    account.removeMembers(response.remove, (error) => {
                        const res = {};
                        if (error) {
                            res.isCompleted = false;
                            res.action = 'remove';
                            res.error = error;

                            return resolve(res);
                        }

                        response.remove.forEach((member) => {
                            DomainStore.removeMember(member);
                        });

                        res.isCompleted = true;
                        res.action = 'remove';

                        return resolve(res);
                    });
                });

                promises.push(remove);
            }
        }
        return Promise.all(promises);
    }

    multipleActionsOwners(response, account) {
        const promises = [];

        for (const key in response) {
            if (response.hasOwnProperty(key) && key === 'add') {
                const array = response[key];
                const limit = array.length;

                for (let index = 0; index < limit; index++) {
                    const res = {};
                    const promesa = new Promise((resolve) => {
                        account.addOwner(array[index], (error) => {
                            if (error) {
                                res.isCompleted = false;
                                res.item = response[key][index];
                                res.action = key;
                                res.error = error;
                            } else {
                                res.isCompleted = true;
                                res.item = response[key][index];
                                res.action = key;
                                DomainStore.addOwners(response[key][index]);
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
                        account.removeOwner(array[index], (error) => {
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

    onDeleteMember(member) {
        DomainStore.removeMember(member);
        const currentMembers = DomainStore.getMembers();

        this.setState({
            members: currentMembers,
            error: false
        });
    }

    onCancelMember(response) {
        if (response && response.length > 0) {
            response.forEach((member) => {
                DomainStore.addMember(member);
            });

            const newMembers = DomainStore.getMembers();

            this.setState({
                members: newMembers,
                error: false
            });
        }

        return null;
    }

    onDeleteOwner(owner) {
        DomainStore.removeOwner(owner);
        const currentOwners = DomainStore.getOwners();

        this.setState({
            owners: currentOwners,
            error: false
        });
    }

    onCancelOwner(response) {
        if (response && response.length > 0) {
            response.forEach((member) => {
                DomainStore.addOwners(member);
            });

            const newOwners = DomainStore.getOwners();

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
            const membersFormatted = Utils.getMembers(data.members, 'Miembros');

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
                        this.onSubmitMembers(response);
                    }}
                    hasExport={true}
                    isEmail={true}
                    onDelete={(member) => {
                        this.onDeleteMember(member);
                    }}
                    onCancel={(response) => {
                        this.onCancelMember(response);
                    }}
                />
            );

            actionTabsAllows = (
                <ActionsPanelAllows
                    name={'Permitidos'}
                    data={owners}
                    onApplyChanges={(response) => {
                        this.onSubmitOwners(response);
                    }}
                    hasExport={true}
                    isEmail={true}
                    onDelete={(owner) => {
                        this.onDeleteOwner(owner);
                    }}
                    onCancel={(response) => {
                        this.onCancelOwner(response);
                    }}
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

        panelTabs = (
            <PanelTab
                tabNames={['Miembros', 'Permitidos']}
                tabs={{
                    miembros: members,
                    permitidos: allows
                }}
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
    location: React.PropTypes.object,
    params: React.PropTypes.object
};
