// Copyright (c) 2016 ZBox, Spa. All Rights Reserved.
// See LICENSE.txt for license information.

import './sass/styles.scss';

import Root from './components/root.jsx';
import ErrorPage from './components/error_page.jsx';
import LoggedIn from './components/logged_in.jsx';
import NotLoggedIn from './components/not_logged_in.jsx';
import Login from './components/login/login.jsx';
import Accounts from './components/accounts.jsx';

import * as Client from './utils/client.jsx';
import * as Utils from './utils/utils.jsx';

import $ from 'jquery';
import React from 'react';
import ReactDOM from 'react-dom';
import {Router, Route, IndexRedirect, Redirect, browserHistory} from 'react-router';

const notFoundParams = {
    title: 'Página no encontrada',
    message: 'La página que estás intentando acceder no existe',
    link: '/',
    linkmessage: 'Volver a Manager'
};

function preRenderSetup(callwhendone) {
    const d1 = Client.getClientConfig(
        (data) => {
            if (!data) {
                return;
            }

            global.window.manager_config = data;

            if (data.debug) {
                global.window.Zimbra = Client;
                global.window.Utils = Utils;
            }
        },
        (err) => {
            console.error(err); //eslint-disable-line no-console
        }
    );

    $.when(d1).done(callwhendone);
}

function onPreLoggedIn(nextState, replace, callback) {
    Client.isLoggedIn((data) => {
        if (!data || !data.logged_in) {
            return browserHistory.push('/login');
        }
        return callback();
    });
}

function onLoggedOut(nextState, replace) {
    Client.logout(
        () => {
            replace({
                pathname: '/login'
            });
        }
    );
}

function renderRootComponent() {
    ReactDOM.render((
        <Router
            history={browserHistory}
        >
            <Route
                path='/'
                component={Root}
            >
                <Route
                    path='error'
                    component={ErrorPage}
                />
                <Route
                    component={LoggedIn}
                    onEnter={onPreLoggedIn}
                >
                    <Route
                        path='accounts'
                        component={Accounts}
                    />
                    <Route
                        path='search/global'
                    />
                    <Route
                        path='logout'
                        onEnter={onLoggedOut}
                    />
                </Route>
                <Route component={NotLoggedIn}>
                    <IndexRedirect to='login'/>
                    <Route
                        path='login'
                        component={Login}
                    />
                    <Redirect
                        from='*'
                        to='/error'
                        query={notFoundParams}
                    />
                </Route>
            </Route>
        </Router>
    ),
        document.getElementById('root'));
}

global.window.setup_root = () => {
    // Do the pre-render setup and call renderRootComponent when done
    // preRenderSetup(renderRootComponent);];
    // Do the pre-render setup and call renderRootComponent when done
    preRenderSetup(renderRootComponent);
};
