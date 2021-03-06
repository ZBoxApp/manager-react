// Copyright (c) 2016 ZBox, Spa. All Rights Reserved.
// See LICENSE.txt for license information.

import './sass/styles.scss';

import UserStore from './stores/user_store.jsx';

import Root from './components/root.jsx';
import ErrorPage from './components/error_page.jsx';
import LoggedIn from './components/logged_in.jsx';
import NotLoggedIn from './components/not_logged_in.jsx';
import Login from './components/login/login.jsx';
import Companies from './components/companies/companies.jsx';
import Company from './components/companies/company_details.jsx';
import Domains from './components/domain/domains.jsx';
import DomainDetails from './components/domain/domain_details.jsx';
import CreateDomains from './components/domain/create_domain.jsx';
import EditDomains from './components/domain/edit_domain.jsx';
import Mailboxes from './components/mailbox/mailbox.jsx';
import MailboxDetails from './components/mailbox/mailbox_details.jsx';
import CreateMailBox from './components/mailbox/create_mailbox.jsx';
import EditMailBox from './components/mailbox/edit_mailbox.jsx';
import DistributionLists from './components/distribution/distribution_lists.jsx';
import EditDistributionList from './components/distribution/edit_distribution_lists.jsx';
import SearchView from './components/search/search.jsx';
import SalesForm from './components/sales/sales.jsx';
import TemplateError from './components/404/404.jsx';
import DeleteMassive from './components/massive/masive_delete.jsx';

import * as Client from './utils/client.jsx';
import * as Utils from './utils/utils.jsx';
import Constants from './utils/constants.jsx';

import $ from 'jquery';
import React from 'react';
import ReactDOM from 'react-dom';
import {Router, Route, IndexRedirect, Redirect, browserHistory} from 'react-router';

import ZimbraStore from './stores/zimbra_store.jsx';

const notFoundParams = {
    title: 'Página no encontrada',
    message: 'La página que estás intentando acceder no existe',
    link: '/',
    linkmessage: 'Volver a Manager'
};

function preRenderSetup(callwhendone) {
    const d1 = Client.getClientConfig(
        (data) => {
            const config = data.result || data;

            if (!config) {
                return;
            }

            global.window.manager_config = config;

            if (config.debug) {
                global.window.Client = Client;
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

        if (UserStore.getCurrentUser()) {
            return callback();
        }

        return Client.getMe(
            () => {
                if (global.window.manager_config.debug) {
                    global.window.Zimbra = ZimbraStore.getCurrent();
                }

                Client.getAllCos(
                    (cosData) => {
                        ZimbraStore.setAllCos(cosData);
                        return callback();
                    }
                );
            },
            (err) => {
                let query;
                if (err.extra && err.extra.code === Constants.ZimbraCodes.AUTH_EXPIRED) {
                    query = `?error=${Constants.ZimbraCodes.AUTH_EXPIRED}`;
                }
                browserHistory.push(`/login${query}`);
            });
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
                        component={TemplateError || ErrorPage}
                    />
                    <Route
                        component={LoggedIn}
                        onEnter={onPreLoggedIn}
                    >
                        <Route
                            path='domains'
                            component={Domains}
                        />
                        <Route
                            path='domains/new'
                            component={CreateDomains}
                        />
                        <Route
                            path='domains/:id'
                            component={DomainDetails}
                        />
                        <Route
                            path='domains/:id/mailboxes/new'
                            component={CreateMailBox}
                        />
                        <Route
                            path='domains/:id/edit'
                            component={EditDomains}
                        />
                        <Route
                            path='domains/:domain_id/mailboxes'
                            component={Mailboxes}
                        />
                        <Route
                            path='domains/:domain_id/mailboxes/:id'
                            component={MailboxDetails}
                        />
                        <Route
                            path='domains/:domain_id/mailboxes/:id/edit'
                            component={EditMailBox}
                        />
                        <Route
                            path='domains/:domain_id/distribution_lists/:id'
                            component={DistributionLists}
                        />
                        <Route
                            path='domains/:domain_id/distribution_lists/:id/edit'
                            component={EditDistributionList}
                        />

                        <Route
                            path='companies'
                            component={Companies}
                        />
                        <Route
                            path='companies/:id'
                            component={Company}
                        />
                        <Route
                            path='companies/:id/domains/new'
                            component={CreateDomains}
                        />

                        <Route
                            path='mailboxes'
                            component={Mailboxes}
                        />

                        <Route
                            path='mailboxes/new'
                            component={CreateMailBox}
                        />

                        <Route
                            path='mailboxes/:id/edit'
                            component={EditMailBox}
                        />

                        <Route
                            path='mailboxes/:id'
                            component={MailboxDetails}
                        />

                        <Route
                            path='logout'
                            onEnter={onLoggedOut}
                        />

                        <Route
                            path='search/:query'
                            component={SearchView}
                        />

                        <Route
                            path='sales/:domainId/mailboxes'
                            component={SalesForm}
                        />

                        <Route
                            path='/deleteMassive'
                            component={DeleteMassive}
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
