// Copyright (c) 2016 ZBox, Spa. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {Link} from 'react-router';

export default class SidebarMenu extends React.Component {
    render() {
        return (
            <ul
                className='nav'
                id='side-menu'
            >
                <li id='sidebar-dashboards'>
                    <Link to='/dashboards'>
                        <span className='nav-label'>{'dashboards'}</span>
                    </Link>
                </li>
                <li id='sidebar-accounts'>
                    <Link to='/accounts'>
                        <span className='nav-label'>{'cuentas'}</span>
                    </Link>
                </li>
                <li ref='sidebar-domains'>
                    <Link to='/domains'>
                        <span className='nav-label'>{'dominios'}</span>
                    </Link>
                </li>
                <li ref='sidebar-mailboxes'>
                    <Link to='/mailboxes'>
                        <span className='nav-label'>{'casillas'}</span>
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
            </ul>
        );
    }
}
