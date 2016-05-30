// Copyright (c) 2016 ZBox, Spa. All Rights Reserved.
// See LICENSE.txt for license information.

import * as GlobalActions from '../action_creators/global_actions.jsx';
import UserStore from '../stores/user_store.jsx';

import React from 'react';
import {browserHistory} from 'react-router';

export default class SidebarMenu extends React.Component {
    constructor(props) {
        super(props);
        this.handleLink = this.handleLink.bind(this);
    }
    handleLink(e, path) {
        e.preventDefault();
        if (`/${this.props.location.pathname}` !== path) {
            GlobalActions.emitStartLoading();
            browserHistory.push(path);
        }
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
                    <a
                        href='#'
                        onClick={(e) => this.handleLink(e, '/domains')}
                    >
                        <span className='nav-label'>{'dominios'}</span>
                    </a>
                </li>
                <li id='sidebar-mailboxes'>
                    <a
                        href='#'
                        onClick={(e) => this.handleLink(e, '/mailboxes')}
                    >
                        <span className='nav-label'>{'casillas'}</span>
                    </a>
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
            </ul>
        );
    }
}

SidebarMenu.propTypes = {
    location: React.PropTypes.object.isRequired
};
