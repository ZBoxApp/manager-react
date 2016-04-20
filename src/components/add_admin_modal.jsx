// Copyright (c) 2016 ZBox, Spa. All Rights Reserved.
// See LICENSE.txt for license information.

import * as GlobalActions from '../action_creators/global_actions.jsx';
import * as Utils from '../utils/utils.jsx';

import StatusLabel from '../components/status_label.jsx';

import {Modal} from 'react-bootstrap';

import React from 'react';

export default class AddAdminModal extends React.Component {
    constructor(props) {
        super(props);

        this.handleSearch = this.handleSearch.bind(this);
        this.handleAddAdmin = this.handleAddAdmin.bind(this);

        this.state = {
            users: null
        };
    }

    handleSearch(e) {
        e.preventDefault();

        const query = this.refs.searchUser.value.trim();

        GlobalActions.emitStartLoading();
        if (query) {
            this.setState({users: []});
        } else {
            this.setState({users: null});
        }
    }
    handleAddAdmin(e, user) {
        e.preventDefault();
        console.log(user); //eslint-disable-line no-console
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
                    const statusClass = 'mailbox-active'; //esto debe ser dependiendo del status que tenga el usuario
                    return (
                        <tr
                            key={`user-${u.id}`}
                            className='mailbox-row'
                        >
                            <td className='mailbox-status'>
                                <StatusLabel
                                    classes={`label-mailbox ${statusClass}`}
                                    children={u.status}
                                />
                            </td>
                            <td className='mailbox-name'>
                                <a
                                    href='#'
                                    onClick={(e) => {
                                        Utils.handleLink(e, `/mailboxes/${u.id}`);
                                    }}
                                >
                                    {u.email}
                                </a>
                            </td>
                            <td className='mailbox-displayname'>
                                {u.givenName}
                            </td>
                            <td className='text-center'>
                                <a
                                    className='btn btn-warning btn-xs'
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
    show: React.PropTypes.bool.isRequired,
    onHide: React.PropTypes.func.isRequired,
    domain: React.PropTypes.object.isRequired
};
