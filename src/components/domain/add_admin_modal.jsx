// Copyright (c) 2016 ZBox, Spa. All Rights Reserved.
// See LICENSE.txt for license information.

import DomainStore from '../../stores/domain_store.jsx';
import EventStore from '../../stores/event_store.jsx';

import * as GlobalActions from '../../action_creators/global_actions.jsx';
import * as Client from '../../utils/client.jsx';
import * as Utils from '../../utils/utils.jsx';

import Constants from '../../utils/constants.jsx';

import StatusLabel from '../status_label.jsx';

import {Modal} from 'react-bootstrap';

import React from 'react';
import PropTypes from 'prop-types';

export default class AddAdminModal extends React.Component {
    constructor(props) {
        super(props);

        this.isStoreEnabled = window.manager_config.enableStores;
        this.handleSearch = this.handleSearch.bind(this);
        this.handleAddAdmin = this.handleAddAdmin.bind(this);

        this.state = {
            users: null
        };

        this.plans = Object.keys(window.manager_config.plans).filter((plan) => {
            return window.manager_config.plans[plan].forRights;
        });
    }

    handleSearch(e) {
        e.preventDefault();

        const query = this.refs.searchUser.value.trim();

        if (query) {
            GlobalActions.emitStartLoading();
            Client.getAllAccounts(
                {
                    query: `mail=*${query}*`
                },
                (data) => {
                    const admins = DomainStore.getAdmins(this.props.domain);
                    let users = [];
                    if (this.isStoreEnabled && admins) {
                        if (data.account) {
                            data.account.forEach((u) => {
                                if (!admins.hasOwnProperty(u.id)) {
                                    users.push(u);
                                }
                            });
                        }
                    } else {
                        users = data.account;
                    }
                    this.setState({users});
                    GlobalActions.emitEndLoading();
                },
                (error) => {
                    this.setState({
                        error: error.message
                    });
                    GlobalActions.emitEndLoading();
                }
            );
        } else {
            this.setState({users: null});
        }
    }
    handleAddAdmin(e, user) {
        e.preventDefault();

        this.props.domain.addAdmin(
            user.id,
            this.plans,
            (error) => {
                if (error) {
                    return this.setState({
                        error: {
                            message: error.extra.reason,
                            type: Constants.MessageType.ERROR
                        }
                    });
                }

                if (this.props.show) {
                    this.props.onHide();
                    EventStore.emitToast({
                        type: 'success',
                        title: 'Dominio',
                        body: `Se ha agrega el administrador: ${user.name}, éxitosamente.`,
                        options: {
                            timeOut: 4000,
                            extendedTimeOut: 2000,
                            closeButton: true
                        }
                    });
                }

                DomainStore.emitAdminsChange();
                return this.isStoreEnabled && DomainStore.addAdmin(user) ? DomainStore.addAdmin(user) : true;
            }
        );
    }

    shouldComponentUpdate(nextProps, nextState) {
        if (!this.props.show && !nextProps.show) {
            return false;
        }

        if (!Utils.areObjectsEqual(this.props, nextProps)) {
            return true;
        }

        return !Utils.areObjectsEqual(this.state, nextState);
    }

    componentWillReceiveProps(nextProps) {
        if (!this.props.show && nextProps.show) {
            this.setState({users: null});
        } else {
            GlobalActions.emitEndLoading();
        }
    }

    render() {
        const users = this.state.users;
        let results;
        if (users) {
            if (users.length === 0) {
                results = (
                    <div style={{margin: '20px 0'}}>
                        <div className='empty-search'>
                            {'Sin resultados para tu búsqueda'}
                        </div>
                    </div>
                );
            } else {
                const rows = users.map((u) => {
                    let status = u.attrs.zimbraAccountStatus;
                    let statusClass = '';
                    switch (status) {
                    case 'locked':
                        statusClass = 'label label-warning';
                        status = 'Bloqueada';
                        break;
                    default:
                        statusClass = 'label label-success';
                        status = 'Activa';
                        break;
                    }

                    return (
                        <tr
                            key={`user-${u.id}`}
                            className='mailbox-row'
                        >
                            <td className='mailbox-status'>
                                <StatusLabel
                                    classes={statusClass}
                                    children={status}
                                />
                            </td>
                            <td className='mailbox-name'>
                                <a
                                    href='#'
                                    onClick={(e) => {
                                        Utils.handleLink(e, `/mailboxes/${u.id}`);
                                    }}
                                >
                                    {u.name}
                                </a>
                            </td>
                            <td className='mailbox-displayname'>
                                {u.attrs.givenName}
                            </td>
                            <td className='text-center'>
                                <a
                                    className='btn btn-info btn-xs'
                                    onClick={(e) => this.handleAddAdmin(e, u)}
                                >
                                    {'Activar Admin'}
                                </a>
                            </td>
                        </tr>
                    );
                });
                results = (
                    <table
                        cellPadding='1'
                        cellSpacing='1'
                        className='table table-condensed table-striped vertical-align index-mailbox-table'
                    >
                        <thead>
                        <tr>
                            <th></th>
                            <th>{'Email'}</th>
                            <th className='text-left'>{'Nombre'}</th>
                            <th className='text-center'>{' Administrador '}</th>
                        </tr>
                        </thead>
                        <tbody>
                        {rows}
                        </tbody>
                    </table>
                );
            }
        }

        return (
            <Modal
                show={this.props.show}
                onHide={this.props.onHide}
            >
                <div className='color-line'></div>
                <Modal.Header closeButton={true}>
                    <Modal.Title>
                        {'Nuevo administador de dominio'}
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <p>
                        {'El administrador debe tener una casilla de correo creada en la plataforma.'}
                        <br/>
                        {'Si no está creada, '}
                        <a
                            href='#'
                            onClick={(e) => Utils.handleLink(e, `/domains/${this.props.domain.id}/mailboxes/new`)}
                        >
                            {'la puedes crear ahora.'}
                        </a>
                    </p>
                    <div className='panel-header-search'>
                        <form onSubmit={this.handleSearch}>
                            <div className='input-group'>
                                <input
                                    type='text'
                                    ref='searchUser'
                                    className='form-control'
                                    placeholder='Buscar Por Nombre'
                                />
                                <span className='input-group-btn'>
                                    <button
                                        className='btn btn-default'
                                        type='submit'
                                    >
                                        <span className='fa fa-search'></span>
                                    </button>
                                </span>
                            </div>
                        </form>
                    </div>
                    {results}
                </Modal.Body>
                <Modal.Footer>
                    <button
                        type='button'
                        className='btn btn-default'
                        onClick={this.props.onHide}
                    >
                        {'Cancelar'}
                    </button>
                </Modal.Footer>
            </Modal>
        );
    }
}

AddAdminModal.propTypes = {
    show: PropTypes.bool.isRequired,
    onHide: PropTypes.func.isRequired,
    domain: PropTypes.object.isRequired
};
