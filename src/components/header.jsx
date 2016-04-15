// Copyright (c) 2016 ZBox, Spa. All Rights Reserved.
// See LICENSE.txt for license information.

import $ from 'jquery';
import React from 'react';
import ReactDOM from 'react-dom';
import * as GlobalActions from '../action_creators/global_actions.jsx';

import {browserHistory, Link} from 'react-router';
import logo from '../images/logo.png';

export default class Header extends React.Component {
    constructor(props) {
        super(props);
        this.handleSearch = this.handleSearch.bind(this);
        this.toggleSidebar = this.toggleSidebar.bind(this);
    }
    handleSearch(e) {
        e.preventDefault();
        const search = ReactDOM.findDOMNode(this.refs.query);
        const term = search.value.trim();
        const utf8 = ReactDOM.findDOMNode(this.refs.utf8).value.trim();
        search.value = '';
        GlobalActions.emitStartLoading();
        browserHistory.push(`search/global?utf8=${utf8}&query=${encodeURIComponent(term)}`);
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
                <nav role='navigation'>
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
                                >
                                    <i className='fa fa-sign-out'></i>
                                </Link>
                            </li>
                        </ul>
                    </div>
                </nav>
            </div>
        );
    }
}
