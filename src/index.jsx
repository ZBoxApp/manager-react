// Copyright (c) 2016 ZBox, Spa. All Rights Reserved.
// See LICENSE.txt for license information.

import './sass/styles.scss';

import $ from 'jquery';
import React from 'react';
import ReactDOM from 'react-dom';
import {Router, Route, IndexRedirect, Redirect, browserHistory} from 'react-router';
import Root from './components/root.jsx';
import ErrorPage from './components/error_page.jsx';
import LoggedIn from './components/logged_in.jsx';
import NotLoggedIn from './components/not_logged_in.jsx';
import Login from './components/login/login.jsx';
import * as Client from './utils/client.jsx';
import * as Utils from './utils/utils.jsx';

const notFoundParams = {
    title: 'Page not found',
    message: 'The page you where trying to reach does not exist',
    link: '/',
    linkmessage: 'Back to Manager'
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

function onLoggedOut() {
    Client.logout(
        () => {
            browserHistory.push('/login');
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
                >

                    <Route
                        path='/logout'
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
    preRenderSetup(renderRootComponent);
};
