// Copyright (c) 2016 ZBox, Spa. All Rights Reserved.
// See LICENSE.txt for license information.

import * as GlobalActions from '../action_creators/global_actions.jsx';
import UserStore from '../stores/user_store.jsx';

import React from 'react';
import PropTypes from 'prop-types';
import {browserHistory, Link} from 'react-router';

export default class SidebarMenu extends React.Component {
    constructor(props) {
        super(props);
        this.handleLink = this.handleLink.bind(this);
        this.openSupportModal = this.openSupportModal.bind(this);
    }

    handleLink(e, path) {
        e.preventDefault();
        if (`/${this.props.location.pathname}` !== path) {
            GlobalActions.emitStartLoading();
            browserHistory.push(path);
        }
    }

    openSupportModal(e) {
        e.preventDefault();
        const user = UserStore.getCurrentUser();

        const name = user.attrs._attrs.displayName ? user.attrs._attrs.displayName : `${user.attrs._attrs.givenName || user.attrs._attrs.cn} ${user.attrs._attrs.sn}`;

        window.HS.beacon.identify({
            name,
            email: user.name
        });
        window.HS.beacon.open();
    }

    makeCompanyLink() {
      const link = { text: 'Empresas', path: '/companies' };
      if (!UserStore.isGlobalAdmin()) {
        const user = UserStore.getCurrentUser();
        link.text = 'Mi Empresa';
        link.path = `/companies/${user.company_id}`;
      }
      return link;
    }

    render() {
        const companyLink = this.makeCompanyLink();
        return (
            <ul
                className='nav'
                id='side-menu'
            >
                <li id='sidebar-companies'>
                    <a
                        href='#'
                        onClick={(e) => this.handleLink(e, companyLink.path)}
                    >
                        <span className='nav-label'>{companyLink.text}</span>
                    </a>
                </li>
                <li id='sidebar-domains'>
                    {/* <a
                        href='#'
                        onClick={(e) => this.handleLink(e, '/domains')}
                    >
                        <span className='nav-label'>{'dominios'}</span>
                    </a> */}
                    <Link
                        className={'nav-label'}
                        to='/domains'
                    >
                        Dominios
                    </Link>
                </li>
                <li id='sidebar-mailboxes'>
                    <Link
                        className={'nav-label'}
                        to='/mailboxes'
                    >
                        Casillas
                    </Link>
                </li>
                <li>
                    <a
                        className='nav-label'
                        target='_blank'
                        href='http://ayuda.zboxapp.com'
                    >
                        {'Documentación'}
                    </a>
                </li>
                <li>
                    <a
                        className='nav-label'
                        href='#'
                        onClick={this.openSupportModal}
                    >
                        {'Soporte'}
                    </a>
                </li>
                {UserStore.isGlobalAdmin() && (
                    <li>
                        <Link
                            className={'nav-label'}
                            to='/deleteMassive'
                        >
                            Borrado Masivo
                        </Link>
                    </li>
                )}
                <li>
                    <Link
                        to='/logout'
                    >
                        Cerrar Sesión
                    </Link>
                </li>
            </ul>
        );
    }
}

SidebarMenu.propTypes = {
    location: PropTypes.object.isRequired
};
