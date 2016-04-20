// Copyright (c) 2016 ZBox, Spa. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';

import DomainStore from '../../stores/domain_store.jsx';

import Panel from '../panel.jsx';
import ToggleModalButton from '../toggle_modal_button.jsx';
import AddAdminModal from './add_admin_modal.jsx';

// import * as Client from '../../utils/client.jsx';
import * as Utils from '../../utils/utils.jsx';

export default class DomainAdminList extends React.Component {
    constructor(props) {
        super(props);

        this.getAdmins = this.getAdmins.bind(this);
        this.handleRemoveAdmin = this.handleRemoveAdmin.bind(this);
        this.onAdminsChange = this.onAdminsChange.bind(this);
        this.state = this.getStateFromStores();
    }
    getStateFromStores() {
        const admins = DomainStore.getAdmins(this.props.domain);
        return {
            admins
        };
    }
    getAdmins() {
        const domain = this.props.domain;
        domain.getAdmins((err, admins) => {
            DomainStore.setAdmins(domain, admins);
            this.setState({admins});
        });
    }
    handleRemoveAdmin(e, admin) {
        e.preventDefault();
        if (confirm(`¿Seguro quieres eliminar a ${admin.name} como administrador del dominio?`)) { //eslint-disable-line no-alert
            // previo a esto hay que remover el usuario como admin del dominio
            DomainStore.removeAdmin(admin.id);
        }
    }
    onAdminsChange() {
        const admins = DomainStore.getAdmins(this.props.domain);
        if (!admins) {
            return this.getAdmins();
        }

        return this.setState({admins});
    }
    componentDidMount() {
        DomainStore.addAdminsChangeListener(this.onAdminsChange);

        if (!this.state.admins) {
            this.getAdmins();
        }
    }
    componentWillUnmount() {
        DomainStore.removeAdminsChangeListener(this.onAdminsChange);
    }
    render() {
        if (!this.state.admins) {
            return <div/>;
        }

        const domain = this.props.domain;
        const adminRows = this.state.admins.map((a) => {
            return (
                <tr
                    key={`admin-${a.id}`}
                    className='user-row'
                >
                    <td className='user-email'>
                        {a.name}
                    </td>
                    <td className='user-name text-center'>
                        {a.attrs.givenName}
                    </td>
                    <td className='user-type text-center'>
                    </td>
                    <td className='user-actions text-center'>
                        <ul className='list-inline list-unstyled'>
                            <li>
                                <a
                                    className='btn btn-default btn-xs'
                                    onClick={(e) => Utils.handleLink(e, `/mailboxes/${a.id}/edit`, this.props.location)}
                                >
                                    {'Editar'}
                                </a>
                            </li>
                            <li>
                                <a
                                    className='btn btn-danger btn-xs'
                                    onClick={(e) => this.handleRemoveAdmin(e, a)}
                                >
                                    {'Eliminar'}
                                </a>
                            </li>
                        </ul>
                    </td>
                </tr>
            );
        });

        let adminContent;
        if (adminRows.length > 0) {
            adminContent = (
                <div className='table-responsive'>
                    <table
                        id='index-users'
                        cellPadding='1'
                        cellSpacing='1'
                        className='table table-condensed table-striped vertical-align'
                    >
                        <thead>
                        <tr>
                            <th>{'email'}</th>
                            <th className='text-center'>{'Nombre'}</th>
                            <th></th>
                            <th className='text-center'>{'Acciones'}</th>
                        </tr>
                        </thead>
                        <tbody>
                        {adminRows}
                        </tbody>
                    </table>
                    <ToggleModalButton
                        role='button'
                        className='btn btn-default'
                        dialogType={AddAdminModal}
                        dialogProps={{domain}}
                    >
                        {'Agregar administrador'}
                    </ToggleModalButton>
                </div>
            );
        } else {
            adminContent = (
                <div className='empty-message'>
                    <h4>
                        {'No existen Administradores. '}
                        <ToggleModalButton
                            role='button'
                            dialogType={AddAdminModal}
                            dialogProps={{domain}}
                        >
                            {'Agregar administrador'}
                        </ToggleModalButton>
                    </h4>
                </div>
            );
        }

        return (
            <Panel
                hasHeader={false}
                children={adminContent}
            />
        );
    }
}

DomainAdminList.propTypes = {
    domain: React.PropTypes.object.isRequired,
    location: React.PropTypes.object.isRequired
};
