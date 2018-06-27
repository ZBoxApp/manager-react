// Copyright (c) 2016 ZBox, Spa. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import PropTypes from 'prop-types';
import sweetAlert from 'sweetalert';

import DomainStore from '../../stores/domain_store.jsx';
import UserStore from '../../stores/user_store.jsx';

import MessageBar from '../message_bar.jsx';
import Panel from '../panel.jsx';
import ToggleModalButton from '../toggle_modal_button.jsx';
import AddAdminModal from './add_admin_modal.jsx';

import * as Utils from '../../utils/utils.jsx';
import * as Client from '../../utils/client.jsx';

//import Constants from '../../utils/constants.jsx';

export default class DomainAdminList extends React.Component {
    constructor(props) {
        super(props);

        this.isStoreEnabled = window.manager_config.enableStores;
        this.getAdmins = this.getAdmins.bind(this);
        this.handleRemoveAdmin = this.handleRemoveAdmin.bind(this);
        this.onAdminsChange = this.onAdminsChange.bind(this);
        this.isGlobalAdmin = UserStore.isGlobalAdmin();
        this.state = this.getStateFromStores();
    }

    getStateFromStores() {
        const admins = this.isStoreEnabled ? DomainStore.getAdmins(this.props.domain) : [];
        return {
            admins,
            loading: false
        };
    }

    getAdmins() {
        const { domain } = this.props;
        this.setState({ loading: true });

        if (domain) {
            return Client.getAdminByDomainName(domain.name, 'givenName, displayName, sn, cn').then(({ account, searchTotal }) => {
                const admins = searchTotal > 0 ? account : [];
                this.setState({ admins, loading: false });
            }).catch(() => this.setState({ loading: false }));
        }

        return Client.getDomain(domain.name, (data) => {
            Client.getAdminByDomainName(data.name).then(({ account, searchTotal }) => {
                const admins = searchTotal > 0 ? account : [];
                this.setState({ admins, loading: false });
            }).catch();
        }, (err) => {
            this.setState({ loading: false });
            return err;
        });
    }

    handleRemoveAdmin(e, admin) {
        e.preventDefault();

        const response = {
            title: 'Se ha borrado con éxito',
            type: 'success'
        };

        sweetAlert({
                title: 'Borrar Administrador de Dominio',
                text: `¿Seguro quieres eliminar a ${admin.name} como administrador del dominio?`,
                type: 'info',
                showCancelButton: true,
                confirmButtonColor: '#DD6B55',
                confirmButtonText: 'Si, deseo borrarlo!',
                closeOnConfirm: false,
                showLoaderOnConfirm: true
            },
            (isDeleted) => {
                if (isDeleted) {
                    const { id } = admin;
                    const { admins } = this.state;

                    Client.revokeAdmin(id).then(() => {
                        // let's remove the admin for state to avoid search it into api
                        const nextAdmins = admins.filter((admin) => admin.id !== id);
                        this.setState({ admins: nextAdmins });
                        return sweetAlert(response);
                    }).catch(() => {
                        response.title = 'Ha ocurrido un error.';
                        response.type = 'error';
                        response.confirmButtonText = 'Intentar de nuevo';
                        response.confirmButtonColor = '#DD6B55';

                        return sweetAlert(response);
                    });
                }
            }
        );
    }

    onAdminsChange() {
        const admins = this.isStoreEnabled ? DomainStore.getAdmins(this.props.domain) : null;
        if (!admins) {
            return this.getAdmins();
        }

        return this.setState({ admins });
    }

    componentDidMount() {
        DomainStore.addAdminsChangeListener(this.onAdminsChange);

        if (Array.isArray(this.state.admins) && this.state.admins.length === 0) {
            this.getAdmins();
        }
    }

    componentWillUnmount() {
        DomainStore.removeAdminsChangeListener(this.onAdminsChange);
    }

    render() {
        let btnAddNewAdmin = null;

        if (this.state.loading) {
            return <div>{'Cargando Administradores...'}</div>;
        }

        let messageBar;
        if (this.state.error) {
            const error = this.state.error;
            messageBar = (
                <MessageBar
                    message={error.message}
                    type={error.type}
                    canClose={true}
                    autoclose={true}
                    autocloseInSecs={5}
                />
            );
        }

        const domain = this.props.domain;
        const adminRows = this.state.admins.map((a) => {
            const name = a.attrs.displayName || `${a.attrs.givenName || a.attrs.cn} ${a.attrs.sn}`;
            return (
                <tr
                    key={`admin-${a.id}`}
                    className='user-row'
                >
                    <td className='user-email'>
                        {a.name}
                    </td>
                    <td className='user-name text-center'>
                        {name}
                    </td>
                    <td className='user-type text-center'>
                    </td>
                    {this.isGlobalAdmin && (
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
                    )}
                </tr>
            );
        });

        //if (this.isGlobalAdmin) {
        const go = true;
        if (go) {
            btnAddNewAdmin = (
                <ToggleModalButton
                    role='button'
                    className='btn btn-default'
                    dialogType={AddAdminModal}
                    dialogProps={{domain}}
                >
                    {'Agregar administrador'}
                </ToggleModalButton>
            );
        }
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
                            {this.isGlobalAdmin && (
                                <th className='text-center'>{'Acciones'}</th>
                            )}
                        </tr>
                        </thead>
                        <tbody>
                        {adminRows}
                        </tbody>
                    </table>
                    {btnAddNewAdmin}
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
                error={messageBar}
            />
        );
    }
}

DomainAdminList.propTypes = {
    domain: PropTypes.object.isRequired,
    location: PropTypes.object.isRequired
};
