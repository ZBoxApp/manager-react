// Copyright (c) 2016 ZBox, Spa. All Rights Reserved.
// See LICENSE.txt for license information.

import $ from 'jquery';
import React from 'react';
import {Link} from 'react-router';
import ReactDOM from 'react-dom';
import * as GlobalActions from '../action_creators/global_actions.jsx';

import * as Utils from '../utils/utils.jsx';
import logo from '../images/logo.png';

export default class Header extends React.Component {
    constructor(props) {
        super(props);
        this.handleSearch = this.handleSearch.bind(this);
        this.toggleSidebar = this.toggleSidebar.bind(this);
    }

    handleSearch(e) {
        //browserHistory.push(`search/?utf8=${utf8}&query=${encodeURIComponent(term)}`);
        //const utf8 = ReactDOM.findDOMNode(this.refs.utf8).value.trim();
        e.preventDefault();
        const search = ReactDOM.findDOMNode(this.refs.query);
        const term = search.value.trim();
        search.value = '';
        GlobalActions.emitStartLoading();
        Utils.handleLink(e, `/search/${encodeURIComponent(term)}`);
    }

    toggleSidebar() {
        $('body').toggleClass('hide-sidebar').toggleClass('show-sidebar');
    }

    render() {
        return (
            <div id='header'>
                <div className='color-line'></div>
                <div
                    id='logo'
                    className='light-version'
                >
                    <img
                        title='ZBox Manager'
                        className='logo'
                        src={logo}
                        alt='ZBox Manager'
                    />
                </div>
                <nav
                    role='navigation'
                    className='overflow'
                >
                    <div
                        className='header-link hide-menu'
                        onClick={() => this.toggleSidebar()}
                    >
                        <i className='fa fa-bars'></i>
                    </div>
                    <div className='small-logo'>
                        <span className='text-primary'>
                            {'ZBox Manager'}
                        </span>
                    </div>

                    <div className='overflow'>
                        <form
                            className='navbar-form-custom'
                            acceptCharset='UTF-8'
                            onSubmit={(e) => this.handleSearch(e)}
                        >
                            <input
                                ref='utf8'
                                name='utf8'
                                type='hidden'
                                value='✓'
                            />
                            <input
                                ref='query'
                                type='text'
                                name='query'
                                id='query'
                                placeholder='Buscar'
                                autoComplete='off'
                                className='form-control'
                            />
                        </form>

                        <div className='navbar-right'>
                            <ul className='nav navbar-nav no-borders'>
                                <li className='dropdown'>
                                    <Link
                                        to='/logout'
                                        title='Cerrar Sesión'
                                    >
                                        <i className='fa fa-sign-out'></i>
                                    </Link>
                                </li>
                            </ul>
                        </div>
                    </div>
                </nav>
            </div>
        );
    }
}
